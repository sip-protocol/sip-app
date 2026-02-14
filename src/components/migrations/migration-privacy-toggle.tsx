"use client"

import {
  PrivacyToggle,
  type PrivacyLevel,
} from "@/components/payments/privacy-toggle"

interface MigrationPrivacyToggleProps {
  value: PrivacyLevel
  onChange: (value: PrivacyLevel) => void
  disabled?: boolean
}

export function MigrationPrivacyToggle({
  value,
  onChange,
  disabled,
}: MigrationPrivacyToggleProps) {
  return (
    <div>
      <PrivacyToggle value={value} onChange={onChange} disabled={disabled} />
      <p className="mt-2 text-xs text-[var(--text-tertiary)]">
        {value === "shielded" &&
          "Migration uses a stealth address \u2014 your Sunrise deposit cannot be linked to your source wallet."}
        {value === "compliant" &&
          "Privacy with viewing key \u2014 auditors can verify the green migration while your identity stays private."}
        {value === "transparent" &&
          "Standard migration \u2014 no privacy applied, source and destination visible on-chain."}
      </p>
    </div>
  )
}

export type { PrivacyLevel }
