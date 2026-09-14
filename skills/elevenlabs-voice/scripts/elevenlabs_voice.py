#!/usr/bin/env python3
"""Safe ElevenLabs TTS and speech-to-speech helper."""

from __future__ import annotations

import argparse
import getpass
import hashlib
import importlib.metadata
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping, Sequence, TextIO


API_BASE = "https://api.elevenlabs.io"
KEY_ENV = "ELEVENLABS_API_KEY"
KEYCHAIN_SERVICE = "rbuild-elevenlabs"
CONFIG_DIR = Path.home() / ".config" / "elevenlabs-voice"
CONFIG_FILE = CONFIG_DIR / "config.json"
REQUEST_OPTIONS = {"max_retries": 0, "timeout_in_seconds": 30}

KEY_RE = re.compile(r"sk_[A-Za-z0-9_-]{20,200}\Z")
KEY_ARGUMENT_RE = re.compile(r"(?<![A-Za-z0-9_])sk_[A-Za-z0-9_-]{20,}", re.IGNORECASE)
VOICE_ID_RE = re.compile(r"[A-Za-z0-9_-]{3,256}\Z")
MODEL_ID_RE = re.compile(r"[A-Za-z0-9_.:-]{2,256}\Z")
VERSION_RE = re.compile(r"(?:^|[-_.])v[0-9]{2,}(?:[-_.]|$)", re.IGNORECASE)
TOKEN_RE = re.compile(r"[\x21-\x7e]{1,4096}\Z")
SAFE_STATUS_RE = re.compile(r"[a-z][a-z0-9_-]{0,63}\Z")
SAFE_PERMISSIONS = frozenset({
    "voices_read", "user_read", "models_read", "text_to_speech", "speech_to_speech",
})
MESSAGE_PERMISSION_RE = re.compile(
    r"\b(?:permission|scope)\s+[`'\"]?([a-z][a-z0-9_.:-]{1,63})",
    re.IGNORECASE,
)

EXIT_LOCAL = 2
EXIT_AUTH = 3
EXIT_QUOTA = 4
EXIT_NETWORK = 5
EXIT_PROVIDER = 6


class SkillError(RuntimeError):
    def __init__(self, code: str, message: str, exit_code: int = EXIT_LOCAL):
        super().__init__(message)
        self.code = code
        self.message = message
        self.exit_code = exit_code


@dataclass(frozen=True)
class VoiceSummary:
    voice_id: str
    name: str
    category: str
    source: str


@dataclass(frozen=True)
class ModelSummary:
    model_id: str
    name: str
    can_tts: bool
    can_sts: bool
    maximum_text_length: int | None


@dataclass(frozen=True)
class SubscriptionSummary:
    status: str
    usage_count: int
    usage_limit: int


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def enum_text(value: Any, fallback: str = "unknown") -> str:
    raw = getattr(value, "value", value)
    if raw is None:
        return fallback
    text = str(raw)
    return text if text else fallback


def terminal_text(value: Any, limit: int = 100) -> str:
    text = enum_text(value, "")
    clean = "".join(ch if ch.isprintable() and ch not in "\r\n\t" else "?" for ch in text)
    return clean[:limit] or "(unnamed)"


def validate_api_key(raw: str) -> str:
    key = raw.strip()
    if not key:
        raise SkillError("missing_key", "No ElevenLabs API key was found.")
    if not KEY_RE.fullmatch(key):
        raise SkillError(
            "unrecognized_key_format",
            "The stored value does not match the current ElevenLabs sk_ token shape. "
            "Nothing was sent. Confirm the key format in the provider console or official docs.",
        )
    return key


def keychain_lookup_args(username: str, security: str = "security") -> list[str]:
    return [
        security,
        "find-generic-password",
        "-s",
        KEYCHAIN_SERVICE,
        "-a",
        username,
        "-w",
    ]


def keychain_save_args(username: str, security: str = "security") -> list[str]:
    return [
        security,
        "add-generic-password",
        "-U",
        "-s",
        KEYCHAIN_SERVICE,
        "-a",
        username,
        "-w",
    ]


