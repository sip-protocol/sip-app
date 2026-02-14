import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ArtCanvas } from "@/components/art/art-canvas"

describe("ArtCanvas", () => {
  it("renders SVG content when svgData is provided", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>'
    const { container } = render(<ArtCanvas svgData={svg} />)
    expect(container.querySelector("svg")).toBeInTheDocument()
    expect(container.querySelector("circle")).toBeInTheDocument()
  })

  it("shows empty state when svgData is empty", () => {
    render(<ArtCanvas svgData="" />)
    expect(screen.getByText("No art generated")).toBeInTheDocument()
  })

  it("applies sm size class", () => {
    const { container } = render(<ArtCanvas svgData="" size="sm" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain("w-24")
    expect(el.className).toContain("h-24")
  })

  it("applies md size class by default", () => {
    const { container } = render(<ArtCanvas svgData="" size="md" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain("w-48")
    expect(el.className).toContain("h-48")
  })

  it("applies lg size class", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>'
    const { container } = render(<ArtCanvas svgData={svg} size="lg" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain("w-full")
  })

  it("passes custom className", () => {
    const { container } = render(<ArtCanvas svgData="" className="test-class" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain("test-class")
  })
})
