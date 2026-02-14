"use client"

import {
  PrivacyToggle,
  type PrivacyLevel,
} from "@/components/payments/privacy-toggle"

interface BridgePrivacyToggleProps {
  value: PrivacyLevel
  onChange: (value: PrivacyLevel) => void
  disabled?: boolean
}

export function BridgePrivacyToggle({
  value,
  onChange,
  disabled,
}: BridgePrivacyToggleProps) {
  return (
    <div>
      <PrivacyToggle value={value} onChange={onChange} disabled={disabled} />
      <p className="mt-2 text-xs text-[var(--text-tertiary)]">
        {value === "shielded" &&
          "Destination address is a stealth address \u2014 the bridge relayer cannot link sender to receiver."}
        {value === "compliant" &&
          "Privacy with viewing key \u2014 auditors can verify the bridge transfer while the address stays private."}
        {value === "transparent" &&
          "Standard bridge transfer \u2014 no privacy applied, destination visible on-chain."}
      </p>
    </div>
  )
}

export type { PrivacyLevel }
