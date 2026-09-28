/*
  The scene's colors and label font come from the design tokens
  (design-tokens.css, typography.css), never from hex values in this folder,
  so the 3D system and the rest of the site always share one palette.
*/

export interface Palette {
  background: string;
  surface: string;
  borderSubtle: string;
  borderDefault: string;
  textMuted: string;
  textSecondary: string;
  brand: string;
  fontMono: string;
}

export function readPalette(): Palette {
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();

  return {
    background: token("--color-bg-primary"),
    surface: token("--color-surface"),
    borderSubtle: token("--color-border-subtle"),
    borderDefault: token("--color-border-default"),
    textMuted: token("--color-text-muted"),
    textSecondary: token("--color-text-secondary"),
    brand: token("--color-brand"),
    fontMono: token("--font-mono"),
  };
}
