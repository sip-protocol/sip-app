import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ArtStatus } from "@/components/art/art-status"

describe("ArtStatus", () => {
  describe("generate mode", () => {
    it("renders all 3 generate step labels", () => {
      render(<ArtStatus currentStep="selecting_style" mode="generate" />)
      expect(screen.getByText("Select Art Style")).toBeInTheDocument()
      expect(screen.getByText("Generate Art")).toBeInTheDocument()
      expect(screen.getByText("Art Generated")).toBeInTheDocument()
    })

    it("shows active header for in-progress steps", () => {
      render(<ArtStatus currentStep="generating" mode="generate" />)
      expect(screen.getByText("Generating Privacy Art...")).toBeInTheDocument()
    })

    it("shows complete header when done", () => {
      render(<ArtStatus currentStep="generated" mode="generate" />)
      expect(screen.getByText("Art Generated!")).toBeInTheDocument()
    })

    it("shows failed header and error message", () => {
      render(
        <ArtStatus
          currentStep="failed"
          mode="generate"
          error="Stealth address generation failed"
        />,
      )
      expect(screen.getByText("Art Generation Failed")).toBeInTheDocument()
      expect(screen.getByText("Stealth address generation failed")).toBeInTheDocument()
    })
  })

  describe("mint mode", () => {
    it("renders all 3 mint step labels", () => {
      render(<ArtStatus currentStep="preparing_nft" mode="mint" />)
      expect(screen.getByText("Prepare NFT")).toBeInTheDocument()
      expect(screen.getByText("Mint NFT")).toBeInTheDocument()
      expect(screen.getByText("NFT Minted")).toBeInTheDocument()
    })

    it("shows active header for minting", () => {
      render(<ArtStatus currentStep="minting" mode="mint" />)
      expect(screen.getByText("Minting NFT...")).toBeInTheDocument()
    })

    it("shows complete header when minted", () => {
      render(<ArtStatus currentStep="minted" mode="mint" />)
      expect(screen.getByText("NFT Minted!")).toBeInTheDocument()
    })

    it("shows failed header for mint failure", () => {
      render(
        <ArtStatus
          currentStep="failed"
          mode="mint"
          error="Insufficient SOL for mint"
        />,
      )
      expect(screen.getByText("Minting Failed")).toBeInTheDocument()
      expect(screen.getByText("Insufficient SOL for mint")).toBeInTheDocument()
    })
  })

  it("applies custom className", () => {
    const { container } = render(
      <ArtStatus currentStep="selecting_style" mode="generate" className="custom-test" />,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain("custom-test")
  })
})
