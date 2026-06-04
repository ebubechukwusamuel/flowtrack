"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square } from "lucide-react"

interface Props {
  onRecordingComplete: (blob: Blob) => void
}

export function VoiceRecorder({ onRecordingComplete }: Props) {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorder.current = recorder
      chunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" })
        stream.getTracks().forEach((t) => t.stop())
        onRecordingComplete(blob)
        setDuration(0)
      }

      recorder.start()
      setRecording(true)

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= 30) {
            stopRecording()
            return d
          }
          return d + 1
        })
      }, 1000)
    } catch {
      // Microphone permission denied or unavailable
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop()
    }
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {recording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              {formatDuration(duration)}
            </span>
            <button
              onClick={stopRecording}
              className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="mic"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={startRecording}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1C1C1C] transition-colors"
            title="Voice note"
          >
            <Mic className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