def load_api_key(
    *,
    env: Mapping[str, str] | None = None,
    platform: str | None = None,
    runner: Callable[..., subprocess.CompletedProcess[str]] = subprocess.run,
    which: Callable[[str], str | None] = shutil.which,
    username: str | None = None,
) -> tuple[str, str]:
    current_env = os.environ if env is None else env
    if current_env.get(KEY_ENV, "").strip():
        return validate_api_key(current_env[KEY_ENV]), "environment"

    current_platform = sys.platform if platform is None else platform
    if current_platform != "darwin":
        raise SkillError(
            "missing_key",
            f"Set {KEY_ENV} in process memory. No repository key file is supported.",
        )

    security = which("security")
    if not security:
        raise SkillError("missing_key", "macOS Keychain CLI was not found.")

    try:
        result = runner(
            keychain_lookup_args(username or getpass.getuser(), security),
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=15,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        raise SkillError(
            "credential_lookup_failed",
            "The Keychain item could not be read. No key value was printed.",
        ) from None

    if result.returncode == 44:
        raise SkillError(
            "missing_key",
            f"No Keychain item exists for service {KEYCHAIN_SERVICE}.",
        )
    if result.returncode != 0:
        raise SkillError(
            "credential_lookup_failed",
            f"Keychain could not read the existing item (exit {result.returncode}). "
            "Resolve Keychain access before replacing the key.",
        )
    return validate_api_key(result.stdout), "macOS Keychain"


def save_key(
    *,
    platform: str | None = None,
    runner: Callable[..., subprocess.CompletedProcess[Any]] = subprocess.run,
    which: Callable[[str], str | None] = shutil.which,
    username: str | None = None,
    stdin: TextIO = sys.stdin,
    stdout: TextIO = sys.stdout,
) -> None:
    if (sys.platform if platform is None else platform) != "darwin":
        raise SkillError("unsupported_platform", "save-key is available only on macOS.")
    if not stdin.isatty() or not stdout.isatty():
        raise SkillError(
            "tty_required",
            "Run save-key in a private TTY. Piped or captured prompts are refused.",
        )
    security = which("security")
    if not security:
        raise SkillError("missing_keychain_cli", "macOS Keychain CLI was not found.")
    args = keychain_save_args(username or getpass.getuser(), security)
    if args[-1] != "-w":
        raise SkillError("unsafe_keychain_command", "Keychain password prompt was not private.")
    print(
        "Enter the ElevenLabs API key at the item-password prompt. "
        "Do not enter the Mac login password.",
        file=stdout,
        flush=True,
    )
    try:
        result = runner(args, check=False)
    except OSError:
        raise SkillError("credential_save_failed", "Keychain did not save the item.") from None
    if result.returncode != 0:
        raise SkillError("credential_save_failed", "Keychain did not save the item.")
    print(f"Saved the API key in macOS Keychain service {KEYCHAIN_SERVICE}.", file=stdout)


def create_client(key: str) -> Any:
    try:
        from elevenlabs.client import ElevenLabs
    except ImportError:
        raise SkillError(
            "missing_sdk",
            "The ElevenLabs SDK is missing. Install <skill-dir>/requirements.txt.",
        ) from None
    return ElevenLabs(
        api_key=key,
        base_url=API_BASE,
        timeout=30,
        follow_redirects=False,
    )


def safe_detail(exc: BaseException) -> tuple[int | None, str | None, Any]:
    status_code = getattr(exc, "status_code", None)
    body = getattr(exc, "body", None)
    detail = body.get("detail") if isinstance(body, dict) else None
    status = detail.get("status") if isinstance(detail, dict) else None
    safe_status = str(status).lower() if status is not None else None
    if safe_status and not SAFE_STATUS_RE.fullmatch(safe_status):
        safe_status = None
    return status_code if isinstance(status_code, int) else None, safe_status, detail


def safe_permissions(detail: Any) -> list[str]:
    if not isinstance(detail, dict):
        return []
    found: set[str] = set()
    for field in ("missing_permissions", "permissions", "permission"):
        value = detail.get(field)
        values = value if isinstance(value, list) else [value]
        for item in values:
            if isinstance(item, str):
                candidate = item.lower()
                if candidate in SAFE_PERMISSIONS:
                    found.add(candidate)
    message = detail.get("message")
    if isinstance(message, str):
        for match in MESSAGE_PERMISSION_RE.finditer(message):
            candidate = match.group(1).lower().rstrip(".:")
            if candidate in SAFE_PERMISSIONS:
                found.add(candidate)
    return sorted(found)


def classify_exception(exc: BaseException) -> SkillError:
    if isinstance(exc, SkillError):
        return exc

    status_code, status, detail = safe_detail(exc)
    missing_statuses = {"missing_permission", "missing_permissions", "insufficient_permissions"}
    quota_statuses = {
        "quota_exceeded",
        "rate_limit_exceeded",
        "insufficient_credits",
        "payment_required",
    }
    invalid_statuses = {
        "invalid_api_key",
        "invalid_key",
        "authentication_failed",
        "unauthenticated",
    }

    if status in missing_statuses:
        permissions = safe_permissions(detail)
        suffix = f" Missing: {', '.join(permissions)}." if permissions else ""
        return SkillError(
            "missing_permissions",
            "The API key lacks a required permission for this operation." + suffix,
            EXIT_AUTH,
        )
    if status in quota_statuses or status_code in {402, 429}:
        return SkillError(
            "quota_or_rate_limit",
            "The provider refused the request for quota or rate-limit reasons. "
            "The helper did not retry.",
            EXIT_QUOTA,
        )
    if status in invalid_statuses or status_code == 401:
        return SkillError(
            "authentication_failed",
            "Authentication failed. The key may be invalid, expired, or revoked.",
            EXIT_AUTH,
        )
    if status_code == 403:
        return SkillError(
            "permission_denied",
            "The provider denied this operation. Check the API key scopes.",
            EXIT_AUTH,
        )

    try:
        import httpx

        if isinstance(exc, (httpx.TimeoutException, httpx.TransportError)):
            return SkillError(
                "network_failure",
                "The provider could not be reached. No success was assumed.",
                EXIT_NETWORK,
            )
    except ImportError:
        pass

    if status_code is not None:
        return SkillError(
            "provider_failure",
            f"The provider rejected the request with HTTP {status_code}.",
            EXIT_PROVIDER,
        )
    return SkillError(
        "unexpected_failure",
        "The operation failed. No SDK exception, headers, or server body were printed.",
        EXIT_PROVIDER,
    )


def sdk_error_types() -> tuple[type[Exception], ...]:
    try:
        from elevenlabs.core.api_error import ApiError
        from httpx import HTTPError
    except ImportError:
        raise SkillError(
            "missing_sdk",
            "The ElevenLabs SDK is missing. Install <skill-dir>/requirements.txt.",
        ) from None
    return ApiError, HTTPError


def sdk_call(function: Callable[[], Any]) -> Any:
    errors = sdk_error_types()
    try:
        return function()
    except errors as exc:
        raise classify_exception(exc) from None


def sdk_stream(function: Callable[[], Iterable[bytes]]) -> Iterable[bytes]:
    errors = sdk_error_types()
    try:
        yield from function()
    except errors as exc:
        raise classify_exception(exc) from None


def check_private_file(path: Path) -> None:
    if path.is_symlink():
        raise SkillError("unsafe_config", "The private voice config must not be a symlink.")
    mode = stat.S_IMODE(path.stat().st_mode)
    if mode & 0o077:
        raise SkillError(
            "unsafe_config_permissions",
            "The private voice config must be mode 0600.",
        )
    if hasattr(os, "getuid") and path.stat().st_uid != os.getuid():
        raise SkillError("unsafe_config_owner", "The private voice config has another owner.")


def read_voice_config(path: Path | None = None) -> dict[str, Any]:
    config_path = CONFIG_FILE if path is None else path
    if not config_path.exists():
        raise SkillError(
            "voice_not_configured",
            "No confirmed voice is configured. Run voices, then configure-voice.",
        )
    check_private_file(config_path)
    try:
        data = json.loads(config_path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError):
        raise SkillError("invalid_voice_config", "The private voice config is unreadable.") from None
    voice_id = data.get("voice_id") if isinstance(data, dict) else None
    if not isinstance(voice_id, str) or not VOICE_ID_RE.fullmatch(voice_id):
        raise SkillError("invalid_voice_config", "The private voice ID is invalid.")
    if data.get("confirmed_ownership_or_authorization") is not True:
        raise SkillError(
            "voice_not_confirmed",
            "The configured voice lacks explicit ownership or authorization confirmation.",
        )
    if data.get("source") not in {"personal", "workspace"}:
        raise SkillError("invalid_voice_config", "The configured voice source is invalid.")
    return data


def write_voice_config(voice: VoiceSummary, path: Path | None = None) -> None:
    config_path = CONFIG_FILE if path is None else path
    config_path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    try:
        os.chmod(config_path.parent, 0o700)
    except OSError:
        pass
    if config_path.is_symlink():
        raise SkillError("unsafe_config", "The private voice config must not be a symlink.")
    payload = {
        "schema_version": 1,
        "voice_id": voice.voice_id,
        "source": voice.source,
        "category": voice.category,
        "confirmed_ownership_or_authorization": True,
        "confirmed_at_utc": utc_now(),
    }
    temp = config_path.parent / f".{config_path.name}.{uuid.uuid4().hex}.part"
    try:
        with temp.open("x", encoding="utf-8") as handle:
            os.chmod(temp, 0o600)
            json.dump(payload, handle, indent=2, sort_keys=True)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp, config_path)
        os.chmod(config_path, 0o600)
    finally:
        temp.unlink(missing_ok=True)


