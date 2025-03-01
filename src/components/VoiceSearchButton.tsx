import { useState, useCallback } from 'react'
import { HiMicrophone, HiOutlineMicrophone } from 'react-icons/hi'
import { cn } from '../lib/utils'
import { toast } from 'sonner'
import { playStartSound, playStopSound } from '../utils/audio'

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void
  className?: string
}

export const VoiceSearchButton = ({ onTranscript, className }: VoiceSearchButtonProps) => {
  const [isListening, setIsListening] = useState(false)

  const handleVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Voice search is not supported in your browser")
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      playStartSound()
      toast.info("Listening...", { id: "voice-search" })
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
      playStopSound()
      toast.success("Voice input received!")
    }

    recognition.onerror = () => {
      setIsListening(false)
      playStopSound()
      toast.error("Voice recognition failed")
    }

    recognition.onend = () => {
      setIsListening(false)
      toast.dismiss("voice-search")
    }

    recognition.start()
  }, [onTranscript])

  return (
    <button
      onClick={handleVoiceSearch}
      className={cn(
        "p-2 rounded-full transition-all hover:bg-muted/80",
        isListening && "bg-red-500/20 text-red-500 animate-pulse",
        className
      )}
      title="Search with voice"
    >
      {isListening ? (
        <HiMicrophone className="h-4 w-4" />
      ) : (
        <HiOutlineMicrophone className="h-4 w-4" />
      )}
    </button>
  )
} 