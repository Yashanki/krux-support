"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAppContext } from "../context/AppContext";

type Message = {
  sender: "user" | "bot";
  text: string;
  time: string;
};

export default function CustomerChat() {
  const router = useRouter();

  const { state, dispatch } = useAppContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!state.user) {
      const stored = localStorage.getItem("user");
      if (!stored) router.push("/login");
      else dispatch({ type: "SET_USER", payload: JSON.parse(stored) });
    }
  }, [router, state.user, dispatch]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const old = localStorage.getItem("chat_history");
    if (old) setMessages(JSON.parse(old));
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    localStorage.setItem("chat_history", JSON.stringify(newMessages));
    setInput("");

    setIsTyping(true);
    setTimeout(() => {
      handleBotReply(userMsg.text, newMessages);
      setIsTyping(false);
    }, 700);
  };

  const handleBotReply = (query: string, prevMsgs: Message[]) => {
    let reply = "";
    const lower = query.toLowerCase();

    if (lower.includes("loan"))
      reply =
        "We offer Business, Personal and MSME loans. Would you like to start an application?";
    else if (lower.includes("document"))
      reply =
        "For most loans you'll need PAN, Aadhaar, bank statement and income proof.";
    else if (lower.includes("status")) {
      const tickets = state.tickets || JSON.parse(localStorage.getItem("tickets") || "[]");
      const user = state.user || JSON.parse(localStorage.getItem("user") || "{}");
      const userTickets = tickets.filter(
        (t: any) => t.customer?.phone === user.phone
      );

      if (userTickets.length === 0) {
        reply = "You have no open tickets at the moment.";
      } else {
        const latest = userTickets[userTickets.length - 1];
        reply = `Your latest ticket (${latest.id}) is currently *${latest.status}*.\nCreated on ${latest.createdAt}.`;
      }
    }
    else if (lower.includes("human") || lower.includes("agent")) {
      const user = state.user || JSON.parse(localStorage.getItem("user") || "{}");
      const existing = state.tickets || JSON.parse(localStorage.getItem("tickets") || "[]");

      const newTicket = {
        id: `TCKT-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: user,
        createdAt: new Date().toLocaleString(),
        status: "Open",
        messages: prevMsgs,
      };

      const updatedTickets = [...existing, newTicket];
      localStorage.setItem("tickets", JSON.stringify(updatedTickets));
      dispatch({ type: "SET_TICKETS", payload: updatedTickets });

      reply = `Sure! I’ve created a support ticket for you.\n📄 Ticket ID: ${newTicket.id}\nAn agent will reach out soon.`;
    }
    else {
      reply =
        "I'm here to assist with loans, documents, or application status. Please type your query.";
    }

    const botMsg: Message = {
      sender: "bot",
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [...prevMsgs, botMsg];
    setMessages(updated);
    localStorage.setItem("chat_history", JSON.stringify(updated));
  };

  return (
    <main className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 font-semibold text-lg">
        KRUX Finance Chatbot
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl shadow whitespace-pre-line ${
                m.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              {m.text}
              <div className="text-[10px] text-gray-400 mt-1 text-right">
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-1 text-gray-500 italic ml-2">
            <span className="text-sm">Bot is typing</span>
            <div className="typing-dots flex space-x-1">
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </div>
          </div>
        )}


        <div ref={chatEndRef}></div>
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t bg-white flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </main>
  );
}