def validate_page_token(token: Any, seen: set[str]) -> str:
    if not isinstance(token, str) or not TOKEN_RE.fullmatch(token):
        raise SkillError(
            "malformed_pagination",
            "The provider returned a missing or malformed pagination token.",
            EXIT_PROVIDER,
        )
    if token in seen:
        raise SkillError(
            "repeated_pagination",
            "The provider repeated a pagination token. Results were not truncated silently.",
            EXIT_PROVIDER,
        )
    seen.add(token)
    return token


def discover_voices(
    client: Any,
    voice_types: Sequence[str] = ("personal", "workspace"),
) -> list[VoiceSummary]:
    results: list[VoiceSummary] = []
    for voice_type in voice_types:
        token: str | None = None
        seen: set[str] = set()
        pages = 0
        while True:
            response = sdk_call(
                lambda token=token, voice_type=voice_type: client.voices.search(
                    voice_type=voice_type,
                    page_size=100,
                    include_total_count=False,
                    next_page_token=token,
                    request_options=dict(REQUEST_OPTIONS),
                )
            )
            pages += 1
            if pages > 1000:
                raise SkillError(
                    "pagination_limit",
                    "Voice pagination exceeded the safety limit. No partial list was accepted.",
                    EXIT_PROVIDER,
                )
            voices = getattr(response, "voices", None)
            if not isinstance(voices, (list, tuple)):
                raise SkillError(
                    "provider_protocol",
                    "The voice response did not contain a usable list.",
                    EXIT_PROVIDER,
                )
            for voice in voices:
                voice_id = getattr(voice, "voice_id", None)
                if not isinstance(voice_id, str) or not VOICE_ID_RE.fullmatch(voice_id):
                    raise SkillError(
                        "provider_protocol",
                        "The provider returned an invalid voice identifier.",
                        EXIT_PROVIDER,
                    )
                results.append(
                    VoiceSummary(
                        voice_id=voice_id,
                        name=terminal_text(getattr(voice, "name", None)),
                        category=terminal_text(getattr(voice, "category", None), 40),
                        source=voice_type,
                    )
                )
            if not bool(getattr(response, "has_more", False)):
                break
            token = validate_page_token(getattr(response, "next_page_token", None), seen)
    return results


