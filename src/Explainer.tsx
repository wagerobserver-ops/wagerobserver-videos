import React, { createContext, useContext } from 'react';
import {
  AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import { C, SANS, SERIF, FPS } from './theme';
import type { CardRow, CheckItem, Line, Row, Scene, Slip, Timings, Tone, VideoDef, Visual } from './types';

export type ExplainerProps = { video: VideoDef; timings: Timings; audio: string };

const HELP = {
  uk: { age: '18+', line: 'National Gambling Helpline 0808 8020 133 · GAMSTOP' },
  us: { age: '21+', line: '1-800-MY-RESET · 1-800-GAMBLER (NJ, PA, MI)' },
};

// Frame (from the start of the scene) at which each sentence of the scene starts.
// `at` may be fractional: 2.5 is halfway through the third sentence.
const SentenceStarts = createContext<{ starts: number[]; ends: number[] }>({ starts: [0], ends: [0] });
const useLayout = () => {
  const { width, height } = useVideoConfig();
  return { tall: height > width, width, height };
};

const delayFor = ({ starts, ends }: { starts: number[]; ends: number[] }, at: number | undefined, i: number) => {
  if (at === undefined) return 6 + i * 8;
  const k = Math.min(Math.floor(at), starts.length - 1);
  return Math.max(0, Math.round(starts[k] + (at - k) * (ends[k] - starts[k])) - 4);
};

// Fade and rise in from a given frame.
const useIn = (delay: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 200 } });
  return { opacity: s, transform: `translateY(${(1 - s) * 30}px)` };
};
const useItem = (at: number | undefined, i: number) => {
  const starts = useContext(SentenceStarts);
  const d = delayFor(starts, at, i);
  return { style: useIn(d), delay: d };
};

const toneColour = (t?: Tone) => (t === 'ok' ? C.primary : t === 'loss' ? C.danger : C.ink);

// The highlighter stroke drawn left to right behind a word.
const Marker: React.FC<{ children: React.ReactNode; delay: number }> = ({ children, delay }) => {
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

const Strike: React.FC<{ children: React.ReactNode; delay: number }> = ({ children, delay }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 10], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span style={{ position: 'relative', display: 'inline-block', color: C.muted }}>
      {children}
      <span style={{ position: 'absolute', left: '-2%', top: '50%', height: 6, width: `${w * 1.04}%`, background: C.danger, borderRadius: 3 }} />
    </span>
  );
};

const Tick: React.FC<{ kind: 'good' | 'flag' }> = ({ kind }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 26,
    background: kind === 'good' ? C.primary : C.danger, color: '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 32, flexShrink: 0,
  }}>{kind === 'good' ? '✓' : '!'}</span>
);

