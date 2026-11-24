// `at` on an item: the sentence of the scene (0 = first) whose start brings the item in.
// Without it, items come in one after another from the start of the scene.

export type Tone = 'ok' | 'loss' | 'plain';

export type Slip = {
  label: string; // WIN, PLACE, FREE BET…
  lines: string[]; // first line large, the rest small
  result?: string;
  tone?: Tone;
  strikeResult?: string; // a figure shown struck through before the result
  at?: number;
};

export type Line = { text: string; mark?: boolean; strike?: boolean; tone?: Tone; small?: boolean; at?: number };

export type Row = { cells: string[]; tone?: Tone; mark?: boolean; at?: number };

export type CardRow = { label?: string; value: string; mark?: boolean; tick?: boolean; at?: number };

export type CheckItem = { text: string; kind: 'good' | 'flag'; at?: number };

export type Visual =
  | { kind: 'title'; kicker: string; title: string; art?: string; big?: string }
  | { kind: 'slips'; heading?: string; slips: Slip[]; footer?: string; footerAt?: number }
  | { kind: 'lines'; heading?: string; lines: Line[] }
  | { kind: 'table'; heading?: string; head: string[]; rows: Row[]; note?: string }
  | { kind: 'card'; step?: string; heading?: string; chip?: string; rows: CardRow[]; caption?: string }
  | { kind: 'checklist'; heading?: string; items: CheckItem[] }
  | { kind: 'end'; url: string; tool: string; points?: string[] };

export type Scene = {
  say: string; // what the voice reads (numbers in words)
  caption: string; // the subtitle (numbers as figures), same number of sentences as `say`
  visual: Visual;
};

export type VideoDef = {
  slug: string;
  market: 'uk' | 'us';
  title: string;
  scenes: Scene[];
};

export type Timings = {
  duration: number;
  scenes: { start: number; end: number; sentences: { start: number; end: number }[] }[];
};
