"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatMessageTimestamp, getDateSeparator, isSameDay } from "../utils/timestampUtils";
import { useAppContext } from "../context/AppContext";

type Message = {
  sender: "user" | "bot";
  text: string;
  time: string;
};

export default function CustomerChat() {
  const router = useRouter();
  const { state, dispatch, logout } = useAppContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Wait for app initialization and check authentication
  useEffect(() => {
    if (!state.isInitialized) return;
    
    if (!state.user || !state.user.phone) {
      router.push("/login");
      return;
    }
  }, [state.isInitialized, state.user, router]);

  // Load chat history when user is available
  useEffect(() => {
    if (typeof window === "undefined" || !state.user?.phone) return;
    
    const chatKey = `chat_history_${state.user.phone}`;
    const storedMessages = localStorage.getItem(chatKey);
    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages);
      
      // Check if messages have old timestamp format and clear them
      const hasOldFormat = parsedMessages.some((msg: any) => 
        typeof msg.time === 'string' && 
        !msg.time.includes('T') && 
        !msg.time.includes('Z')
      );
      
      if (hasOldFormat) {
        // Clear old format messages and start fresh
        localStorage.removeItem(chatKey);
        setMessages([]);
      } else {
        setMessages(parsedMessages);
      }
    }
  }, [state.user?.phone]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !state.user?.phone) return;

    const userMsg: Message = {
      sender: "user",
      text: input,
      time: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    
    const chatKey = `chat_history_${state.user.phone}`;
    localStorage.setItem(chatKey, JSON.stringify(newMessages));
    setInput("");

    setIsTyping(true);
    setTimeout(() => {
      handleBotReply(userMsg.text, newMessages);
      setIsTyping(false);
    }, 700);
  };

  const handleBotReply = (query: string, prevMsgs: Message[]) => {
    if (!state.user?.phone) return;
    
    let reply = "";
    const lower = query.toLowerCase();
    const ticketsKey = `tickets_${state.user.phone}`;

    if (lower.includes("loan"))
      reply = "We offer Business, Personal and MSME loans. Would you like to start an application?";
    else if (lower.includes("document"))
      reply = "For most loans you'll need PAN, Aadhaar, bank statement and income proof.";
    else if (lower.includes("status")) {
      const tickets = JSON.parse(localStorage.getItem(ticketsKey) || "[]");
      const userTickets = tickets.filter((t: any) => t.customer?.phone === state.user.phone);
      reply = userTickets.length
        ? `Your latest ticket (${userTickets.at(-1).id}) is currently *${userTickets.at(-1).status}*.\nCreated on ${userTickets.at(-1).createdAt}.`
        : "You have no open tickets at the moment.";
    } else if (lower.includes("human") || lower.includes("agent")) {
      const existing = JSON.parse(localStorage.getItem(ticketsKey) || "[]");
      const newTicket = {
        id: `TCKT-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: state.user,
        createdAt: new Date().toLocaleString(),
        status: "Open",
        messages: prevMsgs,
      };
      const updatedTickets = [...existing, newTicket];
      localStorage.setItem(ticketsKey, JSON.stringify(updatedTickets));
      dispatch({ type: "SET_TICKETS", payload: updatedTickets });
      reply = `Sure! I've created a support ticket for you.\n📄 Ticket ID: ${newTicket.id}\nAn agent will reach out soon.`;
    } else {
      reply = "I'm here to assist with loans, documents, or application status. Please type your query.";
    }

    const botMsg: Message = {
      sender: "bot",
      text: reply,
      time: new Date().toISOString(),
    };

    const updated = [...prevMsgs, botMsg];
    setMessages(updated);
    const chatKey = `chat_history_${state.user.phone}`;
    localStorage.setItem(chatKey, JSON.stringify(updated));
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Show loading while app initializes
  if (!state.isInitialized || state.isLoading) {
    return (
      <main className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-lg">Loading...</div>
      </main>
    );
  }

  // Don't render if no user (will redirect)
  if (!state.user) {
    return null;
  }

  return (
    <main className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-600 text-white px-4 py-3 font-semibold text-lg flex justify-between items-center">
        <span>KRUX Finance Chatbot</span>
        <div className="flex items-center gap-3">
          <span className="text-sm">Welcome, {state.user.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          // Check if we need to show a date separator
          const showDateSeparator = i === 0 || !isSameDay(messages[i - 1].time, m.time);
          const dateSeparator = showDateSeparator ? getDateSeparator(m.time) : null;
          
          return (
            <div key={i}>
              {dateSeparator && (
                <div className="flex justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {dateSeparator}
                  </div>
                </div>
              )}
              <div className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow whitespace-pre-line break-words ${
                    m.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  {m.text}
                  <div className={`text-[10px] mt-1 text-right ${
                    m.sender === "user" ? "text-blue-100" : "text-gray-400"
                  }`}>
                    {formatMessageTimestamp(m.time)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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