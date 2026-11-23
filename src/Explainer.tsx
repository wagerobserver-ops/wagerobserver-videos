import React from 'react';
import {
  AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import { C, SANS, SERIF, FPS } from './theme';
import type { Scene, Slip, Timings, VideoDef, Visual } from './types';

export type ExplainerProps = { video: VideoDef; timings: Timings; audio: string };

const HELP = {
  uk: { age: '18+', line: 'National Gambling Helpline 0808 8020 133 · GAMSTOP' },
  us: { age: '21+', line: '1-800-MY-RESET · 1-800-GAMBLER (NJ, PA, MI)' },
};

// Fade and rise in, staggered by index.
const useIn = (i = 0, delay = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay - i * 8, fps, config: { damping: 200 } });
  return { opacity: s, transform: `translateY(${(1 - s) * 30}px)` };
};

// The highlighter stroke drawn left to right behind a word.
const Marker: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 12 }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 14], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span style={{ position: 'relative', display: 'inline-block', padding: '0 0.15em' }}>
      <span style={{
        position: 'absolute', left: 0, top: '18%', height: '70%', width: `${w}%`,
        background: C.marker, transform: 'skewX(-6deg) rotate(-1deg)', borderRadius: 4, zIndex: 0,
      }} />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </span>
  );
};

const Strike: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 20 }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 10], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span style={{ position: 'relative', display: 'inline-block', color: C.muted }}>
      {children}
      <span style={{ position: 'absolute', left: 0, top: '52%', height: 6, width: `${w}%`, background: C.danger, borderRadius: 3 }} />
    </span>
  );
};

const Heading: React.FC<{ text?: string }> = ({ text }) =>
  text ? (
    <div style={{ ...useIn(0), fontFamily: SERIF, fontSize: 64, fontWeight: 600, color: C.ink, marginBottom: 48, textAlign: 'center' }}>
      {text}
    </div>
  ) : null;

const SlipCard: React.FC<{ slip: Slip; i: number }> = ({ slip, i }) => {
  const toneColour = slip.tone === 'ok' ? C.primary : slip.tone === 'loss' ? C.danger : C.ink;
  return (
    <div style={{
      ...useIn(i, 6), width: 400, background: C.surface, borderRadius: 18, padding: '30px 34px',
      boxShadow: '0 1px 0 #ddd5c7, 0 18px 40px -24px rgba(20,20,20,0.45)', borderTop: `10px solid ${C.primary}`,
      fontFamily: SANS, color: C.ink,
    }}>
      <div style={{ fontSize: 26, letterSpacing: 3, fontWeight: 600, color: C.primary }}>{slip.label}</div>
      {slip.lines.map((l, j) => (
        <div key={j} style={{ fontFamily: j === 0 ? SERIF : SANS, fontSize: j === 0 ? 58 : 28, marginTop: 12, color: j === 0 ? C.ink : C.text2 }}>
          {slip.strike ? <Strike>{l}</Strike> : l}
        </div>
      ))}
      {slip.result && (
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: `2px dashed ${C.line}`, fontSize: 38, fontWeight: 600, color: toneColour }}>
          {slip.tone === 'ok' ? <Marker delay={30 + i * 8}>{slip.result}</Marker> : slip.result}
        </div>
      )}
    </div>
  );
};