const Heading: React.FC<{ text?: string; step?: string }> = ({ text, step }) => {
  const s = useIn(0);
  const { tall } = useLayout();
  if (!text && !step) return null;
  return (
    <div style={{ ...s, textAlign: 'center', marginBottom: 44 }}>
      {step && <div style={{ fontFamily: SANS, fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', color: C.primary, fontWeight: 600, marginBottom: 8 }}>{step}</div>}
      {text && <div style={{ fontFamily: SERIF, fontSize: tall ? 60 : 64, fontWeight: 600, color: C.ink, lineHeight: 1.15 }}>{text}</div>}
    </div>
  );
};

const panel: React.CSSProperties = {
  background: C.surface, borderRadius: 18, boxShadow: '0 1px 0 #ddd5c7, 0 18px 40px -24px rgba(20,20,20,0.45)',
};

const SlipCard: React.FC<{ slip: Slip; i: number }> = ({ slip, i }) => {
  const { style, delay } = useItem(slip.at, i);
  const { tall } = useLayout();
  return (
    <div style={{ ...style, ...panel, width: tall ? 430 : 420, padding: '28px 32px', borderTop: `10px solid ${C.primary}`, fontFamily: SANS, color: C.ink }}>
      <div style={{ fontSize: 26, letterSpacing: 3, fontWeight: 600, color: C.primary }}>{slip.label}</div>
      {slip.lines.map((l, j) => (
        <div key={j} style={{ fontFamily: j === 0 ? SERIF : SANS, fontSize: j === 0 ? 58 : 28, marginTop: 10, color: j === 0 ? C.ink : C.text2 }}>{l}</div>
      ))}
      {slip.result && (
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: `2px dashed ${C.line}`, fontSize: 38, fontWeight: 600, color: toneColour(slip.tone) }}>
          {slip.strikeResult && <><Strike delay={delay + 24}>{slip.strikeResult}</Strike>{'  '}</>}
          {slip.tone === 'ok' || slip.strikeResult ? <Marker delay={delay + 34}>{slip.result}</Marker> : slip.result}
        </div>
      )}
    </div>
  );
};

const LineRow: React.FC<{ l: Line; i: number }> = ({ l, i }) => {
  const { style, delay } = useItem(l.at, i);
  const { tall } = useLayout();
  const size = l.small ? 40 : tall ? 58 : 62;
  return (
    <div style={{ ...style, fontFamily: l.small ? SANS : SERIF, fontSize: size, margin: '10px 0', textAlign: 'center', color: l.small ? C.text2 : toneColour(l.tone), maxWidth: tall ? 960 : 1500 }}>
      {l.strike ? <Strike delay={delay + 18}>{l.text}</Strike> : l.mark ? <Marker delay={delay + 12}>{l.text}</Marker> : l.text}
    </div>
  );
};

const TableRow: React.FC<{ r: Row; i: number; cols: string; head?: boolean }> = ({ r, i, cols, head }) => {
  const { style, delay } = useItem(head ? 0 : r.at, i);
  const { tall } = useLayout();
  return (
    <div style={{
      ...style, display: 'grid', gridTemplateColumns: cols, fontSize: head ? 24 : tall ? 40 : 46, fontWeight: head ? 600 : 400,
      color: head ? C.muted : toneColour(r.tone), letterSpacing: head ? 2 : 0, padding: '18px 0', columnGap: 24,
      borderTop: !head && i > 1 ? `2px solid ${C.line}` : 'none', textTransform: head ? 'uppercase' : 'none',
    }}>
      {r.cells.map((c, j) => <div key={j}>{r.mark && j === r.cells.length - 1 ? <Marker delay={delay + 14}>{c}</Marker> : c}</div>)}
    </div>
  );
};

const CardLine: React.FC<{ r: CardRow; i: number }> = ({ r, i }) => {
  const { style, delay } = useItem(r.at, i);
  const { tall } = useLayout();
  return (
    <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 20, padding: '16px 0', borderTop: i ? `2px solid ${C.line}` : 'none', fontFamily: SANS }}>
      {r.label && <div style={{ width: tall ? 220 : 260, fontSize: 26, color: C.muted, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>{r.label}</div>}
      <div style={{ flex: 1, fontSize: tall ? 38 : 42, color: C.ink }}>{r.mark ? <Marker delay={delay + 12}>{r.value}</Marker> : r.value}</div>
      {r.tick && <Tick kind="good" />}
    </div>
  );
};

const CheckRow: React.FC<{ c: CheckItem; i: number }> = ({ c, i }) => {
  const { style } = useItem(c.at, i);
  const { tall } = useLayout();
  return (
    <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 26, padding: '14px 0', fontFamily: SANS, fontSize: tall ? 42 : 46, color: C.ink }}>
      <Tick kind={c.kind} />
      <span>{c.text}</span>
    </div>
  );
};

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tall } = useLayout();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: tall ? 380 : 170, paddingTop: tall ? 120 : 60 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{children}</div>
    </AbsoluteFill>
  );
};

const OpeningCard: React.FC<{ age: string }> = ({ age }) => {
  const f = useCurrentFrame();
  const { tall } = useLayout();
  const o = interpolate(f, [75, 90], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.ink, opacity: o, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: SANS, color: '#fff', fontSize: tall ? 56 : 58, fontWeight: 600, textAlign: 'center', lineHeight: 1.6 }}>
        <span style={{ background: C.marker, color: C.ink, padding: '4px 22px', borderRadius: 10, marginRight: tall ? 0 : 24 }}>{age}</span>
        {tall ? <br /> : null}
        Educational, not betting advice
      </div>
    </AbsoluteFill>
  );
};

