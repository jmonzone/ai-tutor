"use client";

import { useState, useEffect } from "react";
import AuthModal from "../auth/AuthModal";

export default function Header() {
  const [modalMode, setModalMode] = useState<"login" | "signup" | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("userEmail");
      if (!token || !email) {
        setMounted(true);
        return;
      }

      try {
        const res = await fetch("/api/auth/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (data.valid) {
          setUserEmail(email);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
          setUserEmail(null);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        setUserEmail(null);
      } finally {
        setMounted(true);
      }
    };

    validateSession();
  }, []);

  const handleAuthSuccess = (email: string, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
    setUserEmail(email);
    setModalMode(null);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        setUserEmail(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted) return null; // prevent flash on SSR

  return (
    <header className="w-full bg-black shadow-sm border-b border-gray-200 flex justify-end items-center h-14 px-6">
      {!userEmail ? (
        <>
          <button
            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={() => setModalMode("login")}
          >
            Login
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            onClick={() => setModalMode("signup")}
          >
            Sign Up
          </button>
        </>
      ) : (
        <>
          <span className="text-white mr-4">Welcome, {userEmail}</span>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </>
      )}

      {modalMode && (
        <AuthModal
          mode={modalMode}
          isOpen={!!modalMode}
          onClose={() => setModalMode(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </header>
  );
}
