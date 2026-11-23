import React from 'react';
import { Composition } from 'remotion';
import '@fontsource-variable/fraunces';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/600.css';
import { Explainer } from './Explainer';
import { FPS } from './theme';
import { eachWay } from '../data/each-way';
import eachWayTimings from '../data/each-way.timings.json';

const VIDEOS = [{ video: eachWay, timings: eachWayTimings, audio: 'audio/each-way/full.wav' }];

export const Root: React.FC = () => (
  <>
    {VIDEOS.map(({ video, timings, audio }) => {
      const frames = Math.round((timings.duration + 1.5) * FPS);
      const props = { video, timings, audio };
      return (
        <React.Fragment key={video.slug}>
          <Composition id={`${video.slug}-wide`} component={Explainer} durationInFrames={frames} fps={FPS} width={1920} height={1080} defaultProps={props} />
          <Composition id={`${video.slug}-tall`} component={Explainer} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={props} />
        </React.Fragment>
      );
    })}
  </>
);
