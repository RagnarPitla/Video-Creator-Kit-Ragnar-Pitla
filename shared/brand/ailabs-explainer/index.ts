/**
 * `ailabs-explainer` -- a portable Remotion component library for the flat,
 * skeleton-UI explainer style measured in `references/ailabs-unlazy/TEARDOWN.md`.
 *
 * Import the whole surface from here so a consumer never has to know the file
 * layout: `import { Canvas, TreeDiagram, ailabsTheme } from ".../ailabs-explainer";`
 */
export { ailabsTheme, seededUnit, ThemeContext, toneColor, useTheme } from "./theme";
export type { Theme, Tone } from "./theme";
export { MONO } from "./fonts";
export { ENTRANCE_SPRING, entranceFade, entranceSpring } from "./motion";
export type { SpringConfig } from "./motion";

export { Canvas } from "./components/Canvas";
export type { CanvasProps } from "./components/Canvas";

export { Pill } from "./components/Pill";
export type { PillProps } from "./components/Pill";

export { PillBlock } from "./components/PillBlock";
export type { PillBlockProps } from "./components/PillBlock";

export { Card } from "./components/Card";
export type { CardProps } from "./components/Card";

export { BrowserChrome } from "./components/BrowserChrome";
export type { BrowserChromeProps } from "./components/BrowserChrome";

export { Connector, connectorPath, ConnectorPath } from "./components/Connector";
export type { ConnectorGeometry, Point } from "./components/Connector";

export { TreeDiagram } from "./components/TreeDiagram";
export type { TreeDiagramProps, TreeLevelSize } from "./components/TreeDiagram";

export { Terminal } from "./components/Terminal";
export type { TerminalProps } from "./components/Terminal";

export { ChecklistGates } from "./components/ChecklistGates";
export type { ChecklistGatesProps, GateRow } from "./components/ChecklistGates";

export { ParallelBars } from "./components/ParallelBars";
export type { ParallelBarsProps } from "./components/ParallelBars";

export { ScreenRec } from "./components/ScreenRec";
export type { Focal, ScreenRecProps } from "./components/ScreenRec";

export { Callout } from "./components/Callout";
export type { CalloutProps } from "./components/Callout";
