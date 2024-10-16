import { createClient } from "@deepgram/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!);
const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

async function generateResponse(userResponse: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are conducting a technical interview on machine learning. 
        The interviewee just said: "${userResponse}".
         Provide a follow-up question or comment based on their response. 
         Keep your response concise and focused on machine learning concepts, 
         such as algorithms, model evaluation, or data preprocessing.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating response:', error);
        throw new Error('Failed to generate response');
    }
}

export const POST = async (request: Request) => {
    const body = (await request.json()) as { caption: string };

    const text = await generateResponse(body.caption);

    const response = await deepgram.speak.request({ text }, {
        model: "aura-asteria-en",
        container: "ogg",
        encoding: "opus",

    });

    const [stream, headers] = await Promise.all([
        response.getStream(),
        response.getHeaders(),
    ]);
    return new Response(stream, { headers });
}