"use client";

import Image from "next/image";
import { useConversations } from "@/context/ConversationContext";
import { Upload, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navigation() {
  const {
    conversation,
    conversations,
    selectConversation,
    startNewConversation,
  } = useConversations();

  const [displayedTitle, setDisplayedTitle] = useState(
    conversation?.title || ""
  );
  const [isFading, setIsFading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Fade transition for conversation title changes
  useEffect(() => {
    if (conversation?.title !== displayedTitle) {
      setIsFading(true);
      const timeout = setTimeout(() => {
        setDisplayedTitle(conversation?.title || "");
        setIsFading(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [conversation?.title]);

  return (
    <div
      className={`flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b border-gray-700 ${
          collapsed ? "p-3" : "p-2"
        }`}
      >
        {/* Logo (also open/click handler) */}
        <button
          onClick={() => {
            if (collapsed) setCollapsed(false);
            else startNewConversation();
          }}
          title={collapsed ? "Open Sidebar" : "Start New Conversation"}
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

        {/* Collapse Button */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse Sidebar"
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Collapsed Upload Icon */}
      {collapsed && (
        <button
          onClick={() => startNewConversation()}
          title="Upload PDF"
          className="flex items-center justify-center gap-2 p-3 m-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
        >
          <Upload size={18} className="text-gray-300" />
        </button>
      )}

      {/* Expanded Content */}
      {!collapsed && (
        <>
          {/* Upload Button */}
          <button
            onClick={() => startNewConversation()}
            title="Upload a new PDF"
            className="flex items-center justify-center gap-2 p-3 m-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
          >
            <Upload size={18} className="text-gray-300" />
            <span>Upload PDF</span>
          </button>

          {/* Conversations Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-sm font-medium text-gray-400 uppercase tracking-wide border-b border-gray-800">
              Conversations
            </div>

            {conversations.length === 0 ? (
              <p className="text-gray-400 p-4 text-sm">No conversations yet.</p>
            ) : (
              <ul className="mt-1">
                {conversations.map((conv) => {
                  const isActive = conversation?.id === conv.id;
                  const title =
                    isActive && !isFading
                      ? displayedTitle
                      : conv.title || "Untitled";

                  return (
                    <li
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      title={conv.title || "Untitled Conversation"}
                      className={`flex items-center gap-2 p-3 cursor-pointer rounded-xl transition-colors ${
                        isActive
                          ? "bg-gray-700 font-semibold"
                          : "hover:bg-gray-800"
                      }`}
                    >
                      <span
                        className={`truncate transition-opacity duration-300 ${
                          isActive && isFading ? "opacity-0" : "opacity-100"
                        }`}
                      >
                        {title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
