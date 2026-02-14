import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SocialStatus } from "@/components/social/social-status"

describe("SocialStatus", () => {
  describe("profile mode", () => {
    it("renders all 3 profile step labels", () => {
      render(<SocialStatus currentStep="generating_stealth" mode="profile" />)
      expect(screen.getByText("Generate Stealth Identity")).toBeInTheDocument()
      expect(screen.getByText("Create Tapestry Profile")).toBeInTheDocument()
      expect(screen.getByText("Profile Created")).toBeInTheDocument()
    })

    it("shows active header for in-progress steps", () => {
      render(<SocialStatus currentStep="creating_profile" mode="profile" />)
      expect(screen.getByText("Creating Stealth Identity...")).toBeInTheDocument()
    })

    it("shows complete header when done", () => {
      render(<SocialStatus currentStep="profile_created" mode="profile" />)
      expect(screen.getByText("Identity Created!")).toBeInTheDocument()
    })

    it("shows failed header and error message", () => {
      render(
        <SocialStatus
          currentStep="failed"
          mode="profile"
          error="Key generation failed"
        />,
      )
      expect(screen.getByText("Identity Creation Failed")).toBeInTheDocument()
      expect(screen.getByText("Key generation failed")).toBeInTheDocument()
    })
  })

  describe("post mode", () => {
    it("renders all 3 post step labels", () => {
      render(<SocialStatus currentStep="encrypting_content" mode="post" />)
      expect(screen.getByText("Encrypt Content")).toBeInTheDocument()
      expect(screen.getByText("Publish to Feed")).toBeInTheDocument()
      expect(screen.getByText("Published")).toBeInTheDocument()
    })

    it("shows active header for publishing", () => {
      render(<SocialStatus currentStep="publishing" mode="post" />)
      expect(screen.getByText("Publishing Post...")).toBeInTheDocument()
    })

    it("shows complete header when published", () => {
      render(<SocialStatus currentStep="published" mode="post" />)
      expect(screen.getByText("Post Published!")).toBeInTheDocument()
    })
  })

  describe("follow mode", () => {
    it("renders all 3 follow step labels", () => {
      render(<SocialStatus currentStep="generating_stealth" mode="follow" />)
      expect(screen.getByText("Generate Shared Secret")).toBeInTheDocument()
      expect(screen.getByText("Create Connection")).toBeInTheDocument()
      expect(screen.getByText("Connected")).toBeInTheDocument()
    })

    it("shows active header for connecting", () => {
      render(<SocialStatus currentStep="connecting" mode="follow" />)
      expect(screen.getByText("Following Profile...")).toBeInTheDocument()
    })

    it("shows complete header when connected", () => {
      render(<SocialStatus currentStep="connected" mode="follow" />)
      expect(screen.getByText("Connected!")).toBeInTheDocument()
    })
  })
})
