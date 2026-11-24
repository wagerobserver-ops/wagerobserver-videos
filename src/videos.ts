import type { Timings, VideoDef } from './types';
import eachWay from '../data/each-way.json';
import eachWayT from '../data/each-way.timings.json';
import fractional from '../data/fractional-odds.json';
import fractionalT from '../data/fractional-odds.timings.json';
import wagering from '../data/wagering-10x.json';
import wageringT from '../data/wagering-10x.timings.json';
import licence from '../data/check-ukgc-licence.json';
import licenceT from '../data/check-ukgc-licence.timings.json';

// Every video: its data, the timings written by tools/tts.py and its narration.
export const VIDEOS: { video: VideoDef; timings: Timings }[] = [
  { video: eachWay as VideoDef, timings: eachWayT },
  { video: fractional as VideoDef, timings: fractionalT },
  { video: wagering as VideoDef, timings: wageringT },
  { video: licence as VideoDef, timings: licenceT },
];
