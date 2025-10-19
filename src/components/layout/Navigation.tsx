"use client";

import { useConversations } from "@/context/ConversationProvider";

export default function Navigation() {
  const {
    conversation,
    conversations,
    selectConversation,
    startNewConversation,
  } = useConversations();

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white w-64">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        AI Study Tutor
      </div>

      <button
        onClick={() => startNewConversation()}
        className="flex items-center gap-2 p-3 m-3 bg-gray-800 hover:bg-gray-700 rounded-xl"
      >
        Upload PDF
      </button>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-gray-400 p-4 text-sm">No conversations yet.</p>
        ) : (
          <ul>
            {conversations.map((conv) => (
              <li
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`flex items-center gap-2 p-3 cursor-pointer rounded-xl ${
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
  );
}
