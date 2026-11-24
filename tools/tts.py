"""Narrate one video with Kokoro, sentence by sentence, and record when each sentence is spoken.

Usage: python3 tools/tts.py <slug> [--voice bf_emma] [--speed 0.8]

Reads data/<slug>.json (scenes with `say` and `caption`), writes public/audio/<slug>/full.wav
and data/<slug>.timings.json. The `say` and `caption` of a scene must have the same number of
sentences: subtitles are shown sentence by sentence, at the time that sentence is spoken.
Model files are downloaded into models/ (not committed) the first time.
"""
import argparse, json, re, sys, urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / "models"
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = ["kokoro-v1.0.onnx", "voices-v1.0.bin"]
PAUSE_SENTENCE = 0.28  # seconds between sentences of a scene
PAUSE_SCENE = 0.7  # seconds between scenes
TAIL = 1.5  # seconds of silence after the last scene



def sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--voice", default="bf_emma")
    ap.add_argument("--speed", type=float, default=0.8)
    a = ap.parse_args()

    video = json.loads((ROOT / "data" / f"{a.slug}.json").read_text())
    problems = []
    for i, sc in enumerate(video["scenes"], 1):
        s, c = sentences(sc["say"]), sentences(sc["caption"])
        if len(s) != len(c):
            problems.append(f"scene {i}: say has {len(s)} sentences, caption has {len(c)}")
    if problems:
        sys.exit("\n".join(problems))

    MODELS.mkdir(exist_ok=True)
    for f in FILES:
        if not (MODELS / f).exists():
            print("downloading", f)
            urllib.request.urlretrieve(MODEL_URL + f, MODELS / f)

    from kokoro_onnx import Kokoro

    k = Kokoro(str(MODELS / FILES[0]), str(MODELS / FILES[1]))
    sr = 24000
    parts, scenes, t, words = [], [], 0.0, 0
    for i, sc in enumerate(video["scenes"]):
        if i:
            parts.append(np.zeros(int(PAUSE_SCENE * sr), dtype=np.float32))
            t += PAUSE_SCENE
        start, sents = t, []
        for j, text in enumerate(sentences(sc["say"])):
            if j:
                parts.append(np.zeros(int(PAUSE_SENTENCE * sr), dtype=np.float32))
                t += PAUSE_SENTENCE
            audio, sr = k.create(text, voice=a.voice, speed=a.speed, lang="en-gb")
            audio = audio.astype(np.float32)
            parts.append(audio)
            d = len(audio) / sr
            sents.append({"start": round(t, 3), "end": round(t + d, 3)})
            t += d
            words += len(text.split())
        scenes.append({"start": round(start, 3), "end": round(t, 3), "sentences": sents})
    parts.append(np.zeros(int(TAIL * sr), dtype=np.float32))
    full = np.concatenate(parts)
    peak = float(np.max(np.abs(full))) or 1.0
    full = full / peak * 0.89  # about -1 dBFS

    out = ROOT / "public" / "audio" / a.slug
    out.mkdir(parents=True, exist_ok=True)
    sf.write(out / "full.wav", full, sr)
    speech = t
    timings = {
        "voice": a.voice, "speed": a.speed, "duration": round(t + TAIL, 3),
        "wpm": round(words / (speech / 60)), "scenes": scenes,
    }
    (ROOT / "data" / f"{a.slug}.timings.json").write_text(json.dumps(timings, indent=1) + "\n")
    print(f"{a.slug}: {timings['duration']} s, {timings['wpm']} words a minute, voice {a.voice} at {a.speed}")


if __name__ == "__main__":
    main()
