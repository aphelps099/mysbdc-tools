import {Composition} from 'remotion';
import {WebinarTeaser, teaserSchema, TEASER_DEFAULTS} from './WebinarTeaser';

// 450 frames @ 30 fps = 15 s. LinkedIn feed favors square (1:1) and
// vertical (4:5); wide (16:9) suits YouTube and event pages.
export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="TeaserSquare"
        component={WebinarTeaser}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
        schema={teaserSchema}
        defaultProps={TEASER_DEFAULTS}
      />
      <Composition
        id="TeaserVertical"
        component={WebinarTeaser}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1350}
        schema={teaserSchema}
        defaultProps={TEASER_DEFAULTS}
      />
      <Composition
        id="TeaserWide"
        component={WebinarTeaser}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        schema={teaserSchema}
        defaultProps={TEASER_DEFAULTS}
      />
    </>
  );
};
