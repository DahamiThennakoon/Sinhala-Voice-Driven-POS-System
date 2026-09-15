import { useEffect, useRef, useState } from "react"
import {
  Mic,
  Square,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react"
import { useToast } from "../common/Toast"

const BASE =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000"

export default function VoiceButton({ onAddToCart }) {
  const [state, setState] = useState("idle")
  const [seconds, setSeconds] = useState(0)
  const [result, setResult] = useState(null)

  const timerRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const { push } = useToast()

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  // Start recording

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        push(
          "ඔබේ browser එක microphone සඳහා සහය නොදක්වයි.",
          "error"
        )
        return
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        })

      audioChunksRef.current = []

      const mediaRecorder =
        new MediaRecorder(stream)

      mediaRecorderRef.current =
        mediaRecorder

      mediaRecorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          )
        }
      }

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(
            audioChunksRef.current,
            {
              type: "audio/webm",
            }
          )

          if (audioBlob.size === 0) {
            throw new Error(
              "Audio recording is empty"
            )
          }

          const formData = new FormData()

          formData.append(
            "audio",
            audioBlob,
            "voice.webm"
          )

          setState("processing")

          console.log(
            "Sending audio to:",
            `${BASE}/api/voice`
          )

          const response = await fetch(
            `${BASE}/api/voice`,
            {
              method: "POST",
              body: formData,
            }
          )

          if (!response.ok) {
            throw new Error(
              `Server error: ${response.status}`
            )
          }

          const data =
            await response.json()

          console.log(
            "VOICE API RESPONSE:",
            data
          )

          // Backend error
          if (data.error) {
            throw new Error(
              data.message ||
              data.error
            )
          }

          // Make sure items is an array
          if (!Array.isArray(data.items)) {
            data.items = []
          }

          console.log(
            "Detected voice items:",
            data.items
          )

          setResult(data)
          setState("result")

        } catch (error) {
          console.error(
            "Voice processing error:",
            error
          )

          push(
            "Voice input process කිරීමට නොහැකි විය.",
            "error"
          )

          setState("error")
        } finally {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            )
        }
      }

      mediaRecorder.start()

      setState("recording")
      setSeconds(0)

      timerRef.current =
        setInterval(() => {
          setSeconds(
            (current) => current + 1
          )
        }, 1000)

    } catch (error) {
      console.error(
        "Microphone error:",
        error
      )

      push(
        "Microphone එක භාවිතා කිරීමට අවසර නැත.",
        "error"
      )
    }
  }

  // Stop recording

  const stopRecording = () => {
    clearInterval(timerRef.current)

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
        "inactive"
    ) {
      mediaRecorderRef.current.stop()
    }
  }

  // Reset

  const reset = () => {
    setState("idle")
    setResult(null)
    setSeconds(0)
  }

  // Confirm

  const confirm = () => {
    console.log(
      "CONFIRM VOICE RESULT:",
      result
    )

    if (!result) {
      push(
        "Voice result එකක් නැහැ.",
        "error"
      )
      return
    }

    if (
      !Array.isArray(result.items) ||
      result.items.length === 0
    ) {
      push(
        "Cart එකට එකතු කිරීමට products නැහැ.",
        "error"
      )
      return
    }

    // Send COMPLETE result to POS.jsx
    onAddToCart?.(result)

    reset()
  }

  // Timer

  const fmt = (s) => {
    const minutes = String(
      Math.floor(s / 60)
    ).padStart(2, "0")

    const secondsValue = String(
      s % 60
    ).padStart(2, "0")

    return `${minutes}:${secondsValue}`
  }

  // UI
  
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 flex flex-col items-center text-center">

      {/* IDLE */}
      {state === "idle" && (
        <>
          <button
            onClick={startRecording}
            className="h-24 w-24 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-600/30 transition-transform active:scale-95 focus-ring"
          >
            <Mic className="h-10 w-10" />
          </button>

          <p className="font-sinhala font-semibold text-gray-800 mt-4 text-lg">
            සිංහලෙන් කතා කරන්න
          </p>

        </>
      )}

      {/* RECORDING */}
      {state === "recording" && (
        <>
          <button
            onClick={stopRecording}
            className="h-24 w-24 rounded-full bg-danger-600 text-white flex items-center justify-center animate-pulse-ring focus-ring"
          >
            <Square className="h-8 w-8 fill-current" />
          </button>

          <p className="font-sinhala font-semibold text-danger-600 mt-4 text-lg">
            කතා කරමින්...
          </p>

          <p className="text-2xl font-mono font-bold text-gray-800 mt-1 tabular-nums">
            {fmt(seconds)}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            බඩු ලැයිස්තුව සම්පූර්ණයෙන් කියලා අවසන් වූ පසු Stop කරන්න
          </p>
        </>
      )}

      {/* PROCESSING */}
      {state === "processing" && (
        <>
          <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
            <Loader2 className="h-9 w-9 text-primary-600 animate-spin" />
          </div>

          <p className="font-sinhala font-semibold text-gray-700 mt-4 text-lg">
            හඳුනාගනිමින්...
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Sinhala voice processing...
          </p>
        </>
      )}

      {/* RESULT */}
      {state === "result" &&
        result && (
          <div className="w-full text-left">

            <div className="flex items-center gap-2 mb-3 justify-center">
              <CheckCircle2 className="h-5 w-5 text-success-600" />

              <h4 className="font-semibold text-gray-900">
                Voice Result
              </h4>
            </div>

            {/* Transcript */}
            <div className="bg-gray-50 rounded-xl p-3.5 mb-3">
              <p className="text-xs text-gray-400 font-sinhala mb-1">
                ඔබ පැවසුවේ:
              </p>

              <p className="font-sinhala text-gray-800 font-medium">
                "{result.transcript || ""}"
              </p>
            </div>

            {/* Detected items */}
            <div className="bg-primary-50 rounded-xl p-3.5 mb-4 space-y-2">

              <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-1.5">
                Detected Items (
                {result.items?.length || 0}
                )
              </p>

              {result.items?.map(
                (it, idx) => (
                  <div
                    key={`${it.item}-${idx}`}
                    className="flex justify-between text-sm pb-1.5 border-b border-primary-100 last:border-0 last:pb-0"
                  >
                    <span className="text-gray-700 font-medium">
                      {it.item} ×{" "}
                      {it.quantity}{" "}
                      {it.unit || ""}
                    </span>

                    <span className="font-semibold text-gray-900">
                      Rs.{" "}
                      {Number(
                        it.total || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                )
              )}

              {/* Total */}
              <div className="flex justify-between text-sm pt-1.5 border-t border-primary-200">
                <span className="text-gray-600 font-medium">
                  Total
                </span>

                <span className="font-bold text-primary-700">
                  Rs.{" "}
                  {Number(
                    result.total || 0
                  ).toLocaleString()}
                </span>
              </div>

            </div>

            {/* Confirmation */}
            <p className="font-sinhala text-sm text-gray-600 text-center mb-3">
              මෙම බඩු cart එකට එකතු කරන්නද?
            </p>

            <div className="flex gap-2">

              <button
                onClick={reset}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 focus-ring"
              >
                අවලංගු කරන්න
              </button>

              <button
                onClick={confirm}
                disabled={
                  !result.items ||
                  result.items.length === 0
                }
                className="flex-1 py-3 rounded-xl bg-success-600 text-white font-medium text-sm hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
              >
                තහවුරු කරන්න
              </button>

            </div>

          </div>
        )}

      {/* ERROR */}
      {state === "error" && (
        <>
          <div className="h-24 w-24 rounded-full bg-danger-50 flex items-center justify-center">
            <XCircle className="h-9 w-9 text-danger-600" />
          </div>

          <p className="font-sinhala font-semibold text-danger-600 mt-4">
            Voice input හඳුනාගැනීමට නොහැකි විය.
          </p>

          <button
            onClick={reset}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-ring"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        </>
      )}

    </div>
  )
}