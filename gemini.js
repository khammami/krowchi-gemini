require('dotenv').config(); // Load API keys from .env file

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const fs = require('fs');

const geminiApiKeys = process.env.GEMINI_API_KEYS.split(',');

// Configuration options for text generation (adjust these for different results)
const generationConfig = {
  temperature: 1.0,  // Controls randomness vs. focus (higher = more random)
  topK: 1,           // Select top K most likely words at each step
  topP: 1.0,          // Influence sampling over probability (higher = more common words)
  maxOutputTokens: 2048, // Maximum number of words generated
};

const safetySettings = [
  // Safety settings can be adjusted based on your application's needs
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];


// Function for text-only generation using gemini-pro model
async function runGeminiPro(prompt, index) {
  const chatHistory = [ // Optional: Predefined chat history (can be useful for specific cases)
    {
      role: "user",
      parts: [{
        "text": "System prompt: Your name is krowchi, a friendly funny chatbot in discord. "
      }],
    },
    {
      role: "model",
      parts: [{
        "text": "Understood, that's me krowchi :)"
      }],
    },
  ];

  // Access API key from environment variable
  const genAI = new GoogleGenerativeAI(geminiApiKeys[index]);

  // Get the gemini-pro model for text generation
  const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

  const chat = model.startChat({
    history: chatHistory,
    generationConfig,
    safetySettings,
  });

  // Send the prompt and get the response in one step
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}

// Function for text and image generation using gemini-pro-vision model
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function runGeminiVision(prompt, path, mimeType, index) {
  // Access API key from environment variable
  const genAI = new GoogleGenerativeAI(geminiApiKeys[index]);

  // Get the gemini-pro-vision model for text and image generation
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const imageParts = [
    fileToGenerativePart(path, mimeType),
  ];

  // Combine text prompt and image parts, then generate content in one step
  const response = await model.generateContent([prompt, ...imageParts]).response;
  const text = response.text();
  console.log(text);
  return text;
}

// Export functions and API keys for use in other modules
module.exports = { runGeminiPro, runGeminiVision, geminiApiKeys };