def fetch_models(client: Any) -> list[ModelSummary]:
    response = sdk_call(
        lambda: client.models.list(request_options=dict(REQUEST_OPTIONS))
    )
    if not isinstance(response, list):
        raise SkillError(
            "provider_protocol",
            "The model response did not contain a usable list.",
            EXIT_PROVIDER,
        )
    models: list[ModelSummary] = []
    for model in response:
        model_id = getattr(model, "model_id", None)
        if not isinstance(model_id, str) or not MODEL_ID_RE.fullmatch(model_id):
            raise SkillError(
                "provider_protocol",
                "The provider returned an invalid model identifier.",
                EXIT_PROVIDER,
            )
        maximum = getattr(model, "maximum_text_length_per_request", None)
        models.append(
            ModelSummary(
                model_id=model_id,
                name=terminal_text(getattr(model, "name", None)),
                can_tts=getattr(model, "can_do_text_to_speech", None) is True,
                can_sts=getattr(model, "can_do_voice_conversion", None) is True,
                maximum_text_length=maximum if isinstance(maximum, int) and maximum > 0 else None,
            )
        )
    return models


def fetch_subscription(client: Any) -> SubscriptionSummary:
    response = sdk_call(
        lambda: client.user.subscription.get(request_options=dict(REQUEST_OPTIONS))
    )
    count = getattr(response, "character_count", None)
    limit = getattr(response, "character_limit", None)
    if not isinstance(count, int) or not isinstance(limit, int):
        raise SkillError(
            "provider_protocol",
            "The subscription response omitted current usage counters.",
            EXIT_PROVIDER,
        )
    return SubscriptionSummary(
        status=terminal_text(getattr(response, "status", None), 40),
        usage_count=count,
        usage_limit=limit,
    )


def select_model(
    models: Sequence[ModelSummary],
    model_id: str,
    mode: str,
    text_length: int | None = None,
) -> ModelSummary:
    if not MODEL_ID_RE.fullmatch(model_id):
        raise SkillError("invalid_model", "The model identifier has an invalid shape.")
    model = next((item for item in models if item.model_id == model_id), None)
    if model is None:
        raise SkillError(
            "model_unavailable",
            "The requested model is not in the provider's current model list.",
            EXIT_PROVIDER,
        )
    capable = model.can_tts if mode == "tts" else model.can_sts
    if not capable:
        raise SkillError(
            "model_capability_missing",
            f"The requested model does not report current {mode} capability.",
            EXIT_PROVIDER,
        )
    if (
        mode == "tts"
        and text_length is not None
        and model.maximum_text_length is not None
        and text_length > model.maximum_text_length
    ):
        raise SkillError(
            "script_too_long",
            "The UTF-8 script exceeds the model's current per-request text limit.",
        )
    return model


