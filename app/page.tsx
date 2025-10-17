import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-700">
        KRUX Finance Support System
      </h1>
      <p className="text-gray-600">Choose your interface:</p>

      <div className="flex gap-4">
        <Link
          href="/customer-chat"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Customer Chatbot
        </Link>

        <Link
          href="/support-dashboard"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Support Dashboard
        </Link>

        <Link
          href="/login"
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
          Login
        </Link>

      </div>
    </main>
  );
}
