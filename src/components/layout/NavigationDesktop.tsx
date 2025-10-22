"use client";

import Image from "next/image";
import { useState } from "react";
import { Upload, ChevronLeft } from "lucide-react";
import { useConversations } from "@/context/ConversationContext";

export default function NavigationDesktop() {
  const {
    conversation,
    conversations,
    selectConversation,
    startNewConversation,
  } = useConversations();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="hidden sm:flex h-full bg-gray-900 text-white flex-col transition-all duration-300"
      style={{ width: collapsed ? 64 : 256 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-xl font-bold hover:bg-gray-800 transition-colors rounded-lg p-2 w-full justify-start"
        >
          <Image
            src="/favicon.ico"
            alt="App icon"
            width={24}
            height={24}
            className="rounded-sm flex-shrink-0"
          />
          {!collapsed && <span className="truncate">AI Study Tutor</span>}
        </button>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            title="Collapse Sidebar"
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={() => startNewConversation()}
        className={`flex items-center justify-center gap-2 p-3 m-3 bg-gray-800 hover:bg-gray-700 rounded-xl ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <Upload size={18} />
        {!collapsed && <span>Upload PDF</span>}
      </button>

      {/* Conversation List */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-sm font-medium text-gray-400 uppercase tracking-wide border-b border-gray-800">
            Conversations
          </div>
          {conversations.length === 0 ? (
            <p className="text-gray-400 p-4 text-sm">No conversations yet.</p>
          ) : (
            <ul className="mt-1">
              {conversations.map((conv) => (
                <li
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
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
      )}
    </div>
  );
}