def run_preflight(
    client: Any,
    config: Mapping[str, Any],
    mode: str,
    model_id: str,
    text_length: int | None = None,
) -> tuple[ModelSummary, SubscriptionSummary]:
    model = select_model(fetch_models(client), model_id, mode, text_length)
    subscription = fetch_subscription(client)
    voices = discover_voices(client)
    if not any(voice.voice_id == config["voice_id"] for voice in voices):
        raise SkillError(
            "configured_voice_not_accessible",
            "The configured voice was not returned by personal or workspace discovery. "
            "Do not infer that it was deleted.",
            EXIT_AUTH,
        )
    return model, subscription


def require_absolute_file(path: Path, label: str) -> None:
    if not path.is_absolute():
        raise SkillError("absolute_path_required", f"{label} path must be absolute.")
    if not path.is_file():
        raise SkillError("input_missing", f"{label} file does not exist.")


def output_extension(output_format: str) -> str:
    patterns = {
        ".mp3": re.compile(r"mp3_[0-9]{4,6}_[0-9]{2,3}\Z"),
        ".wav": re.compile(r"wav_[0-9]{4,6}\Z"),
        ".opus": re.compile(r"opus_[0-9]{4,6}_[0-9]{2,3}\Z"),
    }
    for extension, pattern in patterns.items():
        if pattern.fullmatch(output_format):
            return extension
    raise SkillError(
        "unsupported_output_format",
        "Use an encoded MP3, WAV, or Opus output format exposed by the installed SDK.",
    )


def require_versioned_path(path: Path, label: str) -> None:
    if not path.is_absolute():
        raise SkillError("absolute_path_required", f"{label} path must be absolute.")
    if not VERSION_RE.search(path.name):
        raise SkillError(
            "versioned_path_required",
            f"{label} filename must contain a version token such as v001.",
        )
    if path.exists() or path.is_symlink():
        raise SkillError("output_exists", f"{label} already exists; choose a new version.")


def validate_delivery_paths(
    output: Path,
    receipt: Path,
    output_format: str,
    source: Path,
) -> None:
    require_versioned_path(output, "Output")
    require_versioned_path(receipt, "Receipt")
    expected = output_extension(output_format)
    if output.suffix.lower() != expected:
        raise SkillError(
            "output_extension_mismatch",
            f"Output extension must be {expected} for the selected encoded format.",
        )
    if receipt.suffix.lower() != ".json":
        raise SkillError("receipt_extension", "Receipt path must end in .json.")
    resolved = {output.resolve(strict=False), receipt.resolve(strict=False), source.resolve()}
    if len(resolved) != 3:
        raise SkillError("path_collision", "Source, output, and receipt paths must differ.")
    output.parent.mkdir(parents=True, exist_ok=True)
    receipt.parent.mkdir(parents=True, exist_ok=True)


