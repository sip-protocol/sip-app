// Privacy Dashboard D3.js Visualizations
// Issue #488: Interactive visualizations for wallet surveillance data

// Components
export { NetworkGraph, generateNetworkFromCluster } from "./NetworkGraph"
export type { GraphNode, GraphEdge } from "./NetworkGraph"

export { RiskHeatmap, transformBreakdownToHeatmap } from "./RiskHeatmap"

export { PrivacyTimeline, generateMockTimeline } from "./PrivacyTimeline"
export type { TimelinePoint } from "./PrivacyTimeline"

export { ProtectionComparison } from "./ProtectionComparison"

// Hooks
export { useD3 } from "./hooks/useD3"

// Utils
export {
  riskColors,
  nodeColors,
  categoryColors,
  createScoreColorScale,
  createHeatmapColorScale,
  getRiskColor,
  getScoreColor,
  createGradientDefs,
} from "./utils/colorScales"
