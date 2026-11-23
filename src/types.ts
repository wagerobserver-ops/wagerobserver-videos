export type Slip = {
  label: string; // WIN, PLACE, FREE BET…
  lines: string[]; // e.g. ['£5 at 10/1']
  result?: string; // e.g. '£55 back'
  tone?: 'ok' | 'loss' | 'plain';
  strike?: boolean;
};

export type Visual =
  | { kind: 'title'; kicker: string; title: string; art?: string }
  | { kind: 'slips'; heading?: string; slips: Slip[]; footer?: string }
  | { kind: 'lines'; heading?: string; lines: { text: string; mark?: boolean; strike?: boolean; tone?: 'loss' | 'ok' }[] }
  | { kind: 'table'; heading?: string; head: string[]; rows: string[][]; strikeRow?: number }
  | { kind: 'end'; url: string; tool: string };

export type Scene = {
  say: string; // what the voice reads (numbers in words)
  caption: string; // what the subtitles show (numbers as figures)
  visual: Visual;
};

export type Timings = {
  duration: number;
  scenes: { scene: number; start: number; end: number }[];
};

export type VideoDef = {
  slug: string;
  market: 'uk' | 'us';
  scenes: Scene[];
};
