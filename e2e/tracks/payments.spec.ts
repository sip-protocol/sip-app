import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Payments",
  route: "/payments/send",
  submitButton: /Send Shielded Payment/i,
  completedText: /Send Another Payment/i,
  fillFields: async (page) => {
    const recipientInput = page.getByPlaceholder(/address|recipient|wallet/i).first()
    if (await recipientInput.isVisible().catch(() => false)) {
      await recipientInput.fill("S1P9WhBSbAGGatvrVE4TRBZfWpbG96U26zksy2TQj8q")
    }
    const amountInput = page.getByPlaceholder(/amount/i).first()
    if (await amountInput.isVisible().catch(() => false)) {
      await amountInput.fill("0.001")
    }
  },
})
