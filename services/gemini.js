// services/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const summarizeArticle = async (url) => {
  const fetchAndParse = async (targetUrl) => {
    // We tell Gemini to return ONLY JSON
    const prompt = `Summarize this article: ${targetUrl}. 
    Return ONLY a JSON object with these keys: "title", "summary" (max 3 sentences), and "category" (one word).`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean the response (sometimes AI adds ```json blocks)
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson);
  };

  return await fetchAndParse(url);
};
