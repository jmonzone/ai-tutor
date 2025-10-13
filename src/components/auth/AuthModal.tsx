"use client";

import { useState } from "react";

interface AuthModalProps {
  mode: "login" | "signup";
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, token: string) => void; // new
}

export default function AuthModal({
  mode,
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    const endpoint = `/api/auth/${mode}`;
    console.log(endpoint);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        console.log(data);
        onSuccess(email, data.token);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      <div className="relative z-10 w-80 bg-white text-black rounded-lg shadow-xl">
        <div className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {mode === "login" ? "Login" : "Sign Up"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 font-bold text-lg"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          <input
            type="email"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-black"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
