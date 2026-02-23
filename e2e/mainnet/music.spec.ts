import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Music",
  route: "/music/playlist",
  completedText: /Create Another Playlist/i,
  interact: async (page) => {
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Create Playlist
    const submitBtn = page.getByRole("button", { name: /Create Playlist/i })
    await submitBtn.click()
  },
})
