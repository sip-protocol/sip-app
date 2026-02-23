import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Payments",
  route: "/payments/send",
  completedText: /Send Another Payment|Payment Sent|Transaction Confirmed/i,
  interact: async (page) => {
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Fill amount
    const amountInput = page.locator("#amount")
    await amountInput.fill("0.01")

    // Fill recipient with valid SIP stealth address
    const recipientInput = page.locator("#recipient")
    await recipientInput.fill(
      "sip:solana:7x3Fh9wKpEufGCBhEkGL3tqEFBTpRNMFEP2CqAbH7mxm:2Bp4kL1CEMnP4Fd8KXk3H5bWmZFnfHvTTjw8Z9kT6yGP"
    )

    // Send Shielded Payment
    const submitBtn = page.getByRole("button", { name: /Send Shielded Payment/i })
    await submitBtn.click()
  },
})
