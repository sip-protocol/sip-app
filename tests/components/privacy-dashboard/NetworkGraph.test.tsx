import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  NetworkGraph,
  generateNetworkFromCluster,
  type GraphNode,
  type GraphEdge,
} from "@/components/privacy-dashboard/NetworkGraph"

// Mock data for testing
const mockNodes: GraphNode[] = [
  { id: "self-wallet", type: "self", label: "Your Wallet", risk: 0, transactionCount: 10 },
  { id: "exchange-1", type: "exchange", label: "Binance", risk: 80, transactionCount: 5 },
  { id: "known-1", type: "known", label: "Alice", risk: 20, transactionCount: 3 },
  { id: "unknown-1", type: "unknown", risk: 50, transactionCount: 2 },
]

const mockEdges: GraphEdge[] = [
  { source: "self-wallet", target: "exchange-1", weight: 5, type: "send" },
  { source: "self-wallet", target: "known-1", weight: 3, type: "receive" },
  { source: "known-1", target: "unknown-1", weight: 1, type: "send" },
]

describe("NetworkGraph", () => {
  describe("Component rendering", () => {
    it("renders SVG element with correct dimensions", () => {
      const { container } = render(
        <NetworkGraph nodes={mockNodes} edges={mockEdges} width={800} height={600} />
      )

      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute("width", "800")
      expect(svg).toHaveAttribute("height", "600")
    })

    it("renders with default dimensions when not specified", () => {
      const { container } = render(
        <NetworkGraph nodes={mockNodes} edges={mockEdges} />
      )

      const svg = container.querySelector("svg")
      expect(svg).toHaveAttribute("width", "600")
      expect(svg).toHaveAttribute("height", "400")
    })

    it("renders legend with all node types", () => {
      render(<NetworkGraph nodes={mockNodes} edges={mockEdges} />)

      // "You" appears twice: in SVG node label and in legend
      const youElements = screen.getAllByText("You")
      expect(youElements.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText("exchange")).toBeInTheDocument()
      expect(screen.getByText("known")).toBeInTheDocument()
      expect(screen.getByText("unknown")).toBeInTheDocument()
    })

    it("renders instructions text", () => {
      render(<NetworkGraph nodes={mockNodes} edges={mockEdges} />)

      expect(
        screen.getByText(/Drag nodes to explore.*Scroll to zoom/)
      ).toBeInTheDocument()
    })

    it("does not crash with empty nodes", () => {
      const { container } = render(<NetworkGraph nodes={[]} edges={[]} />)

      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })
  })

  describe("Interaction callbacks", () => {
    it("accepts onNodeClick callback", () => {
      const onNodeClick = () => {}

      // Component should render without error when callback provided
      const { container } = render(
        <NetworkGraph
          nodes={mockNodes}
          edges={mockEdges}
          onNodeClick={onNodeClick}
        />
      )

      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })
  })
})

describe("generateNetworkFromCluster", () => {
  const walletAddress = "0x1234567890abcdef"

  it("creates self node with correct properties", () => {
    const result = generateNetworkFromCluster(walletAddress)

    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0]).toEqual({
      id: walletAddress,
      type: "self",
      label: "Your Wallet",
      risk: 0,
      transactionCount: 0,
    })
  })

  it("adds exchange nodes from exchange data", () => {
    const exchangeData = {
      exchanges: [
        { address: "0xexchange1", name: "Binance", transactionCount: 5 },
        { address: "0xexchange2", name: "Coinbase", transactionCount: 3 },
      ],
    }

    const result = generateNetworkFromCluster(walletAddress, undefined, exchangeData)

    // Self + 2 exchanges
    expect(result.nodes).toHaveLength(3)

    const binanceNode = result.nodes.find((n) => n.label === "Binance")
    expect(binanceNode).toBeDefined()
    expect(binanceNode?.type).toBe("exchange")
    expect(binanceNode?.risk).toBe(80)
    expect(binanceNode?.transactionCount).toBe(5)

    // Should have edges from wallet to exchanges
    expect(result.edges).toHaveLength(2)
    expect(result.edges[0].source).toBe(walletAddress)
    expect(result.edges[0].type).toBe("send")
  })

  it("adds cluster nodes from cluster data", () => {
    const clusterData = {
      linkedAddressCount: 2,
      clusters: [
        {
          addresses: ["0xcluster1", "0xcluster2"],
          linkType: "common-input" as const,
          transactionCount: 4,
        },
      ],
    }

    const result = generateNetworkFromCluster(walletAddress, clusterData)

    // Self + 2 cluster addresses
    expect(result.nodes).toHaveLength(3)

    const clusterNode = result.nodes.find((n) => n.id === "0xcluster1")
    expect(clusterNode).toBeDefined()
    expect(clusterNode?.type).toBe("unknown")
    expect(clusterNode?.risk).toBe(50)
  })

  it("handles consolidation link type as receive", () => {
    const clusterData = {
      linkedAddressCount: 1,
      clusters: [
        {
          addresses: ["0xconsolidated"],
          linkType: "consolidation" as const,
          transactionCount: 2,
        },
      ],
    }

    const result = generateNetworkFromCluster(walletAddress, clusterData)

    const edge = result.edges.find((e) => e.target === "0xconsolidated")
    expect(edge?.type).toBe("receive")
  })

  it("does not duplicate addresses", () => {
    const clusterData = {
      linkedAddressCount: 1,
      clusters: [
        {
          addresses: ["0xdupe", "0xdupe"],
          linkType: "common-input" as const,
          transactionCount: 1,
        },
      ],
    }

    const result = generateNetworkFromCluster(walletAddress, clusterData)

    const dupeNodes = result.nodes.filter((n) => n.id === "0xdupe")
    expect(dupeNodes).toHaveLength(1)
  })

  it("skips wallet address in cluster addresses", () => {
    const clusterData = {
      linkedAddressCount: 1,
      clusters: [
        {
          addresses: [walletAddress, "0xother"],
          linkType: "common-input" as const,
          transactionCount: 1,
        },
      ],
    }

    const result = generateNetworkFromCluster(walletAddress, clusterData)

    // Self + 1 other (wallet skipped)
    expect(result.nodes).toHaveLength(2)
    const selfNodes = result.nodes.filter((n) => n.id === walletAddress)
    expect(selfNodes).toHaveLength(1)
  })

  it("handles combined exchange and cluster data", () => {
    const clusterData = {
      linkedAddressCount: 1,
      clusters: [
        {
          addresses: ["0xcluster"],
          linkType: "change-address" as const,
          transactionCount: 1,
        },
      ],
    }

    const exchangeData = {
      exchanges: [{ address: "0xexchange", name: "Kraken", transactionCount: 2 }],
    }

    const result = generateNetworkFromCluster(walletAddress, clusterData, exchangeData)

    // Self + 1 cluster + 1 exchange
    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(2)
  })
})
