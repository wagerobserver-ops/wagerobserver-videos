# wagerobserver-videos: how to work in this repo

Short educational explainer videos for WagerObserver's YouTube channel (@WagerObserver), the site's guides and the social cuts. Public repo on purpose: GitHub Actions minutes are free for public repos, so renders don't spend the site repo's minutes. Never commit a secret; keys live in the repository's Actions secrets.

The plan, the rules and the calendar are in the Project doc `claude/video-plano.md`; finished scripts are in `claude/video-guioes.md`. The conversation that owns this repo is "video" (label `para:video` on the site repo, wagerobserver-ops/wagerobserver).

## What a video may and may not show

- Educational only: how a bet works, what terms mean, how to check a licence. Each video answers one question and points to the site page that goes deeper.
- Never: operators' names, logos, offers, bonuses, odds or promo codes, `/go/` links, people, athletes, badges, cartoons, money flying, urgency, "risk-free", "guaranteed" or any word on the site's *Never* list.
- Every video: the card "18+ · Educational, not betting advice" first; the age always in a corner; the age and the helpline at the end and in the description (UK: National Gambling Helpline 0808 8020 133 and GAMSTOP; US: 21+, 1-800-MY-RESET and 1-800-GAMBLER in NJ, PA and MI); the affiliate disclosure and "Narration: synthetic voice" in the description.
- Every figure matches the site page it explains (same sums, same rules). Every script and description passes the `wo-compliance-check` skill before it is rendered; the verdict goes in `scripts/compliance.md`.

## How a video is made

1. **Script:** `scripts/<slug>.md` (scenes: what is on screen and what is said, the description, the figures checked against the page).
2. **Data:** `data/<slug>.json`: for each scene `say` (what the voice reads, numbers in words: "ten to one", "oh eight oh eight…"), `caption` (the subtitle, numbers as figures) and `visual` (one of the kinds in `src/types.ts`). Register it in `src/videos.ts`. Items can carry `at`: the sentence of the scene (0 = first; 2.5 = halfway through the third) when they come in, so the picture follows the voice. `say` and `caption` need the same number of sentences: subtitles change sentence by sentence.
3. **Voice:** `python3 tools/tts.py <slug>` with Kokoro (kokoro-onnx, model v1.0, voice `bf_emma`, chosen by Tiago on 23 Nov 2026), speed 0.84 (about 150 to 170 words a minute, every video under 100 s). It writes `public/audio/<slug>/full.wav` (not committed) and `data/<slug>.timings.json` (committed: start and end of every scene and every sentence).
4. **Render:** `npx remotion render src/index.ts <slug>-wide out/<slug>-wide.mp4` (16:9) and `<slug>-tall` (9:16, for Shorts, X, LinkedIn and Bluesky). The workflow `render.yml` does steps 3 and 4 on GitHub and keeps the MP4s as an artifact.
5. **Upload:** `upload.yml` (by hand: slug and the time it goes public) renders the video and runs `tools/upload.mjs`: private, scheduled with `publishAt`, not made for kids, synthetic media declared, category Education, en-GB, the description from the script's "## Description" (it refuses one without 18+, the disclosure or "synthetic voice"), and the thumbnail. `node tools/upload.mjs <slug> --dry-run` shows what it would send. Secrets `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`: OAuth client "wagerobserver-videos upload" in the Google Cloud project `wagerobserver` (app "WagerObserver Videos", in production), authorised by the channel's account on 25 Nov 2026; Tiago adds them in the repository's settings (this session's proxy can't). The API can't set two things, done in YouTube Studio for each video: age restriction (18+) and comments off. First upload: each-way, https://youtu.be/9TEatCvzzwQ, on 25 Nov 2026, scheduled for 1 Dec 2026 12:00 UTC; it stayed "Scheduled" (not stuck in private), the thumbnail was accepted, 18+ and comments off set in Studio.

## Look

The site's colours, fonts (Fraunces, IBM Plex Sans) and collage art (`public/art/`, copied from the site's `public/art/`, rules in the site's `art/STYLE.md`). Cream paper, slips, figures and the yellow highlighter on the detail that matters. Losses in the site's danger red.
