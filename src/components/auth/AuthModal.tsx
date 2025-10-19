"use client";

import { useUser } from "@/context/UserContext";
import { useState } from "react";

interface AuthModalProps {
  mode: "login" | "signup";
  isOpen: boolean;
  onClose: () => void;
  onToggleMode: () => void;
}

export default function AuthModal({
  mode,
  isOpen,
  onClose,
  onToggleMode,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    const endpoint = `/api/auth/${mode}`;
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
        setUser({ id: data.userId, email, role: "student" });
        localStorage.setItem("token", data.token);
        onClose();
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
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 w-80 bg-white text-black rounded-lg shadow-xl">
        <div className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold capitalize">
              {mode === "login" ? "Login" : "Sign Up"}
            </h2>
            {/* <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 font-bold text-lg"
              aria-label="Close modal"
            >
              &times;
            </button> */}
          </div>

          <input
            type="email"
            placeholder="Email"
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

          <div className="mt-4 text-center text-sm text-gray-600">
            {mode === "login" ? (
              <>
                No account?{" "}
                <button
                  onClick={onToggleMode}
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  onClick={onToggleMode}
                  className="text-blue-600 hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