const VisualBlock: React.FC<{ v: Visual; market: 'uk' | 'us' }> = ({ v, market }) => {
  const f = useCurrentFrame();
  switch (v.kind) {
    case 'title': {
      const card = interpolate(f, [75, 90], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      return (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          {v.art && <Img src={staticFile(v.art)} style={{ ...useIn(0, 4), width: 760, position: 'absolute', top: 40, mixBlendMode: 'multiply' }} />}
          <div style={{ ...useIn(1, 10), position: 'absolute', bottom: 250, textAlign: 'center', width: '84%' }}>
            <div style={{ fontFamily: SANS, fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', color: C.primary, fontWeight: 600 }}>{v.kicker}</div>
            <div style={{ fontFamily: SERIF, fontSize: 76, fontWeight: 600, color: C.ink, marginTop: 10 }}>
              <Marker delay={24}>{v.title}</Marker>
            </div>
          </div>
          {/* Opening card: age and "not advice", the first thing on screen */}
          <AbsoluteFill style={{ background: C.ink, opacity: card, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: SANS, color: '#fff', fontSize: 58, fontWeight: 600, textAlign: 'center' }}>
              <span style={{ background: C.marker, color: C.ink, padding: '4px 22px', borderRadius: 10, marginRight: 24 }}>{HELP[market].age}</span>
              Educational, not betting advice
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      );
    }
    case 'slips':
      return (
        <Center>
          <Heading text={v.heading} />
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {v.slips.map((s, i) => <SlipCard key={i} slip={s} i={i} />)}
          </div>
          {v.footer && <div style={{ ...useIn(v.slips.length + 1, 6), fontFamily: SANS, fontSize: 34, color: C.text2, marginTop: 40, textAlign: 'center' }}>{v.footer}</div>}
        </Center>
      );
    case 'lines':
      return (
        <Center>
          <Heading text={v.heading} />
          {v.lines.map((l, i) => (
            <div key={i} style={{ ...useIn(i, 10 + i * 16), fontFamily: SERIF, fontSize: 60, margin: '10px 0', textAlign: 'center', color: l.tone === 'loss' ? C.danger : C.ink }}>
              {l.strike ? <Strike delay={40}>{l.text}</Strike> : l.mark ? <Marker delay={26 + i * 24}>{l.text}</Marker> : l.text}
            </div>
          ))}
        </Center>
      );
    case 'table':
      return (
        <Center>
          <Heading text={v.heading} />
          <div style={{ background: C.surface, borderRadius: 18, padding: '18px 40px', fontFamily: SANS, boxShadow: '0 18px 40px -24px rgba(20,20,20,0.45)' }}>
            {[v.head, ...v.rows].map((r, i) => (
              <div key={i} style={{
                ...useIn(i, 6), display: 'grid', gridTemplateColumns: '380px 260px 260px', fontSize: i ? 48 : 28,
                fontWeight: i ? 400 : 600, color: i ? C.ink : C.muted, letterSpacing: i ? 0 : 2, padding: '20px 0',
                borderTop: i > 1 ? `2px solid ${C.line}` : 'none', textTransform: i ? 'none' : 'uppercase',
              }}>
                {r.map((c, j) => <div key={j}>{c}</div>)}
              </div>
            ))}
          </div>
        </Center>
      );
    case 'end':
      return (
        <Center>
          <div style={{ ...useIn(0), fontFamily: SERIF, fontSize: 96, fontWeight: 600, color: C.ink }}>
            <Marker delay={14}>{v.url}</Marker>
          </div>
          <div style={{ ...useIn(1, 6), fontFamily: SANS, fontSize: 40, color: C.primary, marginTop: 24 }}>{v.tool}</div>
          <div style={{ ...useIn(2, 30), fontFamily: SANS, fontSize: 36, color: '#fff', background: C.ink, borderRadius: 14, padding: '22px 36px', marginTop: 70 }}>
            <b style={{ color: C.marker }}>{HELP[market].age}</b> · {HELP[market].line}
          </div>
        </Center>
      );
  }
};

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 170 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{children}</div>
  </AbsoluteFill>
);

// Subtitles: the scene's caption, one sentence at a time, timed by its share of the scene's length.
const Captions: React.FC<{ scene: Scene; frames: number }> = ({ scene, frames }) => {
  const f = useCurrentFrame();
  const parts = scene.caption.match(/[^.!?]+[.!?]+/g) ?? [scene.caption];
  const total = parts.reduce((a, p) => a + p.length, 0);
  let acc = 0;
  let current = parts[parts.length - 1];
  for (const p of parts) {
    const end = ((acc + p.length) / total) * frames;
    if (f < end) { current = p; break; }
    acc += p.length;
  }
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: vertical ? 260 : 56 }}>
      <div style={{
        maxWidth: vertical ? '88%' : '78%', background: 'rgba(20,20,20,0.86)', color: '#fff', fontFamily: SANS,
        fontSize: vertical ? 50 : 40, lineHeight: 1.3, padding: '14px 28px', borderRadius: 12, textAlign: 'center',
      }}>
        {current.trim()}
      </div>
    </AbsoluteFill>
  );
};

export const Explainer: React.FC<ExplainerProps> = ({ video, timings, audio }) => {
  const help = HELP[video.market];
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Audio src={staticFile(audio)} />
      {video.scenes.map((s, i) => {
        const t = timings.scenes[i];
        const next = timings.scenes[i + 1];
        const from = Math.round(t.start * FPS);
        const to = next ? Math.round(next.start * FPS) : Math.round((timings.duration + 1.5) * FPS);
        const speech = Math.round((t.end - t.start) * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <VisualBlock v={s.visual} market={video.market} />
            <Sequence durationInFrames={speech + 8}><Captions scene={s} frames={speech} /></Sequence>
          </Sequence>
        );
      })}
      {/* Persistent marks: brand and age, top corners */}
      <div style={{ position: 'absolute', top: 34, left: 44, fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: C.ink }}>WagerObserver</div>
      <div style={{ position: 'absolute', top: 30, right: 44, fontFamily: SANS, fontSize: 26, fontWeight: 600, background: C.ink, color: '#fff', padding: '6px 14px', borderRadius: 8 }}>{help.age}</div>
    </AbsoluteFill>
  );
};
