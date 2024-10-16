
# Project Name

## Overview

This project is a real-time voice communication application built with Next.js. It integrates **Deepgram** for speech-to-text (STT) conversion and **Gemini LLM** for natural language processing (NLP). The application facilitates interactive conversations by converting user speech to text, generating responses via Gemini LLM, and converting the text back into speech for a seamless, voice-driven interface.

Project Video: https://youtu.be/NM5Y3exMh4U


## Features

- **Real-time Voice Input**: Users can speak directly into the app, and their voice is converted to text via Deepgram's speech-to-text service.
- **Natural Language Processing**: The transcribed text is processed by Gemini LLM, which generates meaningful, context-aware responses.
- **Voice Response**: The response from Gemini LLM is sent back to Deepgram, which converts the text to speech and plays it back to the user in real-time.
- **WebSocket Communication**: All interactions between the client, Deepgram, and Gemini LLM are handled via WebSocket for low-latency, bi-directional communication.

## Tech Stack

- **Next.js**: React-based framework for building the client-side UI and server-side functionality.
- **Deepgram**: Speech-to-text API for converting voice to text and text back to voice.
- **Gemini LLM**: Large language model for generating contextually appropriate responses from user input.
- **WebSocket**: Enables real-time, full-duplex communication between the client and backend services.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-project.git
   cd your-project
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file at the root of your project and add your Deepgram and Gemini LLM API keys:

   ```env
   DEEPGRAM_API_KEY=your-deepgram-api-key
   NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Your application will run on [http://localhost:3000](http://localhost:3000).

## Usage

1. Open the application in your browser.
2. Click on the microphone button to start speaking.
3. The application will send your voice to Deepgram for transcription.
4. The transcribed text will be processed by the Gemini LLM.
5. The generated response will be converted back to voice and played for you.
