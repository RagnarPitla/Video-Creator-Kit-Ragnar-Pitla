"""Transcribe the opening seconds of every jam.with.ai video.

The catalogue is 195 mp4s named only by timestamp - no captions, no titles,
nothing to mine as text. The hook is where the topic and the promise live, so
transcribing the first HEAD seconds of each is the cheapest way to recover what
the whole catalogue is actually about.

Writes hooks.jsonl: one {file, posted, seconds, hook} per video.
Resumable - already-transcribed files are skipped, so a crash costs nothing.
"""
import datetime
import json
import pathlib
import subprocess
import sys
import tempfile

SRC = pathlib.Path("/Users/ragnarpitla/Movies/Instagram-Videos/jam.with.ai")
OUT = pathlib.Path(__file__).parent / "hooks.jsonl"
MODEL = "mlx-community/whisper-small-mlx"
HEAD = 12.0

FFMPEG = "/opt/homebrew/bin/ffmpeg"
FFPROBE = "/opt/homebrew/bin/ffprobe"


def duration(path: pathlib.Path) -> float:
    out = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True,
    ).stdout.strip()
    try:
        return float(out)
    except ValueError:
        return 0.0


def posted(path: pathlib.Path) -> str:
    """jam.with.ai_<epoch>_<mediaid>_<userid>.mp4"""
    try:
        return datetime.date.fromtimestamp(int(path.stem.split("_")[1])).isoformat()
    except (IndexError, ValueError, OSError):
        return "?"


def main() -> None:
    import mlx_whisper

    done = set()
    if OUT.exists():
        for line in OUT.read_text().splitlines():
            if line.strip():
                done.add(json.loads(line)["file"])

    vids = sorted(SRC.glob("*.mp4"))
    todo = [v for v in vids if v.name not in done]
    print(f"{len(vids)} videos, {len(done)} already mined, {len(todo)} to go")

    with OUT.open("a") as fh:
        for i, v in enumerate(todo, 1):
            secs = duration(v)
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
                subprocess.run(
                    [FFMPEG, "-y", "-v", "error", "-t", str(HEAD), "-i", str(v),
                     "-ac", "1", "-ar", "16000", tmp.name],
                    check=False,
                )
                try:
                    r = mlx_whisper.transcribe(
                        tmp.name, path_or_hf_repo=MODEL, language="en", fp16=True
                    )
                    hook = " ".join(r["text"].split())
                except Exception as e:  # a bad file should not kill the run
                    hook = f"<failed: {e}>"

            fh.write(json.dumps({
                "file": v.name, "posted": posted(v),
                "seconds": round(secs, 1), "hook": hook,
            }) + "\n")
            fh.flush()
            if i % 10 == 0 or i == len(todo):
                print(f"  {i}/{len(todo)}", flush=True)

    print(f"wrote {OUT}")


if __name__ == "__main__":
    sys.exit(main())
