"""Narrate the each-way script scene by scene with one Kokoro voice.
Usage: python3 scenes.py <voice> <speed> <outdir>
Writes scene-N.wav, full.mp3-ready full.wav and timings.json (start/end of each scene)."""
import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

M = "/home/claude/models/"
SCENES = [
    "An each-way bet is two bets in one. Here's what each half pays, and when a place still loses you money.",
    "Five pounds each way costs ten pounds: five on your horse to win, and five on it to finish in the places.",
    "Say it's ten to one, and the race pays a fifth of the odds for the first three. The place part is priced at two to one. "
    "If your horse wins, both bets pay: seventy pounds back. If it finishes second or third, only the place bet pays: "
    "fifteen pounds back from your ten. Anywhere else, you lose the ten.",
    "The places depend on the race. With five to seven runners, it's usually a quarter of the odds for the first two. "
    "Eight or more, a fifth for the first three. Big handicaps pay three or four places. Your bet slip shows the terms that count.",
    "Now the catch. At short prices, a place can still cost you. At three to one with a fifth of the odds, the place part pays "
    "just three-fifths: eight pounds back from your ten. A place only makes a profit when the odds are bigger than five to one, "
    "or four to one with quarter terms.",
    "And if horses are withdrawn, the terms follow the runners that actually start: an eight-runner race cut to seven pays "
    "two places, not three.",
    "Work out any each-way bet with our free calculator at Wager Observer. Gambling is for over-eighteens. "
    "If it stops being fun, the National Gambling Helpline is free on oh eight oh eight, eight oh two oh, one three three.",
]
GAP = 0.6  # seconds of silence between scenes

voice, speed, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
k = Kokoro(M + "kokoro-v1.0.onnx", M + "voices-v1.0.bin")
parts, timings, t = [], [], 0.0
for i, text in enumerate(SCENES, 1):
    audio, sr = k.create(text, voice=voice, speed=speed, lang="en-gb")
    sf.write(f"{out}/scene-{i}.wav", audio, sr)
    d = len(audio) / sr
    timings.append({"scene": i, "start": round(t, 2), "end": round(t + d, 2), "words": len(text.split())})
    parts += [audio, np.zeros(int(GAP * sr), dtype=audio.dtype)]
    t += d + GAP
full = np.concatenate(parts)
sf.write(f"{out}/full.wav", full, sr)
words = sum(x["words"] for x in timings)
json.dump({"voice": voice, "speed": speed, "duration": round(t, 2), "wpm": round(words / (t / 60)), "scenes": timings},
          open(f"{out}/timings.json", "w"), indent=1)
print(voice, speed, round(t, 1), "s", round(words / (t / 60)), "wpm")
