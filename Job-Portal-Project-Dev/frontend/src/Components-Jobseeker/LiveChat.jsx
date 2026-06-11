import React, { useState, useEffect, useRef } from "react";
import "./LiveChat.css";
import { Footer } from "../Components-LandingPage/Footer";
import SilverStar from "../assets/SilverStar.png"
import GoldStar from "../assets/GoldStar.png"
import SendIcon from "../assets/SendIcon.png"
import api from "../api/axios";
import { FHeader } from "../Components-Jobseeker/FHeader";
 
const TypingDots = () => {
  return (
    <div className="Livechat-chat-msg bot typing">
      <span className="Livechat-dot"></span>
      <span className="Livechat-dot"></span>
      <span className="Livechat-dot"></span>
    </div>
  );
};
 
export const LiveChat = () => {
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  const [step, setStep] = useState("INIT");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
 
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
 
  useEffect(() => {
  if (step === "CHAT" && !isTyping) {
    inputRef.current?.focus();
  }
}, [step, isTyping]);
 
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop =
        chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping, step]);
 
 
    const startConversation = () => {
      setStep("CHAT");
      setMessages([
        {
          from: "bot",
          text: "Hi, How can I help you..."
        }
      ]);
 
      setTimeout(() => {
        inputRef.current?.focus();
      }, 1);
    };
 
  const handleSend = () => {
    if (!input.trim() || isTyping) return;
 
    const userMsg = {
      from: "user",
      text: input
    };
 
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
 
  //   simulateBotReply(input);
  // };
 
  // const simulateBotReply = (userText) => {
  //   setIsTyping(true);
 
  //   setTimeout(() => {
  //     let reply =
  //       "Please tell me more so I can assist you better.";
 
  //     if (userText.toLowerCase().includes("login")) {
  //       reply =
  //         "You can login as a jobseeker by clicking Login → Jobseeker and using your registered email and password.";
  //     }
 
  //     setIsTyping(false);
  //     setMessages((prev) => [
  //       ...prev,
  //       { from: "bot", text: reply }
  //     ]);
  //   }, 1500);
    // };
 
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
      sendToBackend(input);
  };
 
  const sendToBackend = async (text) => {
    try {
      setIsTyping(true);
 
      const res = await api.post(
        "chat/",
        {
          message: text
        }
      );
 
      setIsTyping(false);
 
      // Backend returns:
      // { user:{}, bot:{} }
 
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: res.data.bot.message
        }
      ]);
 
    } catch (err) {
      setIsTyping(false);
 
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Server error. Please try again."
        }
      ]);
      console.error(err);
    }
  };
 
  const endConversation = () => {
    setShowFeedback(true);
  };
 
  const handleFeedbackSubmit = () => {
    setShowFeedback(false);
    setStep("ENDED");
  };
 
  return (
    <>
      <FHeader />
 
      <div className="Livechat-chat-wrapper">
        <div className="Livechat-chat-box">
          {step === "INIT" && (
            <div className="Livechat-start-card">
              <p>Tell us what's going on</p>
              <button onClick={startConversation}>
                Start conversation <img className="Livechat-send-icon" src={SendIcon} alt="SendTo" />
              </button>
            </div>
 
          )}
 
          {step !== "INIT" && (
            <>
              <div className="Livechat-chat-body" ref={chatBodyRef}>
                <div className="Livechat-chat-spacer" />
 
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`Livechat-chat-msg ${msg.from === "user" ? "user" : "bot"}`}
                  >
                    <span>{msg.text}</span>
                  </div>
                ))}
 
                {isTyping && <TypingDots />}
 
                {step === "ENDED" && (
                  <div className="Livechat-chat-complete">
                    <p>Bot has ended your conversation</p>
                  </div>
                )}
                {/* <div ref={chatBodyRef} /> */}
              </div>
 
              {step === "CHAT" && (
                <div className="Livechat-chat-input">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // prevents newline / unwanted behavior
                        handleSend();
                      }
                    }}
                  />
                  <button onClick={handleSend}
                  >
                    Send <img className="Livechat-send-icon" src={SendIcon} />
                  </button>
                  <button className="Livechat-end-btn" onClick={endConversation}>
                    End
                  </button>
                </div>
              )}
 
              {step === "ENDED" && (
                <div className="Livechat-chat-end-bar">
                  <button onClick={startConversation}>
                    Start new conversation
                    <img className="Livechat-send-icon" src={SendIcon} />
                  </button>
                </div>
              )}
            </>
          )}
 
 
 
 
        </div>
 
        {showFeedback && (
          <div className="Livechat-modal-overlay">
            <div className="Livechat-modal">
              <h3>Share your feedback</h3>
 
              <div className="Livechat-stars">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span
                    key={num}
                    className="Livechat-star"
                    onClick={() => setRating(num)}
                  >
                    <img
                      src={rating >= num ? GoldStar : SilverStar}
                      alt="star"
                    />
                  </span>
                ))}
              </div>
 
 
              <textarea
                placeholder="Your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
 
              <button
              onClick={handleFeedbackSubmit}>
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
 
      <Footer />
    </>
  );
};
 
 