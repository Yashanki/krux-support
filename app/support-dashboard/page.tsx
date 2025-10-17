"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Ticket = {
  id: string;
  customer: { name: string; phone: string };
  createdAt: string;
  status: string;
  messages: any[];
};

export default function SupportDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [active, setActive] = useState<Ticket | null>(null);

  // 🔹 Auth check
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) router.push("/login");
  }, [router]);

  // 🔹 Load tickets
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("tickets") || "[]");
    setTickets(saved);
  }, []);

  const resolveTicket = (id: string) => {
    const updated = tickets.map((t) =>
      t.id === id ? { ...t, status: "Resolved" } : t
    );
    setTickets(updated);
    localStorage.setItem("tickets", JSON.stringify(updated));
    setActive(null);
  };

  return (
    <main className="flex h-screen">
      {/* Left: Ticket List */}
      <div className="w-1/3 border-r bg-gray-50 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-3 text-green-700">Support Tickets</h2>
        {tickets.length === 0 ? (
          <p className="text-gray-500">No tickets yet.</p>
        ) : (
          tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setActive(t)}
              className={`p-3 mb-2 rounded cursor-pointer border ${
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
              <div className="text-xs text-gray-500">{t.createdAt}</div>
            </div>
          ))
        )}
      </div>

      {/* Right: Active Ticket View */}
      <div className="flex-1 p-6 flex flex-col">
        {!active ? (
          <div className="text-gray-500 text-center mt-20">
            Select a ticket to view details
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold">
                Chat with {active.customer.name}
              </h3>
              {active.status === "Open" && (
                <button
                  onClick={() => resolveTicket(active.id)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Mark Resolved
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {active.messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.sender === "user" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg max-w-sm ${
                      m.sender === "user"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-green-100 text-green-900"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
