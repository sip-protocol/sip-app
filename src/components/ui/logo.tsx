import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  href?: string
  className?: string
}

const sizes = {
  sm: 28,
  md: 36,
  lg: 48,
}

export function Logo({
  size = "md",
  showText = true,
  href = "/",
  className = "",
}: LogoProps) {
  const content = (
    <div className={`flex items-center gap-2 group ${className}`}>
      <Image
        src="/logo-64.png"
        alt="SIP Protocol"
        width={sizes[size]}
        height={sizes[size]}
        className="rounded-lg transition-transform group-hover:scale-105"
        priority
      />
      {showText && (
        <span className="text-lg font-bold text-white">SIP Protocol</span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg"
      >
        {content}
      </Link>
    )
  }

  return content
}
