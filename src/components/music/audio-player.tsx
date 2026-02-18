"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

const AUDIUS_BASE = "https://discoveryprovider.audius.co/v1"
const APP_NAME = "SIP"

interface AudioPlayerProps {
  trackId: string
  title: string
  className?: string
}

export function AudioPlayer({ trackId, title, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)
  const animRef = useRef<number>(0)

  // Only show for real Audius IDs (not sample- prefixed)
  const isRealTrack = !trackId.startsWith("track-")
  const streamUrl = `${AUDIUS_BASE}/tracks/${trackId}/stream?app_name=${APP_NAME}`

  const updateProgress = useCallback(function tick() {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime)
      setDuration(audioRef.current.duration || 0)
      if (!audioRef.current.paused) {
        animRef.current = requestAnimationFrame(tick)
      }
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      cancelAnimationFrame(animRef.current)
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
        animRef.current = requestAnimationFrame(updateProgress)
      }).catch(() => {
        setError(true)
      })
    }
  }, [isPlaying, updateProgress])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return "0:00"
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0

  if (!isRealTrack) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-[var(--text-tertiary)]", className)}>
        <span className="w-7 h-7 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400/50">
          {"\u{25B6}"}
        </span>
        <span>Preview in live mode</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-[var(--text-tertiary)]", className)}>
        <span className="w-7 h-7 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400/50">
          {"\u{25B6}"}
        </span>
        <span>Preview unavailable</span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* biome-ignore lint/a11y/useMediaCaption: preview player */}
      <audio
        ref={audioRef}
        src={streamUrl}
        preload="none"
        onEnded={() => { setIsPlaying(false); setProgress(0) }}
        onError={() => setError(true)}
      />

      <button
        type="button"
        onClick={togglePlay}
        className="flex-shrink-0 w-7 h-7 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 hover:bg-pink-500/30 transition-colors"
        aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
      >
        <span className="text-xs">{isPlaying ? "\u{23F8}" : "\u{25B6}"}</span>
      </button>

      <div className="flex-1 min-w-0">
        <div className="h-1 rounded-full bg-pink-500/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-100"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums flex-shrink-0">
        {formatTime(progress)}{duration > 0 ? ` / ${formatTime(duration)}` : ""}
      </span>
    </div>
  )
}
