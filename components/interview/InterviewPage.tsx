"use client";

import { useEffect, useRef, useState } from "react";
import {
    SOCKET_STATES,
    LiveTranscriptionEvent,
    LiveTranscriptionEvents,
    useDeepgram,
} from "../../app/context/DeepgramContextProvider";
import {
    MicrophoneEvents,
    MicrophoneState,
    useMicrophone,
} from "../../app/context/MicrophoneContextProvider";

import { CaptionDisplay } from "./CaptionDisplay";
import { InterviewControls } from "./InterviewControls";

const App: () => JSX.Element = () => {
    const { connection, disconnectFromDeepgram, connectToDeepgram, connectionState } = useDeepgram();
    const { setupMicrophone, stopMicrophone, microphone, startMicrophone, microphoneState } =
        useMicrophone();

    const captionTimeout = useRef<any>();
    const keepAliveInterval = useRef<any>();

    const [responseAudioUrl, setResponseAudioUrl] = useState<string | undefined>();

    const [interviewState, setInterviewState] = useState<boolean>(false);
    // const [pausedState, setPausedState] = useState<boolean>(false);


    const [caption, setCaption] = useState<string | undefined>(
        "Welcome to the interview. Click the button to start the interview..."
    );

    const startInterview = () => {
        console.log('interview started');
        setCaption("Interview started. Speak now...");
        setInterviewState(true);
    }

    const endInterview = () => {
        console.log('interview ended');
        setInterviewState(false);
        setCaption("Interview ended...");
        // disconnectFromDeepgram();
        setResponseAudioUrl('');
    }


    useEffect(() => {
        if (interviewState) {
            setupMicrophone();
            startMicrophone();
        }
        else {
            stopMicrophone();
            disconnectFromDeepgram();
        }
    }, [interviewState]);

    // when microphone is ready
    useEffect(() => {
        if (microphoneState === MicrophoneState.Ready) {
            connectToDeepgram({
                model: "nova-2-conversationalai",
                interim_results: true,
                smart_format: true,
                filler_words: true,
                utterance_end_ms: 3000,
                endpointing: 300
            });
        }
    }, [microphoneState]);


    // when microphone and connection, interview is ready
    useEffect(() => {
        if (!microphone) return;
        if (!connection) return;
        console.log('interview state', interviewState);


        console.log('i am listening now');

        const onData = (e: BlobEvent) => {
            // iOS SAFARI FIX:
            // Prevent packetZero from being sent. If sent at size 0, the connection will close. 
            if (e.data.size > 0) {
                connection?.send(e.data);
            }
        };

        const onTranscript = (data: LiveTranscriptionEvent) => {

            const { is_final: isFinal, speech_final: speechFinal } = data;

            let thisCaption = data.channel.alternatives[0].transcript;

            if (thisCaption !== "") {
                console.log(thisCaption);
                setCaption(thisCaption);
            }

            if (isFinal && speechFinal && thisCaption !== "") {
                console.log('data sent to api', data);
                fetch('/api/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        caption: thisCaption
                    })
                }).then((res) => {
                    return res.blob()
                })
                    .then((data) => {
                        setResponseAudioUrl(URL.createObjectURL(data));
                    }).catch((err) => {
                        console.log(err);
                    });

                clearTimeout(captionTimeout.current);
                captionTimeout.current = setTimeout(() => {
                    setCaption(undefined);
                    clearTimeout(captionTimeout.current);
                }, 3000);
            }
        };

        if (connectionState === SOCKET_STATES.open) {
            connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
            microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

            startMicrophone();
        }

        return () => {
            connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
            microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
            clearTimeout(captionTimeout.current);
        };
    }, [connectionState]);


    // micro phone state and current state
    useEffect(() => {
        //if (!interviewState) return;
        if (!connection) return;

        if (
            microphoneState !== MicrophoneState.Open &&
            connectionState === SOCKET_STATES.open
        ) {
            connection.keepAlive();

            keepAliveInterval.current = setInterval(() => {
                connection.keepAlive();
            }, 10000);
        } else {
            clearInterval(keepAliveInterval.current);
        }

        return () => {
            clearInterval(keepAliveInterval.current);
        };
    }, [microphoneState, connectionState]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">

            <InterviewControls interviewState={interviewState} startInterview={startInterview} endInterview={endInterview} />

            <CaptionDisplay caption={caption} />

            <audio
                src={responseAudioUrl}
                autoPlay
                className="hidden"
            />
        </main>
    );


};

export default App;
