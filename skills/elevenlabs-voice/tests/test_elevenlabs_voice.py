from __future__ import annotations

import importlib.util
import io
import json
import os
import struct
import subprocess
import sys
import tempfile
import types
import unittest
import wave
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from unittest import mock


SKILL_DIR = Path(__file__).resolve().parents[1]
MODULE_PATH = SKILL_DIR / "scripts" / "elevenlabs_voice.py"
TEST_ROOT = Path(__file__).resolve().parent / "scratch"
TEST_ROOT.mkdir(parents=True, exist_ok=True)

spec = importlib.util.spec_from_file_location("elevenlabs_voice", MODULE_PATH)
voice = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = voice
assert spec.loader is not None
spec.loader.exec_module(voice)
REAL_LOAD_API_KEY = voice.load_api_key

FAKE_KEY = "sk_" + ("A" * 40)
FAKE_VOICE = "voice_test_alpha"
FAKE_MODEL = "model_test_tts"


class Page:
    def __init__(self, voices, has_more=False, next_page_token=None):
        self.voices = voices
        self.has_more = has_more
        self.next_page_token = next_page_token


class Voice:
    def __init__(self, voice_id, name="Test voice", category="cloned"):
        self.voice_id = voice_id
        self.name = name
        self.category = category


class Search:
    def __init__(self, pages):
        self.pages = list(pages)
        self.calls = []

    def search(self, **kwargs):
        self.calls.append(kwargs)
        return self.pages.pop(0)


class FakeTTY(io.StringIO):
    def isatty(self):
        return True


