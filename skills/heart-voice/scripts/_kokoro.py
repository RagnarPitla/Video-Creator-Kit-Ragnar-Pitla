"""Shared Kokoro setup for the heart-voice launcher.

Kokoro's voice prefix IS its language: the first letter of `af_heart` selects
American phonemisation, `bf_emma` British, `jf_alpha` Japanese. Hardcoding
lang_code="a" therefore runs every non-American voice through the wrong
front end -- British voices come out Americanised and the 34 non-English
voices are unreachable. Deriving it from the voice name is the whole fix.
"""
import os
import warnings

warnings.filterwarnings("ignore")
os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

# kokoro and huggingface_hub log to stderr at import and at first model load.
# `heart-voice say` output gets parsed, so keep the channel clean.
import logging

for _n in ("huggingface_hub", "kokoro", "transformers"):
    logging.getLogger(_n).setLevel(logging.ERROR)

import numpy as np

LANGS = {
    "a": ("American English", None),
    "b": ("British English", None),
    "e": ("Spanish", None),
    "f": ("French", None),
    "h": ("Hindi", None),
    "i": ("Italian", None),
    "p": ("Brazilian Portuguese", None),
    "j": ("Japanese", 'misaki[ja]" "unidic  (then: python -m unidic download)'),
    "z": ("Mandarin Chinese", "misaki[zh]"),
}


REPO = "hexgrad/Kokoro-82M"

# The catalogue lives here, not in the launcher's help text. The original bug in
# this skill was a hardcoded list that listed 11 of 54 voices and drifted out of
# date; `heart-voice voices` now prints from this table, so it cannot disagree
# with what the code will actually accept.
CATALOGUE = [
    ("af", "American English", "heart alloy aoede bella jessica kore nicole nova river sarah sky"),
    ("am", "American English", "adam echo eric fenrir liam michael onyx puck santa"),
    ("bf", "British English",  "alice emma isabella lily"),
    ("bm", "British English",  "daniel fable george lewis"),
    ("ef", "Spanish",          "dora"),
    ("em", "Spanish",          "alex santa"),
    ("ff", "French",           "siwis"),
    ("hf", "Hindi",            "alpha beta"),
    ("hm", "Hindi",            "omega psi"),
    ("if", "Italian",          "sara"),
    ("im", "Italian",          "nicola"),
    ("jf", "Japanese",         "alpha gongitsune nezumi tebukuro"),
    ("jm", "Japanese",         "kumo"),
    ("pf", "Brazilian Portuguese", "dora"),
    ("pm", "Brazilian Portuguese", "alex santa"),
    ("zf", "Mandarin Chinese", "xiaobei xiaoni xiaoxiao xiaoyi"),
    ("zm", "Mandarin Chinese", "yunjian yunxi yunxia yunyang"),
]
VOICES = {f"{p}_{n}": lang for p, lang, names in CATALOGUE for n in names.split()}


def catalogue():
    """The voice list, printed from the same table the code validates against."""
    out = ["All %d Kokoro voices. The prefix is the language, so the voice name alone" % len(VOICES),
           "picks the phonemiser: HEART_VOICE=bm_george heart-voice say \"...\" out.wav", ""]
    seen = None
    for prefix, lang, names in CATALOGUE:
        label = lang if lang != seen else ""
        seen = lang
        tag = "female" if prefix[1] == "f" else "male"
        voices = " ".join(names.split())
        out.append(f"  {label:<22}{prefix}_  ({tag:<6}) {voices}")
    out += ["",
            "Default is af_heart. Japanese needs \"misaki[ja]\" plus",
            "`python -m unidic download`; Mandarin needs \"misaki[zh]\". Everything else",
            "works out of the box. `heart-voice doctor` reports the language of whichever",
            "voice is selected."]
    return "\n".join(out)


def _go_offline_if_cached(voice):
    """Honour the skill's promise: no network once the assets are on disk.

    HF_HUB_OFFLINE is read when huggingface_hub is first imported, so this
    must run before kokoro pulls it in -- and must therefore not import
    huggingface_hub itself to do the lookup. Pure filesystem check only.
    Offline is set only when this voice and the weights are already cached,
    so a cold cache still downloads normally.
    """
    if os.environ.get("HF_HUB_OFFLINE"):
        return
    root = os.environ.get("HF_HUB_CACHE") or os.path.join(
        os.environ.get("HF_HOME") or os.path.expanduser("~/.cache/huggingface"), "hub")
    snaps = os.path.join(root, "models--hexgrad--Kokoro-82M", "snapshots")
    if not os.path.isdir(snaps):
        return
    for s in os.listdir(snaps):
        d = os.path.join(snaps, s)
        if all(os.path.exists(os.path.join(d, f)) for f in
               ("config.json", "kokoro-v1_0.pth", f"voices/{voice}.pt")):
            os.environ["HF_HUB_OFFLINE"] = "1"
            return


def lang_name(voice):
    """Language of a voice, or a clean error -- never a raw KeyError.

    Validate the whole name, not just the prefix. `zz_none` starts with a real
    language code, so a prefix-only check passes it through to kokoro, which
    then dies on a missing weights file with a traceback.
    """
    if voice not in VOICES:
        hint = ""
        if voice and voice[0] in LANGS:
            near = sorted(v for v in VOICES if v[0] == voice[0])
            if near:
                hint = (f" The {LANGS[voice[0]][0]} voices are: "
                        f"{', '.join(near)}.")
        raise SystemExit(
            f"heart-voice: '{voice}' is not a Kokoro voice name.{hint}"
            f" Run `heart-voice voices` for all {len(VOICES)}."
        )
    return LANGS[voice[0]][0]


def pipeline(voice):
    """Build a KPipeline whose language matches the voice, or explain why not."""
    code = voice[0] if voice else ""
    lang_name(voice)
    _go_offline_if_cached(voice)
    from kokoro import KPipeline
    try:
        # kokoro prints its repo_id warning with a bare print(), which no
        # logging or warnings filter can reach. Passing it is the only fix.
        return KPipeline(lang_code=code, repo_id=REPO)
    except (ImportError, ModuleNotFoundError) as e:
        _missing(voice, code, e)


def synth(pipe, text, voice):
    """Render one line and prove it carries signal.

    A wav can be valid, correctly sized and completely silent, so presence of
    output is not evidence of speech. Only the peak is.
    """
    try:
        audio = np.concatenate([x for _, _, x in pipe(text, voice=voice)])
    except (ImportError, ModuleNotFoundError) as e:
        _missing(voice, voice[0], e)
    except RuntimeError as e:
        if "MeCab" in str(e) or "mecabrc" in str(e):
            _missing(voice, voice[0], "MeCab dictionary not downloaded")
        raise
    peak = float(np.max(np.abs(audio)))
    if peak < 0.01:
        raise SystemExit(f"heart-voice: '{voice}' produced silence (peak {peak:.4f})")
    return audio, peak


def _missing(voice, code, err):
    name, extra = LANGS[code]
    lines = [f"heart-voice: the {name} backend is not installed, so '{voice}' cannot speak.",
             f"  cause: {err}"]
    if extra:
        lines.append(f'  fix  : ~/.local/share/heart-voice/venv/bin/python -m pip install "{extra}"')
    raise SystemExit("\n".join(lines))