def read_utf8_script(path: Path) -> tuple[str, str]:
    require_absolute_file(path, "Script")
    try:
        raw = path.read_bytes()
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        raise SkillError("script_not_utf8", "The script is not valid UTF-8.") from None
    except OSError:
        raise SkillError("script_unreadable", "The script could not be read.") from None
    if not text.strip():
        raise SkillError("empty_script", "The script is empty.")
    return text, hashlib.sha256(raw).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def probe_audio(path: Path) -> dict[str, int | float]:
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        raise SkillError("missing_ffprobe", "ffprobe is required to verify encoded audio.")
    try:
        result = subprocess.run(
            [
                ffprobe,
                "-v",
                "error",
                "-select_streams",
                "a:0",
                "-show_entries",
                "stream=sample_rate,channels,duration:format=duration",
                "-of",
                "json",
                str(path),
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=30,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        raise SkillError("audio_probe_failed", "ffprobe could not inspect the audio.", EXIT_PROVIDER) from None
    if result.returncode != 0:
        raise SkillError("audio_probe_failed", "The generated file is not valid encoded audio.", EXIT_PROVIDER)
    try:
        data = json.loads(result.stdout)
        stream = data["streams"][0]
        duration_raw = data.get("format", {}).get("duration") or stream.get("duration")
        duration = float(duration_raw)
        sample_rate = int(stream["sample_rate"])
        channels = int(stream["channels"])
    except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError):
        raise SkillError(
            "audio_probe_failed",
            "ffprobe did not return measured duration, sample rate, and channels.",
            EXIT_PROVIDER,
        ) from None
    if duration <= 0 or sample_rate <= 0 or channels <= 0:
        raise SkillError("audio_probe_failed", "The measured audio properties are invalid.", EXIT_PROVIDER)
    return {
        "measured_duration_seconds": round(duration, 6),
        "sample_rate_hz": sample_rate,
        "channels": channels,
    }


def hidden_partial(path: Path) -> Path:
    return path.parent / f".{path.stem}.{uuid.uuid4().hex}.part{path.suffix}"


def link_without_overwrite(source: Path, destination: Path, label: str) -> None:
    try:
        os.link(source, destination)
    except FileExistsError:
        raise SkillError("output_exists", f"{label} already exists; choose a new version.") from None
    except OSError:
        raise SkillError("atomic_write_failed", f"{label} could not be linked into place.", EXIT_PROVIDER) from None


def write_verified_audio(
    chunks: Iterable[bytes],
    *,
    output: Path,
    receipt: Path,
    operation: str,
    purpose: str,
    model_id: str,
    output_format: str,
    voice_id: str,
    input_hash: str,
    source_kind: str,
    output_kind: str,
    probe: Callable[[Path], dict[str, int | float]] = probe_audio,
) -> dict[str, Any]:
    audio_temp = hidden_partial(output)
    receipt_temp = hidden_partial(receipt)
    output_linked = False
    try:
        total = 0
        with audio_temp.open("xb") as handle:
            os.chmod(audio_temp, 0o600)
            for chunk in chunks:
                if not isinstance(chunk, bytes) or not chunk:
                    raise SkillError(
                        "invalid_stream_chunk",
                        "The provider stream returned an invalid audio chunk.",
                        EXIT_PROVIDER,
                    )
                handle.write(chunk)
                total += len(chunk)
            handle.flush()
            os.fsync(handle.fileno())
        if total == 0:
            raise SkillError("empty_audio", "The provider returned no audio.", EXIT_PROVIDER)

        measured = probe(audio_temp)
        receipt_data: dict[str, Any] = {
            "schema_version": 1,
            "created_at_utc": utc_now(),
            "operation": operation,
            "purpose": purpose,
            "model_id": model_id,
            "output_format": output_format,
            "voice_reference_sha256": hashlib.sha256(voice_id.encode("utf-8")).hexdigest(),
            "input_sha256": input_hash,
            "output_sha256": sha256_file(audio_temp),
            "source_kind": source_kind,
            "generated_vs_recorded": output_kind,
            "provider_preflight": "PASSED",
            "asr_script_match": "NOT RUN",
            "video_retime": "NOT RUN",
            **measured,
        }
        with receipt_temp.open("x", encoding="utf-8") as handle:
            os.chmod(receipt_temp, 0o600)
            json.dump(receipt_data, handle, indent=2, sort_keys=True)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())

        link_without_overwrite(audio_temp, output, "Output")
        output_linked = True
        try:
            link_without_overwrite(receipt_temp, receipt, "Receipt")
        except SkillError:
            output.unlink(missing_ok=True)
            output_linked = False
            raise
        return receipt_data
    finally:
        audio_temp.unlink(missing_ok=True)
        receipt_temp.unlink(missing_ok=True)
        if output_linked and not receipt.exists():
            output.unlink(missing_ok=True)


def cmd_doctor() -> int:
    exit_code = 0
    try:
        version = importlib.metadata.version("elevenlabs")
        print(f"sdk=OK version={version}")
    except importlib.metadata.PackageNotFoundError:
        print("sdk=FAIL code=missing_sdk")
        exit_code = max(exit_code, EXIT_LOCAL)

    try:
        _, source = load_api_key()
        print(f"credential=OK source={source}")
    except SkillError as error:
        print(f"credential=FAIL code={error.code} {error.message}")
        exit_code = max(exit_code, error.exit_code)

    try:
        read_voice_config()
        print("voice_config=OK confirmed=yes")
    except SkillError as error:
        print(f"voice_config=FAIL code={error.code} {error.message}")
        exit_code = max(exit_code, error.exit_code)

    if shutil.which("ffprobe"):
        print("ffprobe=OK")
    else:
        print("ffprobe=FAIL code=missing_ffprobe")
        exit_code = max(exit_code, EXIT_LOCAL)
    print("network=NOT RUN paid_generation=NOT RUN")
    return exit_code


def cmd_voices(scope: str) -> int:
    key, _ = load_api_key()
    client = create_client(key)
    types = ("personal", "workspace") if scope == "both" else (scope,)
    voices = discover_voices(client, types)
    if not voices:
        print("No personal or workspace voices were returned.")
        return 0
    for index, voice in enumerate(voices, start=1):
        print(
            f"{index}\tsource={voice.source}\tcategory={voice.category}"
            f"\tname={voice.name}\tvoice_id={voice.voice_id}"
        )
    return 0


