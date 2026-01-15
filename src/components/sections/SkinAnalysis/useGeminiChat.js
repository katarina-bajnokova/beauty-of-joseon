import { useState, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Custom hook for AI skincare advisor chatbot using Google Gemini
 * Provides context-aware responses based on skin analysis results
 */
export default function useGeminiChat(analysisData) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Gemini API (uses VITE_GEMINI_API_KEY from .env)
  const getGeminiAPI = useCallback(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_api_key_here") {
      throw new Error(
        "Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env file"
      );
    }

    return new GoogleGenerativeAI(apiKey);
  }, []);

  /**
   * Build context about user's skin analysis for personalized responses
   */
  const buildSkinContext = useCallback(() => {
    if (!analysisData) {
      return "No skin analysis has been performed yet.";
    }

    const { averageScore, analysis, recommended } = analysisData;

    let context = `User's Skin Analysis Results:\n`;
    context += `Overall Score: ${averageScore || "N/A"}%\n\n`;

    if (analysis) {
      context += `Detailed Analysis:\n`;
      Object.entries(analysis).forEach(([key, value]) => {
        if (typeof value === "object" && value.score !== undefined) {
          context += `- ${key}: ${value.score}%\n`;
        }
      });
    }

    if (recommended && recommended.length > 0) {
      context += `\nRecommended Products: ${recommended.map((p) => p.name).join(", ")}\n`;
    }

    return context;
  }, [analysisData]);

  /**
   * Send message to Gemini and get AI response
   */
  const sendMessage = useCallback(
    async (userMessage) => {
      if (!userMessage.trim()) return;

      // Add user message to chat
      const userMsg = { role: "user", content: userMessage };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const genAI = getGeminiAPI();
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-exp",
        });

        // Build system prompt with skin analysis context
        const systemPrompt = `You are an expert Korean skincare advisor for Beauty of Joseon, a luxury K-beauty brand.

${buildSkinContext()}

Your role:
- Provide personalized skincare advice based on the user's analysis results
- Explain Korean skincare ingredients and routines
- Recommend Beauty of Joseon products when relevant
- Be warm, professional, and knowledgeable
- Keep responses concise (2-3 paragraphs max)
- Reference specific analysis scores when giving advice

Brand Philosophy: Beauty of Joseon combines traditional Korean herbal ingredients with modern skincare science, focusing on natural beauty and skin health.

User Question: ${userMessage}`;

        // Get AI response
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const aiMessage = response.text();

        // Add AI response to chat
        const aiMsg = { role: "assistant", content: aiMessage };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        console.error("Gemini API error:", err);

        let errorMessage = "Sorry, I encountered an error. ";

        if (err.message.includes("API key")) {
          errorMessage +=
            "Please configure your Gemini API key in the .env file.";
        } else if (err.message.includes("quota")) {
          errorMessage += "API quota exceeded. Please try again later.";
        } else {
          errorMessage += "Please try again.";
        }

        setError(errorMessage);

        // Add error message to chat
        const errorMsg = {
          role: "assistant",
          content: errorMessage,
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [buildSkinContext, getGeminiAPI]
  );

  /**
   * Clear chat history
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Send a quick starter message
   */
  const sendQuickMessage = useCallback(
    (message) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    sendQuickMessage,
  };
}