def make_wav_bytes(duration_seconds=0.1, sample_rate=16000):
    target = io.BytesIO()
    with wave.open(target, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(sample_rate)
        samples = int(duration_seconds * sample_rate)
        handle.writeframes(b"".join(struct.pack("<h", 0) for _ in range(samples)))
    return target.getvalue()


class ElevenLabsVoiceTests(unittest.TestCase):
    def setUp(self):
        key_patch = mock.patch.object(voice, "load_api_key", return_value=(FAKE_KEY, "test"))
        self.key_loader = key_patch.start()
        self.addCleanup(key_patch.stop)
        network_patch = mock.patch(
            "httpx.Client.send", side_effect=AssertionError("Live network is forbidden in these tests.")
        )
        network_patch.start()
        self.addCleanup(network_patch.stop)

    def new_dir(self):
        return tempfile.TemporaryDirectory(dir=TEST_ROOT)

    def test_paid_call_requires_explicit_confirmation_before_client(self):
        with self.new_dir() as directory:
            root = Path(directory)
            script = root / "script.txt"
            script.write_text("Test line.", encoding="utf-8")
            client = mock.Mock()
            with mock.patch.object(voice, "create_client", client):
                stderr = io.StringIO()
                with redirect_stderr(stderr):
                    code = voice.main(
                        [
                            "tts",
                            "--script",
                            str(script.resolve()),
                            "--output",
                            str((root / "take-v001.mp3").resolve()),
                            "--receipt",
                            str((root / "take-v001.receipt.json").resolve()),
                            "--model",
                            FAKE_MODEL,
                            "--output-format",
                            "mp3_44100_128",
                            "--purpose",
                            "audition",
                        ]
                    )
            self.assertEqual(code, voice.EXIT_LOCAL)
            client.assert_not_called()
            self.assertIn("paid_request_not_confirmed", stderr.getvalue())

    def test_unconfirmed_voice_blocks_before_transport(self):
        with self.new_dir() as directory:
            root = Path(directory)
            script = root / "script.txt"
            script.write_text("Test line.", encoding="utf-8")
            client = mock.Mock()
            missing_config = root / "missing-config.json"
            with (
                mock.patch.object(voice, "CONFIG_FILE", missing_config),
                mock.patch.object(voice, "create_client", client),
                mock.patch.object(voice, "load_api_key") as load_key,
            ):
                code = voice.main(
                    [
                        "tts",
                        "--script",
                        str(script.resolve()),
                        "--output",
                        str((root / "take-v001.mp3").resolve()),
                        "--receipt",
                        str((root / "take-v001.receipt.json").resolve()),
                        "--model",
                        FAKE_MODEL,
                        "--output-format",
                        "mp3_44100_128",
                        "--purpose",
                        "audition",
                        "--confirm-paid-request",
                    ]
                )
            self.assertEqual(code, voice.EXIT_LOCAL)
            client.assert_not_called()
            load_key.assert_not_called()

    def test_key_shape_guard_blocks_accidental_password(self):
        with self.assertRaises(voice.SkillError) as caught:
            voice.validate_api_key("correct-horse-battery-staple")
        self.assertEqual(caught.exception.code, "unrecognized_key_format")

    def test_missing_permissions_401_is_not_invalid_key(self):
        from elevenlabs.core.api_error import ApiError

        error = ApiError(
            status_code=401,
            body={
                "detail": {
                    "status": "missing_permissions",
                    "message": "This key is missing the permission voices_read.",
                }
            },
        )
        classified = voice.classify_exception(error)
        self.assertEqual(classified.code, "missing_permissions")
        self.assertEqual(classified.exit_code, voice.EXIT_AUTH)
        self.assertIn("voices_read", classified.message)
        self.assertNotIn("invalid", classified.message.lower())

    def test_generic_401_is_authentication_failure(self):
        from elevenlabs.core.api_error import ApiError

        error = ApiError(status_code=401, body={"detail": {"status": "unknown"}})
        self.assertEqual(voice.classify_exception(error).code, "authentication_failed")

    def test_secrets_never_enter_keychain_argv_or_safe_error(self):
        lookup = voice.keychain_lookup_args("current-user")
        save = voice.keychain_save_args("current-user")
        self.assertEqual(save[-1], "-w")
        self.assertNotIn(FAKE_KEY, lookup)
        self.assertNotIn(FAKE_KEY, save)

        secret_error = types.SimpleNamespace(
            status_code=401,
            body={
                "detail": {
                    "status": "missing_permissions",
                    "message": f"secret={FAKE_KEY}; missing the permission voices_read",
                }
            },
        )
        classified = voice.classify_exception(secret_error)
        self.assertNotIn(FAKE_KEY, classified.message)

    def test_save_key_uses_private_tty_prompt_without_password_argument(self):
        calls = []

        def runner(args, **kwargs):
            calls.append((args, kwargs))
            return subprocess.CompletedProcess(args, 0)

        output = FakeTTY()
        voice.save_key(
            platform="darwin",
            runner=runner,
            which=lambda _: "/usr/bin/security",
            username="current-user",
            stdin=FakeTTY(),
            stdout=output,
        )
        args, kwargs = calls[0]
        self.assertEqual(args[-1], "-w")
        self.assertNotIn(FAKE_KEY, args)
        self.assertEqual(kwargs, {"check": False})

    def test_pagination_reads_all_personal_and_workspace_pages(self):
        search = Search(
            [
                Page([Voice("voice_test_one")], True, "page_token_2"),
                Page([Voice("voice_test_two")]),
                Page([Voice("voice_test_three")]),
            ]
        )
        client = types.SimpleNamespace(voices=search)
        found = voice.discover_voices(client)
        self.assertEqual([item.voice_id for item in found], [
            "voice_test_one",
            "voice_test_two",
            "voice_test_three",
        ])
        self.assertEqual(search.calls[1]["next_page_token"], "page_token_2")
        self.assertTrue(all(call["request_options"]["max_retries"] == 0 for call in search.calls))

    def test_repeated_pagination_token_fails_instead_of_truncating(self):
        search = Search(
            [
                Page([], True, "same_token"),
                Page([], True, "same_token"),
            ]
        )
        client = types.SimpleNamespace(voices=search)
        with self.assertRaises(voice.SkillError) as caught:
            voice.discover_voices(client, ("personal",))
        self.assertEqual(caught.exception.code, "repeated_pagination")

    def test_existing_output_blocks_before_paid_transport(self):
        with self.new_dir() as directory:
            root = Path(directory)
            script = root / "script.txt"
            script.write_text("Test.", encoding="utf-8")
            output = root / "take-v001.mp3"
            output.write_bytes(b"existing")
            client = mock.Mock()
            with (
                mock.patch.object(voice, "create_client", client),
                mock.patch.object(voice, "read_voice_config"),
                mock.patch.object(voice, "load_api_key"),
            ):
                code = voice.main(
                    [
                        "tts",
                        "--script",
                        str(script.resolve()),
                        "--output",
                        str(output.resolve()),
                        "--receipt",
                        str((root / "take-v001.receipt.json").resolve()),
                        "--model",
                        FAKE_MODEL,
                        "--output-format",
                        "mp3_44100_128",
                        "--purpose",
                        "audition",
                        "--confirm-paid-request",
                    ]
                )
            self.assertEqual(code, voice.EXIT_LOCAL)
            client.assert_not_called()
            self.assertEqual(output.read_bytes(), b"existing")

    def test_partial_stream_is_removed_and_no_receipt_is_written(self):
        with self.new_dir() as directory:
            root = Path(directory)
            output = root / "take-v001.wav"
            receipt = root / "take-v001.receipt.json"

            def broken_stream():
                yield b"partial"
                raise RuntimeError("stream broke")

            with self.assertRaises(RuntimeError):
                voice.write_verified_audio(
                    broken_stream(),
                    output=output,
                    receipt=receipt,
                    operation="text_to_speech",
                    purpose="audition",
                    model_id=FAKE_MODEL,
                    output_format="wav_16000",
                    voice_id=FAKE_VOICE,
                    input_hash="0" * 64,
                    source_kind="utf8_script",
                    output_kind="generated",
                    probe=lambda _: {
                        "measured_duration_seconds": 1.0,
                        "sample_rate_hz": 16000,
                        "channels": 1,
                    },
                )
            self.assertFalse(output.exists())
            self.assertFalse(receipt.exists())
            self.assertEqual(list(root.glob(".*.part*")), [])

    def test_receipt_has_hashes_not_key_or_raw_voice_id(self):
        with self.new_dir() as directory:
            root = Path(directory)
            output = root / "take-v001.wav"
            receipt = root / "take-v001.receipt.json"
            audio = make_wav_bytes()
            voice.write_verified_audio(
                [audio],
                output=output,
                receipt=receipt,
                operation="text_to_speech",
                purpose="audition",
                model_id=FAKE_MODEL,
                output_format="wav_16000",
                voice_id=FAKE_VOICE,
                input_hash="1" * 64,
                source_kind="utf8_script",
                output_kind="generated",
                probe=voice.probe_audio,
            )
            raw = receipt.read_text(encoding="utf-8")
            data = json.loads(raw)
            self.assertNotIn(FAKE_KEY, raw)
            self.assertNotIn(FAKE_VOICE, raw)
            self.assertIn("voice_reference_sha256", data)
            self.assertEqual(data["asr_script_match"], "NOT RUN")
            self.assertGreater(data["measured_duration_seconds"], 0)
            self.assertEqual(data["sample_rate_hz"], 16000)

    def test_actual_ffprobe_reads_encoded_wav(self):
        with self.new_dir() as directory:
            path = Path(directory) / "probe-v001.wav"
            path.write_bytes(make_wav_bytes(duration_seconds=0.2, sample_rate=16000))
            measured = voice.probe_audio(path)
            self.assertAlmostEqual(measured["measured_duration_seconds"], 0.2, places=2)
            self.assertEqual(measured["sample_rate_hz"], 16000)
            self.assertEqual(measured["channels"], 1)

    def test_tts_sdk_call_has_no_retry_and_receipt_has_no_secret(self):
        with self.new_dir() as directory:
            root = Path(directory)
            script = root / "script.txt"
            script.write_text("A short audition.", encoding="utf-8")
            config = {
                "voice_id": FAKE_VOICE,
                "source": "personal",
                "confirmed_ownership_or_authorization": True,
            }
            convert = mock.Mock(return_value=[make_wav_bytes()])
            client = types.SimpleNamespace(
                text_to_speech=types.SimpleNamespace(convert=convert)
            )
            with (
                mock.patch.object(voice, "read_voice_config", return_value=config),
                mock.patch.object(voice, "load_api_key", return_value=(FAKE_KEY, "environment")),
                mock.patch.object(voice, "create_client", return_value=client),
                mock.patch.object(voice, "run_preflight"),
            ):
                code = voice.main(
                    [
                        "tts",
                        "--script",
                        str(script.resolve()),
                        "--output",
                        str((root / "take-v001.wav").resolve()),
                        "--receipt",
                        str((root / "take-v001.receipt.json").resolve()),
                        "--model",
                        FAKE_MODEL,
                        "--output-format",
                        "wav_16000",
                        "--purpose",
                        "audition",
                        "--confirm-paid-request",
                    ]
                )
            self.assertEqual(code, 0)
            kwargs = convert.call_args.kwargs
            self.assertEqual(kwargs["request_options"]["max_retries"], 0)
            receipt_raw = (root / "take-v001.receipt.json").read_text(encoding="utf-8")
            self.assertNotIn(FAKE_KEY, receipt_raw)
            self.assertNotIn(FAKE_VOICE, receipt_raw)

    def test_key_shaped_arguments_are_rejected_before_parsing_or_credentials(self):
        secret = "sk_" + "a" * 40
        cases = [
            ["doctor", "--api-key", secret],
            ["doctor", f"--api-key={secret}"],
            [secret],
            ["status", "--mode", "sts", "--model", secret],
            ["doctor", f"--output=/tmp/{secret}-v001.wav"],
        ]
        for arguments in cases:
            with self.subTest(arguments=arguments):
                output = io.StringIO()
                with (
                    redirect_stderr(output),
                    redirect_stdout(output),
                    mock.patch.object(voice, "cmd_doctor", return_value=0) as doctor,
                    mock.patch.object(voice, "cmd_status", return_value=0) as status,
                ):
                    try:
                        code = voice.main(arguments)
                    except SystemExit as error:
                        code = error.code
                self.assertEqual(code, voice.EXIT_LOCAL)
                self.assertNotIn(secret, output.getvalue())
                self.assertIn("key_in_arguments", output.getvalue())
                doctor.assert_not_called()
                status.assert_not_called()
        self.key_loader.assert_not_called()

    def test_argument_errors_do_not_echo_unrecognized_values(self):
        private_value = "b" * 32
        output = io.StringIO()
        with redirect_stderr(output), redirect_stdout(output):
            try:
                code = voice.main(["voices", "--scope", private_value])
            except SystemExit as error:
                code = error.code
        self.assertEqual(code, voice.EXIT_LOCAL)
        self.assertNotIn(private_value, output.getvalue())
        self.assertIn("invalid_arguments", output.getvalue())
        self.key_loader.assert_not_called()

    def test_normal_model_name_is_not_mistaken_for_a_key(self):
        model = "task_" + "a" * 40
        with mock.patch.object(voice, "cmd_status", return_value=0) as status:
            code = voice.main(["status", "--mode", "sts", "--model", model])
        self.assertEqual(code, 0)
        status.assert_called_once_with("sts", model)

    def test_help_remains_successful_and_does_not_load_credentials(self):
        with redirect_stdout(io.StringIO()), self.assertRaises(SystemExit) as caught:
            voice.main(["--help"])
        self.assertEqual(caught.exception.code, 0)
        self.key_loader.assert_not_called()

    def test_permission_fields_cannot_echo_a_key(self):
        from elevenlabs.core.api_error import ApiError
        secret = "sk_" + "a" * 40
        error = ApiError(status_code=401, body={"detail": {
            "status": "missing_permissions",
            "permissions": [secret, "voices_read"],
            "message": f"Missing permission {secret}",
        }})
        classified = voice.classify_exception(error)
        self.assertEqual(classified.code, "missing_permissions")
        self.assertIn("voices_read", classified.message)
        self.assertNotIn(secret, classified.message)

    def test_unknown_provider_status_cannot_echo_a_key(self):
        from elevenlabs.core.api_error import ApiError
        secret = "sk_" + "a" * 40
        error = ApiError(status_code=500, body={"detail": {"status": secret}})
        classified = voice.classify_exception(error)
        self.assertEqual(classified.code, "provider_failure")
        self.assertIn("500", classified.message)
        self.assertNotIn(secret, classified.message)

    def test_keychain_absence_is_distinct_from_denied_access(self):
        for returncode, expected in [
            (44, "missing_key"),
            (36, "credential_lookup_failed"),
            (1, "credential_lookup_failed"),
        ]:
            with self.subTest(returncode=returncode):
                runner = mock.Mock(return_value=subprocess.CompletedProcess([], returncode, stdout=""))
                with self.assertRaises(voice.SkillError) as caught:
                    REAL_LOAD_API_KEY(
                        env={}, platform="darwin", runner=runner,
                        which=lambda _: "/usr/bin/security", username="test-user",
                    )
                self.assertEqual(caught.exception.code, expected)

    def test_internal_sdk_call_bug_is_not_mislabeled_as_provider_failure(self):
        def broken():
            raise RuntimeError("programming-control")
        with self.assertRaises(RuntimeError) as caught:
            voice.sdk_call(broken)
        self.assertIs(type(caught.exception), RuntimeError)
        self.assertEqual(str(caught.exception), "programming-control")

    def test_sdk_stream_permission_failure_is_cleaned_up(self):
        from elevenlabs.core.api_error import ApiError
        def broken():
            yield b"partial"
            raise ApiError(status_code=401, body={"detail": {
                "status": "missing_permissions",
                "message": "Missing permission speech_to_speech",
            }})
        with self.new_dir() as directory:
            root = Path(directory)
            output = root / "take-v001.wav"
            receipt = root / "take-v001.receipt.json"
            with self.assertRaises(voice.SkillError) as caught:
                voice.write_verified_audio(
                    voice.sdk_stream(broken), output=output, receipt=receipt,
                    operation="speech_to_speech", purpose="candidate",
                    model_id=FAKE_MODEL, output_format="wav_16000", voice_id=FAKE_VOICE,
                    input_hash="0" * 64, source_kind="audio_file", output_kind="voice_converted",
                )
            self.assertEqual(caught.exception.code, "missing_permissions")
            self.assertFalse(output.exists())
            self.assertFalse(receipt.exists())
            self.assertEqual(list(root.glob(".*.part*")), [])

    def test_sts_does_not_claim_the_source_was_a_human_recording(self):
        with self.new_dir() as directory:
            root = Path(directory)
            source = root / "source.wav"
            source.write_bytes(make_wav_bytes())
            output = root / "take-v001.wav"
            receipt = root / "take-v001.receipt.json"
            config = {"voice_id": FAKE_VOICE, "source": "personal",
                      "confirmed_ownership_or_authorization": True}
            client = types.SimpleNamespace(speech_to_speech=types.SimpleNamespace(
                convert=mock.Mock(return_value=[make_wav_bytes()]),
            ))
            with (
                mock.patch.object(voice, "read_voice_config", return_value=config),
                mock.patch.object(voice, "create_client", return_value=client),
                mock.patch.object(voice, "run_preflight"),
                redirect_stdout(io.StringIO()),
            ):
                code = voice.main([
                    "sts", "--audio", str(source.resolve()), "--output", str(output.resolve()),
                    "--receipt", str(receipt.resolve()), "--model", FAKE_MODEL,
                    "--output-format", "wav_16000", "--purpose", "candidate",
                    "--confirm-paid-request",
                ])
            self.assertEqual(code, 0)
            data = json.loads(receipt.read_text())
            self.assertEqual(data["source_kind"], "audio_file")
            self.assertEqual(data["generated_vs_recorded"], "voice_converted")


if __name__ == "__main__":
    unittest.main()
