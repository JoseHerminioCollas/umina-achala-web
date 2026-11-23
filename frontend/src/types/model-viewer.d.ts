// The <model-viewer> element (@google/model-viewer, #119), for TSX: only the
// attributes StoneModel uses. The element registers itself when its module is
// imported, which StoneModel does lazily.
import "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        // React 18 sets className on a custom element as "classname"; use class
        class?: string;
        src?: string;
        poster?: string;
        alt?: string;
        "camera-controls"?: "";
        "auto-rotate"?: "";
        "auto-rotate-delay"?: number | string;
        "rotation-per-second"?: string;
        "interaction-prompt"?: "auto" | "none";
        "touch-action"?: string;
        ar?: "";
        "ar-modes"?: string;
        "ar-scale"?: "auto" | "fixed";
        loading?: "auto" | "lazy" | "eager";
        reveal?: "auto" | "manual";
      };
    }
  }
}
