'use client'

import { useEffect, useRef, useState } from "react"
import {
    SOCKET_STATES,
    LiveTranscriptionEvent,
    LiveTranscriptionEvents,
    useDeepgram,
} from "../app/context/DeepgramContextProvider"
import {
    MicrophoneEvents,
    MicrophoneState,
    useMicrophone,
} from "../app/context/MicrophoneContextProvider"

interface UseInterviewLogicProps {
    setInterviewState: (state: boolean) => void
    setPausedState: (state: boolean) => void
    setCaption: (caption: string | undefined) => void
}

export function useInterviewLogic({
    setInterviewState,
    setPausedState,
    setCaption,
}: UseInterviewLogicProps) {
    const { connection, disconnectFromDeepgram, connectToDeepgram, connectionState } = useDeepgram()
    const { setupMicrophone, stopMicrophone, microphone, startMicrophone, microphoneState } =
        useMicrophone()

    const captionTimeout = useRef<any>()
    const keepAliveInterval = useRef<any>()

    const [responseAudioUrl, setResponseAudioUrl] = useState<string | undefined>()

    const startInterview = () => {
        console.log('interview started')
        setCaption("Interview started. Speak now...")
        setInterviewState(true)
    }

    const resumeInterview = () => {
        console.log('interview resumed')
        setCaption("Interview resumed. Speak now...")
        setPausedState(false)
    }

    const endInterview = () => {
        console.log('interview ended')
        setInterviewState(false)
        setPausedState(false)
        setCaption("Interview ended...")
        disconnectFromDeepgram()
        setResponseAudioUrl('')
    }

    const pauseInterview = () => {
        console.log('interview paused')
        setPausedState(true)
        setCaption("Interview paused. Resume when ready...")
        setResponseAudioUrl('')
    }

    useEffect(() => {
        if (microphoneState === MicrophoneState.Ready) {
            connectToDeepgram({
                model: "nova-2-conversationalai",
                interim_results: true,
                smart_format: true,
                filler_words: true,
                utterance_end_ms: 3000,
                endpointing: 300
            })
        }
    }, [microphoneState])

    useEffect(() => {
        if (!microphone || !connection) return

        const onData = (e: BlobEvent) => {
            if (e.data.size > 0) {
                connection?.send(e.data)
            }
        }

        const onTranscript = (data: LiveTranscriptionEvent) => {
            const { is_final: isFinal, speech_final: speechFinal } = data
            let thisCaption = data.channel.alternatives[0].transcript

            if (thisCaption !== "") {
                console.log(thisCaption)
                setCaption(thisCaption)
            }

            if (isFinal && speechFinal && thisCaption !== "") {
                fetch('/api/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        caption: thisCaption
                    })
                })
                    .then((res) => res.blob())
                    .then((data) => {
                        setResponseAudioUrl(URL.createObjectURL(data))
                    })
                    .catch((err) => {
                        console.log(err)
                    })

                clearTimeout(captionTimeout.current)
                captionTimeout.current = setTimeout(() => {
                    setCaption(undefined)
                    clearTimeout(captionTimeout.current)
                }, 3000)
            }
        }

        if (connectionState === SOCKET_STATES.open) {
            connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript)
            microphone.addEventListener(MicrophoneEvents.DataAvailable, onData)
            startMicrophone()
        }

        return () => {
            connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript)
            microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData)
            clearTimeout(captionTimeout.current)
        }
    }, [connectionState, microphone, connection])

    useEffect(() => {
        if (!connection) return

        if (microphoneState !== MicrophoneState.Open && connectionState === SOCKET_STATES.open) {
            connection.keepAlive()
            keepAliveInterval.current = setInterval(() => {
                connection.keepAlive()
            }, 10000)
        } else {
            clearInterval(keepAliveInterval.current)
        }

        return () => {
            clearInterval(keepAliveInterval.current)
        }
    }, [microphoneState, connectionState, connection])

    return {
        startInterview,
        resumeInterview,
        endInterview,
        pauseInterview,
        responseAudioUrl,
    }
}