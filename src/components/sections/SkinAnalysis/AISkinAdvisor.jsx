import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faTimes,
  faPaperPlane,
  faStar,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import useGeminiChat from "./useGeminiChat";
import styles from "./AISkinAdvisor.module.scss";

/**
 * AI Skincare Advisor - Floating chatbot using Google Gemini
 * Provides personalized skincare advice based on analysis results
 */
export default function AISkinAdvisor({ analysisData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { messages, isLoading, sendMessage, clearChat, sendQuickMessage } =
    useGeminiChat(analysisData);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const quickQuestions = [
    "What does my skin analysis mean?",
    "What products should I use?",
    "Explain my skin type",
    "Korean skincare routine tips",
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className={styles.chatButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Skincare Advisor"
        >
          <FontAwesomeIcon icon={faComments} />
          <FontAwesomeIcon icon={faStar} className={styles.sparkle} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <FontAwesomeIcon icon={faStar} className={styles.icon} />
              <div>
                <h3>AI Skincare Advisor</h3>
                <p>Powered by Gemini</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className={styles.clearButton}
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className={styles.closeButton}
                aria-label="Close chat"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <FontAwesomeIcon icon={faStar} className={styles.welcomeIcon} />
                <h4>Welcome to Your AI Skincare Advisor!</h4>
                <p>
                  I'm here to help you understand your skin analysis and
                  recommend the perfect Beauty of Joseon products for your skin.
                </p>

                {analysisData ? (
                  <>
                    <p className={styles.welcomeHint}>
                      Ask me anything about your results:
                    </p>
                    <div className={styles.quickButtons}>
                      {quickQuestions.map((question, index) => (
                        <button
                          key={index}
                          className={styles.quickButton}
                          onClick={() => sendQuickMessage(question)}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className={styles.noAnalysis}>
                    Upload a photo and analyze your skin first to get
                    personalized recommendations!
                  </p>
                )}
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${styles[msg.role]} ${msg.isError ? styles.error : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className={styles.avatar}>
                      <FontAwesomeIcon icon={faStar} />
                    </div>
                  )}
                  <div className={styles.messageContent}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.avatar}>
                  <FontAwesomeIcon icon={faStar} />
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className={styles.chatInput} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your skin analysis..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
