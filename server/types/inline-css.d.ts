declare module "inline-css" {
  type InlineCssOptions = {
    url?: string;
    extraCss?: string;
    applyLinkTags?: boolean;
    applyStyleTags?: boolean;
    applyWidthAttributes?: boolean;
    applyTableAttributes?: boolean;
    removeStyleTags?: boolean;
    preserveMediaQueries?: boolean;
    preserveFontFaces?: boolean;
    codeBlocks?: Record<string, { start: string; end: string }>;
    [key: string]: unknown;
  };

  export default function inlineCss(
    html: string,
    options?: InlineCssOptions,
  ): Promise<string>;
}
