"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [models, setModels] = useState<string[]>(["qwen2.5:3b", "qwen2.5-coder:3b", "deepseek-r1:1.5b"]);
  const [selectedModel, setSelectedModel] = useState("qwen2.5:3b");
  const [mode, setMode] = useState<"Agent" | "Chat">("Agent");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.models && data.models.length > 0) {
          setModels(data.models);
          setSelectedModel(data.models[0]);
        }
      })
      .catch(() => console.log("Using default model list."));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !imageBase64) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      image: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    const currentImage = imageBase64;
    setInput("");
    setImageBase64(null);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentInput,
          model: selectedModel,
          mode: mode,
          image_base64: currentImage,
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "No response received.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Failed to connect to FastAPI backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-5 flex flex-col justify-between bg-zinc-900/50">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-4 w-4 rounded-full bg-coral-500 bg-rose-500 animate-pulse" />
            <h1 className="text-xl font-bold tracking-wider text-rose-500">CHINTHAN</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2 font-semibold">
                Model Engine
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-rose-500"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2 font-semibold">
                Workbench Mode
              </label>
              <div className="grid grid-cols-2 gap-2 bg-zinc-800 p-1 rounded-lg">
                {(["Agent", "Chat"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                      mode === m
                        ? "bg-rose-500 text-white font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-4">
          Local AI Workbench • Active
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col justify-between bg-zinc-950">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <p className="text-lg font-medium text-zinc-400">CHINTHAN Autonomous Workbench</p>
              <p className="text-sm">Select a model or mode in the sidebar to start.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-2xl rounded-xl p-4 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-rose-600 text-white"
                      : "bg-zinc-800/80 text-zinc-100 border border-zinc-700/50"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Uploaded"
                      className="max-h-48 rounded-lg mb-2 object-cover"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm italic">
              <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              CHINTHAN is processing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <div className="max-w-4xl mx-auto flex items-center gap-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-2 focus-within:border-rose-500/80">
            <label className="cursor-pointer text-zinc-400 hover:text-rose-400 px-2 transition-colors">
              📷
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                imageBase64 ? "Image attached! Type a prompt..." : "Ask CHINTHAN anything..."
              }
              className="flex-1 bg-transparent text-sm text-zinc-100 focus:outline-none placeholder-zinc-500"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}