const Footer: React.FC<{ text: string; at?: number; i: number }> = ({ text, at, i }) => {
  const { style } = useItem(at, i);
  return <div style={{ ...style, fontFamily: SANS, fontSize: 34, color: C.text2, marginTop: 40, textAlign: 'center' }}>{text}</div>;
};

const VisualBlock: React.FC<{ v: Visual; market: 'uk' | 'us'; first: boolean }> = ({ v, market, first }) => {
  const { tall } = useLayout();
  const s1 = useIn(4);
  const s2 = useIn(10);
  const s3 = useIn(30);
  switch (v.kind) {
    case 'title':
      return (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          {v.art && <Img src={staticFile(v.art)} style={{ ...s1, width: tall ? 900 : 720, position: 'absolute', top: tall ? 260 : 40, mixBlendMode: 'multiply' }} />}
          {v.big && !v.art && <div style={{ ...s1, position: 'absolute', top: tall ? 420 : 150, fontFamily: SERIF, fontWeight: 700, fontSize: tall ? 300 : 280, color: C.ink }}><Marker delay={20}>{v.big}</Marker></div>}
          <div style={{ ...s2, position: 'absolute', bottom: tall ? 560 : 250, textAlign: 'center', width: '86%' }}>
            <div style={{ fontFamily: SANS, fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', color: C.primary, fontWeight: 600 }}>{v.kicker}</div>
            <div style={{ fontFamily: SERIF, fontSize: tall ? 66 : 74, fontWeight: 600, color: C.ink, marginTop: 10, lineHeight: 1.2 }}>
              {v.art ? <Marker delay={24}>{v.title}</Marker> : v.title}
            </div>
          </div>
          {first && <OpeningCard age={HELP[market].age} />}
        </AbsoluteFill>
      );
    case 'slips':
      return (
        <Center>
          <Heading text={v.heading} />
          <div style={{ display: 'flex', gap: tall ? 30 : 40, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap', maxWidth: tall ? 1000 : 1800 }}>
            {v.slips.map((s, i) => <SlipCard key={i} slip={s} i={i} />)}
          </div>
          {v.footer && <Footer text={v.footer} at={v.footerAt} i={v.slips.length + 1} />}
        </Center>
      );
    case 'lines':
      return (
        <Center>
          <Heading text={v.heading} />
          {v.lines.map((l, i) => <LineRow key={i} l={l} i={i} />)}
        </Center>
      );
    case 'table': {
      const n = v.head.length;
      const cols = tall ? `repeat(${n}, ${Math.floor(860 / n)}px)` : n === 3 ? '420px 300px 300px' : n === 4 ? '440px 220px 300px 200px' : `repeat(${n}, ${Math.floor(1400 / n)}px)`;
      return (
        <Center>
          <Heading text={v.heading} />
          <div style={{ ...panel, padding: '14px 40px', fontFamily: SANS }}>
            <TableRow r={{ cells: v.head }} i={0} cols={cols} head />
            {v.rows.map((r, i) => <TableRow key={i} r={r} i={i + 1} cols={cols} />)}
          </div>
          {v.note && <div style={{ ...s3, fontFamily: SANS, fontSize: 28, color: C.muted, marginTop: 22 }}>{v.note}</div>}
        </Center>
      );
    }
    case 'card':
      return (
        <Center>
          <Heading text={v.heading} step={v.step} />
          <div style={{ ...s1, ...panel, padding: '22px 44px', width: tall ? 940 : 1200, position: 'relative', borderTop: `10px solid ${C.ink}` }}>
            {v.chip && <div style={{ position: 'absolute', top: -58, right: 0, fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', background: C.chip, color: C.text2, padding: '6px 16px', borderRadius: 8 }}>{v.chip}</div>}
            {v.rows.map((r, i) => <CardLine key={i} r={r} i={i} />)}
          </div>
          {v.caption && <div style={{ ...s3, fontFamily: SANS, fontSize: 30, color: C.muted, marginTop: 24 }}>{v.caption}</div>}
        </Center>
      );
    case 'checklist':
      return (
        <Center>
          <Heading text={v.heading} />
          <div style={{ ...panel, padding: '20px 48px', minWidth: tall ? 900 : 1000 }}>
            {v.items.map((c, i) => <CheckRow key={i} c={c} i={i} />)}
          </div>
        </Center>
      );
    case 'end':
      return (
        <Center>
          {v.points && <div style={{ ...s1, display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', maxWidth: tall ? 960 : 1600, marginBottom: 60 }}>
            {v.points.map((p) => <span key={p} style={{ fontFamily: SANS, fontSize: 34, background: C.surface, border: `2px solid ${C.line}`, borderRadius: 40, padding: '10px 26px', color: C.ink }}>{p}</span>)}
          </div>}
          <div style={{ ...s1, fontFamily: SERIF, fontSize: tall ? 84 : 96, fontWeight: 600, color: C.ink }}><Marker delay={14}>{v.url}</Marker></div>
          <div style={{ ...s2, fontFamily: SANS, fontSize: 40, color: C.primary, marginTop: 20 }}>{v.tool}</div>
          <div style={{ ...s3, fontFamily: SANS, fontSize: tall ? 34 : 36, color: '#fff', background: C.ink, borderRadius: 14, padding: '22px 36px', marginTop: 60, textAlign: 'center', maxWidth: tall ? 960 : 1600 }}>
            <b style={{ color: C.marker }}>{HELP[market].age}</b> · {HELP[market].line}
          </div>
        </Center>
      );
  }
};

// Subtitles: the caption sentence that is being spoken, from its start to the next one's.
const Captions: React.FC<{ scene: Scene; starts: number[]; ends: number[] }> = ({ scene, starts, ends }) => {
  const f = useCurrentFrame();
  const { tall } = useLayout();
  const parts = scene.caption.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  let idx = -1;
  for (let i = 0; i < starts.length; i++) if (f >= starts[i]) idx = i;
  if (idx < 0 || f > ends[ends.length - 1] + 10) return null;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: tall ? 250 : 52 }}>
      <div style={{
        maxWidth: tall ? '88%' : '76%', background: 'rgba(20,20,20,0.88)', color: '#fff', fontFamily: SANS,
        fontSize: tall ? 48 : 40, lineHeight: 1.3, padding: '14px 28px', borderRadius: 12, textAlign: 'center',
      }}>
        {parts[idx]}
      </div>
    </AbsoluteFill>
  );
};

export const Explainer: React.FC<ExplainerProps> = ({ video, timings, audio }) => {
  const help = HELP[video.market];
  const { tall } = useLayout();
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Audio src={staticFile(audio)} />
      {video.scenes.map((s, i) => {
        const t = timings.scenes[i];
        const next = timings.scenes[i + 1];
        const from = Math.round(t.start * FPS);
        const to = next ? Math.round(next.start * FPS) : Math.round(timings.duration * FPS);
        const starts = t.sentences.map((x) => Math.round((x.start - t.start) * FPS));
        const ends = t.sentences.map((x) => Math.round((x.end - t.start) * FPS));
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <SentenceStarts.Provider value={{ starts, ends }}>
              <VisualBlock v={s.visual} market={video.market} first={i === 0} />
              <Captions scene={s} starts={starts} ends={ends} />
            </SentenceStarts.Provider>
          </Sequence>
        );
      })}
      {/* Persistent marks: brand and age, top corners */}
      <div style={{ position: 'absolute', top: tall ? 70 : 34, left: 44, fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: C.ink }}>WagerObserver</div>
      <div style={{ position: 'absolute', top: tall ? 66 : 30, right: 44, fontFamily: SANS, fontSize: 26, fontWeight: 600, background: C.ink, color: '#fff', padding: '6px 14px', borderRadius: 8 }}>{help.age}</div>
    </AbsoluteFill>
  );
};