def cmd_configure_voice(
    *,
    stdin: TextIO = sys.stdin,
    stdout: TextIO = sys.stdout,
) -> int:
    if not stdin.isatty() or not stdout.isatty():
        raise SkillError(
            "tty_required",
            "configure-voice requires a TTY for explicit selection and consent.",
        )
    key, _ = load_api_key()
    voices = discover_voices(create_client(key))
    if not voices:
        raise SkillError(
            "no_selectable_voice",
            "No personal or workspace voice is available to configure.",
            EXIT_AUTH,
        )
    for index, voice in enumerate(voices, start=1):
        print(
            f"{index}: [{voice.source}/{voice.category}] {voice.name} ({voice.voice_id})",
            file=stdout,
        )
    print("Select the number of your own or authorized voice:", file=stdout, flush=True)
    try:
        choice = int(stdin.readline().strip())
    except ValueError:
        raise SkillError("invalid_selection", "Voice selection must be a number.") from None
    if choice < 1 or choice > len(voices):
        raise SkillError("invalid_selection", "Voice selection is outside the displayed list.")
    print(
        "Type CONFIRM OWN VOICE to state that you own or are authorized to use it:",
        file=stdout,
        flush=True,
    )
    if stdin.readline().strip() != "CONFIRM OWN VOICE":
        raise SkillError("voice_not_confirmed", "Voice configuration was not saved.")
    write_voice_config(voices[choice - 1])
    print(f"Saved private voice configuration at {CONFIG_FILE}.", file=stdout)
    return 0


def cmd_models(capability: str) -> int:
    key, _ = load_api_key()
    models = fetch_models(create_client(key))
    for model in models:
        if capability == "tts" and not model.can_tts:
            continue
        if capability == "sts" and not model.can_sts:
            continue
        maximum = model.maximum_text_length if model.maximum_text_length is not None else "not_reported"
        print(
            f"model_id={model.model_id}\tname={model.name}\ttts={str(model.can_tts).lower()}"
            f"\tsts={str(model.can_sts).lower()}\tmax_text={maximum}"
        )
    return 0


def cmd_status(mode: str, model_id: str) -> int:
    key, source = load_api_key()
    client = create_client(key)
    print(f"credential=OK source={source}")
    exit_code = 0
    models: list[ModelSummary] | None = None
    config: dict[str, Any] | None = None

    try:
        models = fetch_models(client)
        select_model(models, model_id, mode)
        print(f"model=OK id={model_id} capability={mode}")
    except SkillError as error:
        print(f"model=FAIL code={error.code} {error.message}")
        exit_code = max(exit_code, error.exit_code)
        if error.code == "authentication_failed":
            return exit_code

    try:
        subscription = fetch_subscription(client)
        print(
            f"subscription=OK status={subscription.status} "
            f"usage={subscription.usage_count}/{subscription.usage_limit}"
        )
    except SkillError as error:
        print(f"subscription=FAIL code={error.code} {error.message}")
        exit_code = max(exit_code, error.exit_code)

    try:
        config = read_voice_config()
        print("voice_config=OK confirmed=yes")
    except SkillError as error:
        print(f"voice_config=FAIL code={error.code} {error.message}")
        exit_code = max(exit_code, error.exit_code)

    try:
        voices = discover_voices(client)
        accessible = config is not None and any(
            voice.voice_id == config["voice_id"] for voice in voices
        )
        if config is not None and not accessible:
            raise SkillError(
                "configured_voice_not_accessible",
                "The configured voice was not returned by personal or workspace discovery.",
                EXIT_AUTH,
            )
        print(f"voice_discovery=OK count={len(voices)} configured_accessible={str(accessible).lower()}")
    except SkillError as error:
        print(f"voice_discovery=FAIL code={error.code} {error.message}")
        exit_code = max(exit_code, error.exit_code)

    print("paid_generation=NOT RUN")
    return exit_code


def require_paid_confirmation(confirmed: bool) -> None:
    if not confirmed:
        raise SkillError(
            "paid_request_not_confirmed",
            "Generation requires an explicit user audio request and --confirm-paid-request.",
        )


def cmd_tts(args: argparse.Namespace) -> int:
    require_paid_confirmation(args.confirm_paid_request)
    script, input_hash = read_utf8_script(args.script)
    validate_delivery_paths(args.output, args.receipt, args.output_format, args.script)
    config = read_voice_config()
    key, _ = load_api_key()
    client = create_client(key)
    run_preflight(client, config, "tts", args.model, len(script))
    chunks = sdk_stream(
        lambda: client.text_to_speech.convert(
            voice_id=config["voice_id"],
            text=script,
            model_id=args.model,
            output_format=args.output_format,
            request_options=dict(REQUEST_OPTIONS),
        )
    )
    write_verified_audio(
        chunks,
        output=args.output,
        receipt=args.receipt,
        operation="text_to_speech",
        purpose=args.purpose,
        model_id=args.model,
        output_format=args.output_format,
        voice_id=config["voice_id"],
        input_hash=input_hash,
        source_kind="utf8_script",
        output_kind="generated",
    )
    print(f"audio={args.output}")
    print(f"receipt={args.receipt}")
    print("asr_script_match=NOT RUN video_retime=NOT RUN")
    return 0


