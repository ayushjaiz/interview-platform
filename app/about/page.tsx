// app/transcribe/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import WebSocket from 'isomorphic-ws';

import {
  SOCKET_STATES,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";


interface DeepgramResponse {
  channel: {
    alternatives: {
      transcript: string;
    }[];
  };
}

interface WebSocketError extends Event {
  message: string;
}

const TranscribePage = () => {
  const [transcription, setTranscription] = useState<string[]>([]);

  useEffect(() => {
    const API_KEY = '3cefd113a02dfc49d06fa1ec62b0915a831b0478';

    const socket = new WebSocket('wss://api.deepgram.com/v1/listen', [
      'token',
      API_KEY,
    ])

    const startAudioStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
          },
        });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };

        mediaRecorder.start(250); // Send chunks of audio every 250ms
      } catch (error) {
        console.error('Error accessing the microphone', error);
      }
    };

    socket.onopen = () => {
      console.log('WebSocket connection established');
      startAudioStream();
    };

    const generateAudioResponse = () => {
      fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caption: transcription
        })
      }).then((res) => res.json()).then((data) => {
        console.log(data);
      }).catch((err) => {
        console.log(err);
      });
    }

    socket.onmessage = (message: MessageEvent) => {
      try {
        const response: DeepgramResponse = JSON.parse(message.data);
        if (response.channel && response.channel.alternatives[0]) {
          const transcript = response.channel.alternatives[0].transcript;
          if (transcript !== "") {
            console.log(transcript);
            setTranscription((prev) => [...prev, transcript]);

            generateAudioResponse();
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error: WebSocketError) => {
      console.error('WebSocket Error:', error.message);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <h2>Live Transcription</h2>
      <ul>
        {transcription.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
    </div>
  );
};

export default TranscribePage;
