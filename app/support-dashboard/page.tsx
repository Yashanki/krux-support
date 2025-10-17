"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatWhatsAppTimestamp, formatMessageTimestamp, getDateSeparator, isSameDay } from "../utils/timestampUtils";
import { useAppContext } from "../context/AppContext";

type Ticket = {
  id: string;
  customer: { name: string; phone: string };
  createdAt: string;
  status: string;
  messages: any[];
};

export default function SupportDashboard() {
  const router = useRouter();
  const { state, updateTicketStatus, refreshAllTickets, logout } = useAppContext();
  const [active, setActive] = useState<Ticket | null>(null);

  // Wait for app initialization and check authentication
  useEffect(() => {
    if (!state.isInitialized) return;
    
    // Check if user is an agent
    if (!state.user || state.user.role !== "agent") {
      router.push("/login");
      return;
    }
    
    // Refresh tickets when dashboard loads
    refreshAllTickets();
  }, [state.isInitialized, state.user, router]);

  const resolveTicket = (id: string) => {
    updateTicketStatus(id, "Resolved");
    setActive(null);
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

  return (
    <main className="flex h-screen flex-col sm:flex-row">
      {/* Left: Ticket List */}
      <div
        className={`border-r bg-gray-50 p-4 overflow-y-auto sm:w-1/3 w-full ${
          active ? "hidden sm:block" : "block"
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-green-700">Support Tickets</h2>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        {state.allTickets.length === 0 ? (
          <p className="text-gray-500">No tickets yet.</p>
        ) : (
          state.allTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setActive(t)}
              className={`p-4 mb-3 rounded cursor-pointer border transition ${
                active?.id === t.id
                  ? "bg-green-100 border-green-400"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{t.customer.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    t.status === "Open"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{formatWhatsAppTimestamp(t.createdAt)}</div>
            </div>
          ))
        )}
      </div>

      {/* Right: Active Ticket View */}
      <div
        className={`flex-1 p-4 sm:p-6 flex flex-col ${
          !active ? "hidden sm:flex" : "flex"
        }`}
      >
        {!active ? (
          <div className="text-gray-500 text-center mt-20">
            Select a ticket to view details
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActive(null)}
                  className="sm:hidden text-blue-600 text-sm px-2 py-1 -ml-2"
                >
                  Back
                </button>
                <h3 className="text-lg font-semibold">
                  Chat with {active.customer.name}
                </h3>
              </div>
              {active.status === "Open" && (
                <button
                  onClick={() => resolveTicket(active.id)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Mark Resolved
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-2 sm:p-4">
              {active.messages.map((m, i) => {
                // Check if we need to show a date separator
                const showDateSeparator = i === 0 || !isSameDay(active.messages[i - 1].time, m.time);
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
                    <div
                      className={`flex ${
                        m.sender === "user" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-lg max-w-[80%] sm:max-w-sm ${
                          m.sender === "user"
                            ? "bg-gray-200 text-gray-800"
                            : "bg-green-100 text-green-900"
                        }`}
                      >
                        <div className="whitespace-pre-line">{m.text}</div>
                        {m.time && (
                          <div className="text-[10px] text-gray-500 mt-1 text-right">
                            {formatMessageTimestamp(m.time)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
