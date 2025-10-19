"use client";

import { useState, useEffect } from "react";
import AuthModal from "../auth/AuthModal";
import { useUser } from "@/context/UserContext"; // adjust path if needed
import { guest } from "@/types/user";

export default function Header() {
  const [modalMode, setModalMode] = useState<"login" | "signup" | null>(
    "login"
  );
  const [mounted, setMounted] = useState(false);

  const { user, setUser } = useUser();

  useEffect(() => {
    setModalMode(user.role == "guest" ? "login" : null);
  }, [user]);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
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
          setUser({ id: data.userId, email: data.email, role: "student" });
        } else {
          localStorage.removeItem("token");
          setUser(guest);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        setUser(guest);
      } finally {
        setMounted(true);
      }
    };

    validateSession();
  }, [setUser]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("token");
        setUser(guest);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted) return null;

  return (
    <header className="w-full bg-black shadow-sm border-b border-gray-200 flex justify-end items-center h-14 px-6">
      {user.role == "guest" && modalMode ? (
        <AuthModal
          mode={modalMode}
          isOpen={!!modalMode}
          onClose={() => setModalMode(null)}
          onToggleMode={() =>
            setModalMode(modalMode === "login" ? "signup" : "login")
          }
        />
      ) : (
        <>
          <span className="text-white mr-4">Welcome, {user.email}</span>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </>
      )}

      {/* {modalMode && (
        <AuthModal
          mode={modalMode}
          isOpen={!!modalMode}
          onClose={() => setModalMode(null)}
        />
      )} */}
    </header>
  );
}
