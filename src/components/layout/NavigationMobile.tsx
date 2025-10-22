"use client";

import { useState } from "react";
import { Upload, Menu } from "lucide-react";
import { useConversations } from "@/context/ConversationContext";

export default function NavigationMobile() {
  const {
    conversation,
    conversations,
    selectConversation,
    startNewConversation,
  } = useConversations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="sm:hidden w-full bg-gray-900 text-white relative z-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={24} />
        </button>
        <span className="text-lg font-bold truncate">
          {conversation?.title || "AI Study Tutor"}
        </span>
        <button onClick={() => startNewConversation()} title="Upload PDF">
          <Upload size={20} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-gray-900 border-t border-gray-700 shadow-lg z-50">
          <div className="flex flex-col p-4">
            <button
              onClick={() => startNewConversation()}
              className="flex items-center gap-2 p-3 mb-4 bg-gray-800 hover:bg-gray-700 rounded-xl w-full"
            >
              <Upload size={18} /> Upload PDF
            </button>

            <div className="uppercase text-gray-400 text-sm mb-2">
              Conversations
            </div>
            {conversations.length === 0 ? (
              <p className="text-gray-400 text-sm">No conversations yet.</p>
            ) : (
              <ul className="mt-1">
                {conversations.map((conv) => (
                  <li
                    key={conv.id}
                    onClick={() => {
                      selectConversation(conv);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 cursor-pointer rounded-xl transition-colors ${
                      conversation?.id === conv.id
                        ? "bg-gray-700 font-semibold"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <span className="truncate">{conv.title || "Untitled"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
