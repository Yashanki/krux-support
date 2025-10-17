"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../context/AppContext";

const schema = z.object({
  identifier: z
    .string()
    .min(3, "Please enter at least 3 characters")
    .trim(),
});

type FormData = z.infer<typeof schema>;

const mockUsers = {
  customers: [
    { phone: "+919876543210", name: "Rahul Sharma" },
    { phone: "+919876543211", name: "Priya Patel" },
  ],
  agents: [
    { username: "amit.kumar", role: "Support Agent" },
    { username: "sneha.singh", role: "Senior Agent" },
  ],
};

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAppContext();
  const [mode, setMode] = useState<"customer" | "agent">("customer");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    const input = data.identifier.trim();

    if (mode === "customer") {
      const user = mockUsers.customers.find((u) => u.phone === input);
      if (user) {
        const userData = { ...user, role: "customer" };
        
        // Use the AppContext loginUser method
        loginUser(userData);
        
        // Navigate to chat page
        router.push("/customer-chat");
      } else {
        alert("Customer not found!");
      }
    } else {
      const user = mockUsers.agents.find((u) => u.username === input);
      if (user) {
        // For agents, use the AppContext loginUser method to preserve data
        const userData = { ...user, role: "agent" };
        loginUser(userData);
        router.push("/support-dashboard");
      } else {
        alert("Agent not found!");
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-700">
          {mode === "customer" ? "Customer Login" : "Agent Login"}
        </h1>

        <div className="flex justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("customer")}
            className={`px-3 py-1 rounded ${
              mode === "customer" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setMode("agent")}
            className={`px-3 py-1 rounded ${
              mode === "agent" ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            Agent
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register("identifier")}
            type="text"
            placeholder={mode === "customer" ? "Enter phone number" : "Enter username"}
            className="border w-full p-3 mb-1 rounded"
          />
          {errors.identifier && (
            <p className="text-red-500 text-sm mb-2">{errors.identifier.message}</p>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
