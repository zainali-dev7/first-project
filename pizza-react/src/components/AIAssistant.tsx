import { useState } from "react";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!message.trim()) return;
    setLoading(true);
    setReply("");

    const response = await fetch("https://first-project-production-2d14.up.railway.app/api/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();

    setReply(data.reply);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-semibold text-red-600 border-b-4 border-orange-400 inline-block pb-1 mb-4">
        🍕 Ask Our AI Assistant
      </h2>
      <p className="text-gray-500 text-sm mb-3">
        Tell me what you're craving, and I'll recommend a pizza!
      </p>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="e.g. something spicy"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-2"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md"
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>
      {reply && (
        <p className="bg-orange-50 border border-orange-200 rounded-md p-3 text-gray-700">
          {reply}
        </p>
      )}
    </div>
  );
}

export default AIAssistant;