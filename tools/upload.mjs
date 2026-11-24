// Upload one rendered video to the WagerObserver YouTube channel as a private video, scheduled
// to go public at the given time (YouTube publishes it then), with the description from the script.
//
//   node tools/upload.mjs <slug> [--publish 2026-12-01T12:00:00Z] [--dry-run]
//
// Needs the repository secrets YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN (an OAuth
// client of the Google Cloud project "wagerobserver", authorised once by the channel's owner
// with the scope https://www.googleapis.com/auth/youtube.upload). Never commit them.
//
// What the API can't set, done once per video in YouTube Studio after the upload:
// age restriction (18+); comments off is a channel upload default.
import { readFileSync, statSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const dry = args.includes('--dry-run');
const publishAt = args.includes('--publish') ? args[args.indexOf('--publish') + 1] : null;
if (!slug) throw new Error('usage: node tools/upload.mjs <slug> [--publish ISO] [--dry-run]');

const data = JSON.parse(readFileSync(`data/${slug}.json`, 'utf8'));
const script = readFileSync(`scripts/${slug}.md`, 'utf8');

// The description is the block quote under "## Description" in the script.
export function description(md) {
  const part = md.split(/^## Description\s*$/m)[1];
  if (!part) throw new Error('script has no "## Description" section');
  const lines = [];
  for (const line of part.split('\n').slice(1)) {
    if (line.startsWith('## ')) break;
    if (line.startsWith('>')) lines.push(line.replace(/^> ?/, ''));
    else if (lines.length && line.trim() === '') break;
  }
  const text = lines.join('\n').trim();
  for (const must of ['18+', 'synthetic voice', 'affiliate-disclosure']) {
    if (!text.includes(must)) throw new Error(`description lacks "${must}"`);
  }
  return text;
}

const body = {
  snippet: {
    title: data.title,
    description: description(script),
    categoryId: '27', // Education
    defaultLanguage: 'en-GB',
    defaultAudioLanguage: 'en-GB',
    tags: ['betting explained', 'UK betting', 'responsible gambling', slug.replace(/-/g, ' ')],
  },
  status: {
    privacyStatus: 'private',
    ...(publishAt ? { publishAt } : {}),
    selfDeclaredMadeForKids: false,
    containsSyntheticMedia: true, // synthetic narration, said in the description too
    embeddable: true,
  },
};
if (data.title.length > 100 || /[<>]/.test(data.title)) throw new Error('title: at most 100 characters, no < or >');

const file = `out/${slug}-wide.mp4`;
if (dry) {
  console.log(JSON.stringify(body, null, 2));
  console.log(existsSync(file) ? `${file}: ${statSync(file).size} bytes` : `${file}: not rendered yet`);
  process.exit(0);
}

const env = (k) => process.env[k] || (() => { throw new Error(`missing ${k}`); })();
const token = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: env('YT_CLIENT_ID'), client_secret: env('YT_CLIENT_SECRET'),
    refresh_token: env('YT_REFRESH_TOKEN'), grant_type: 'refresh_token',
  }),
}).then(async (r) => { if (!r.ok) throw new Error(`token: ${r.status} ${await r.text()}`); return (await r.json()).access_token; });

const size = statSync(file).size;
const start = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
  method: 'POST',
  headers: {
    authorization: `Bearer ${token}`, 'content-type': 'application/json; charset=UTF-8',
    'x-upload-content-length': String(size), 'x-upload-content-type': 'video/mp4',
  },
  body: JSON.stringify(body),
});
if (!start.ok) throw new Error(`start upload: ${start.status} ${await start.text()}`);
const put = await fetch(start.headers.get('location'), {
  method: 'PUT',
  headers: { 'content-type': 'video/mp4', 'content-length': String(size) },
  body: readFileSync(file),
});
if (!put.ok) throw new Error(`upload: ${put.status} ${await put.text()}`);
const video = await put.json();
console.log(`uploaded ${slug}: https://youtu.be/${video.id} (${video.status.privacyStatus}${publishAt ? `, public at ${publishAt}` : ''})`);

// Custom thumbnail: needs a verified channel; a refusal here doesn't undo the upload.
const thumb = `out/${slug}-thumb.png`;
if (existsSync(thumb)) {
  const t = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${video.id}`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'image/png' }, body: readFileSync(thumb),
  });
  console.log(t.ok ? 'thumbnail set' : `thumbnail not set (${t.status}): verify the channel at youtube.com/verify`);
}
console.log('Still to do in YouTube Studio: age restriction (18+) on this video.');
