import { useState, useEffect, useCallback } from 'react'

type MediaRecorderState = 'inactive' | 'recording' | 'paused'

export function useMediaRecorder() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordingState, setRecordingState] = useState<MediaRecorderState>('inactive')
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])

  const startRecording = useCallback(() => {
    if (mediaRecorder && recordingState !== 'recording') {
      try {
        mediaRecorder.start()
        setRecordingState('recording')
      } catch (error) {
        console.error('Error starting recording:', error)
      }
    }
  }, [mediaRecorder, recordingState])

  const stopRecording = useCallback(() => {
    if (mediaRecorder && recordingState === 'recording') {
      mediaRecorder.stop()
      setRecordingState('inactive')
    }
  }, [mediaRecorder, recordingState])

  useEffect(() => {
    let mounted = true

    const initMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const newMediaRecorder = new MediaRecorder(stream)

        newMediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks((chunks) => [...chunks, event.data])
          }
        }

        newMediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
          const audioUrl = URL.createObjectURL(audioBlob)
          // You can use audioUrl to play the recorded audio or send it to a server
          console.log('Recording stopped, audio URL:', audioUrl)
          setAudioChunks([])
        }

        if (mounted) {
          setMediaRecorder(newMediaRecorder)
        }
      } catch (error) {
        console.error('Error initializing MediaRecorder:', error)
      }
    }

    initMediaRecorder()

    return () => {
      mounted = false
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return { startRecording, stopRecording, recordingState }
}