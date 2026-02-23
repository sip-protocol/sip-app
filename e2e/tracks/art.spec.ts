import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Art",
  route: "/art/create",
  submitButton: /Generate Art/i,
  completedText: /Generate Another/i,
  fillFields: async (page) => {
    // Must select an art style before the submit button enables
    const styleButton = page.getByText("Cipher Bloom").first()
    await styleButton.click()
  },
})