def cmd_sts(args: argparse.Namespace) -> int:
    require_paid_confirmation(args.confirm_paid_request)
    require_absolute_file(args.audio, "Audio")
    validate_delivery_paths(args.output, args.receipt, args.output_format, args.audio)
    probe_audio(args.audio)
    input_hash = sha256_file(args.audio)
    config = read_voice_config()
    key, _ = load_api_key()
    client = create_client(key)
    run_preflight(client, config, "sts", args.model)
    with args.audio.open("rb") as source:
        chunks = sdk_stream(
            lambda: client.speech_to_speech.convert(
                voice_id=config["voice_id"],
                audio=source,
                model_id=args.model,
                output_format=args.output_format,
                request_options=dict(REQUEST_OPTIONS),
            )
        )
        write_verified_audio(
            chunks,
            output=args.output,
            receipt=args.receipt,
            operation="speech_to_speech",
            purpose=args.purpose,
            model_id=args.model,
            output_format=args.output_format,
            voice_id=config["voice_id"],
            input_hash=input_hash,
            source_kind="audio_file",
            output_kind="voice_converted",
        )
    print(f"audio={args.output}")
    print(f"receipt={args.receipt}")
    print("asr_script_match=NOT RUN video_retime=NOT RUN")
    return 0


class SafeArgumentParser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        # Argparse's default message contains raw argument values.
        raise SkillError(
            "invalid_arguments",
            "Invalid command-line arguments. Run the command with --help. "
            "Keep credentials in Keychain or the environment.",
        )


def build_parser() -> argparse.ArgumentParser:
    parser = SafeArgumentParser(
        description="Generate requested audio with a user-confirmed ElevenLabs voice."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("doctor", help="Check local prerequisites without network access.")
    subparsers.add_parser("save-key", help="Open the private macOS Keychain prompt.")

    voices = subparsers.add_parser("voices", help="List safe personal/workspace metadata.")
    voices.add_argument("--scope", choices=("personal", "workspace", "both"), default="both")

    subparsers.add_parser(
        "configure-voice",
        help="Interactively select and confirm the private default voice.",
    )

    models = subparsers.add_parser("models", help="List current model capabilities.")
    models.add_argument("--capability", choices=("tts", "sts"), required=True)

    status_parser = subparsers.add_parser("status", help="Run non-generative provider checks.")
    status_parser.add_argument("--mode", choices=("tts", "sts"), required=True)
    status_parser.add_argument("--model", required=True)

    for name in ("tts", "sts"):
        generation = subparsers.add_parser(name)
        source_flag = "--script" if name == "tts" else "--audio"
        source_dest = "script" if name == "tts" else "audio"
        generation.add_argument(source_flag, dest=source_dest, type=Path, required=True)
        generation.add_argument("--output", type=Path, required=True)
        generation.add_argument("--receipt", type=Path, required=True)
        generation.add_argument("--model", required=True)
        generation.add_argument("--output-format", required=True)
        generation.add_argument("--purpose", choices=("audition", "candidate"), required=True)
        generation.add_argument("--confirm-paid-request", action="store_true")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    try:
        arguments = list(sys.argv[1:] if argv is None else argv)
        if any(
            KEY_ARGUMENT_RE.search(argument)
            or argument.split("=", 1)[0].lower() in {"--api-key", "--api_key", "--key"}
            for argument in arguments
        ):
            raise SkillError(
                "key_in_arguments",
                "Credentials are not accepted as command arguments. Use Keychain or the environment.",
            )
        args = build_parser().parse_args(arguments)
        if args.command == "doctor":
            return cmd_doctor()
        if args.command == "save-key":
            save_key()
            return 0
        if args.command == "voices":
            return cmd_voices(args.scope)
        if args.command == "configure-voice":
            return cmd_configure_voice()
        if args.command == "models":
            return cmd_models(args.capability)
        if args.command == "status":
            return cmd_status(args.mode, args.model)
        if args.command == "tts":
            return cmd_tts(args)
        if args.command == "sts":
            return cmd_sts(args)
        raise SkillError("unknown_command", "Unknown command.")
    except SkillError as error:
        print(f"ERROR [{error.code}]: {error.message}", file=sys.stderr)
        return error.exit_code
    except OSError:
        print("ERROR [local_io_failed]: A local file operation failed.", file=sys.stderr)
        return EXIT_LOCAL
    except KeyboardInterrupt:
        print("Cancelled. A paid request may already have reached the provider.", file=sys.stderr)
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
