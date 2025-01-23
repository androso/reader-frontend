"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Maximize2, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dispatch, memo, SetStateAction, useState } from "react";

type Message = {
    role: string;
    content: string;
};

type Conversation = {
    id: number;
    title: string;
    date: string;
    messages: Message[];
};

const pastConversations = [
    {
        id: 1,
        title: "Understanding Chapter 1",
        date: "2024-01-10",
        messages: [
            {
                role: "user",
                content: "Can you explain the main theme of Chapter 1?",
            },
            {
                role: "assistant",
                content:
                    "The main theme revolves around the concept of vertical progress versus horizontal progress in technology.",
            },
        ],
    },
    {
        id: 2,
        title: "Character Analysis",
        date: "2024-01-09",
        messages: [
            {
                role: "user",
                content: "What are the key characteristics of the protagonist?",
            },
            {
                role: "assistant",
                content:
                    "The protagonist shows strong leadership qualities and innovative thinking throughout the story.",
            },
        ],
    },
    {
        id: 3,
        title: "Analysis",
        date: "2024-01-09",
        messages: [
            {
                role: "user",
                content:
                    "hesflksdjWhat are the key characteristics of the protagonist?",
            },
            {
                role: "assistant",
                content:
                    "The protagonist shows strong leadership qualities and innovative thinking throughout the story.",
            },
        ],
    },
    {
        id: 4,
        title: "Chapter 1",
        date: "2024-01-10",
        messages: [
            {
                role: "user",
                content: "Can you explain the main theme of Chapter 1?",
            },
            {
                role: "assistant",
                content:
                    "The main theme revolves around the concept of vertical progress versus horizontal progress in technology.",
            },
        ],
    },
    {
        id: 5,
        title: "Understanding Chapter 1",
        date: "2024-01-10",
        messages: [
            {
                role: "user",
                content: "Can you explain the main theme of Chapter 1?",
            },
            {
                role: "assistant",
                content:
                    "The main theme revolves around the concept of vertical progress versus horizontal progress in technology.",
            },
        ],
    },
    {
        id: 6,
        title: "Character Analysis",
        date: "2024-01-09",
        messages: [
            {
                role: "user",
                content: "What are the key characteristics of the protagonist?",
            },
            {
                role: "assistant",
                content:
                    "The protagonist shows strong leadership qualities and innovative thinking throughout the story.",
            },
        ],
    },
    {
        id: 7,
        title: "Analysis",
        date: "2024-01-09",
        messages: [
            {
                role: "user",
                content:
                    "hesflksdjWhat are the key characteristics of the protagonist?",
            },
            {
                role: "assistant",
                content:
                    "The protagonist shows strong leadership qualities and innovative thinking throughout the story.",
            },
        ],
    },
    {
        id: 8,
        title: "Chapter 1",
        date: "2024-01-10",
        messages: [
            {
                role: "user",
                content: "Can you explain the main theme of Chapter 1?",
            },
            {
                role: "assistant",
                content:
                    "The main theme revolves around the concept of vertical progress versus horizontal progress in technology.",
            },
        ],
    },
];

const MessageList = memo(
    ({
        messages,
        isMobile,
        isExpanded,
    }: {
        messages: Message[];
        isMobile: boolean;
        isExpanded: boolean;
    }) => {
        return (
            <ScrollArea
                className={`${isMobile ? (isExpanded ? "h-full" : "h-[200px]") : "h-full"} p-4 space-y-3`}
            >
                {(isMobile && !isExpanded ? messages.slice(-2) : messages)
                    .filter(Boolean)
                    .map((message: Message, index: number) => (
                        <div
                            key={index}
                            className={`mb-4 p-3 rounded-lg ${
                                message.role === "assistant"
                                    ? "bg-blue-50 border border-blue-100"
                                    : "bg-gray-50 border border-gray-100"
                            }`}
                        >
                            <p
                                className={`text-sm leading-relaxed ${
                                    message.role === "assistant"
                                        ? "text-blue-700 font-medium"
                                        : "text-gray-700"
                                }`}
                            >
                                {message.content}
                            </p>
                        </div>
                    ))}
            </ScrollArea>
        );
    }
);
MessageList.displayName = "MessageList";

function ChatHistory({
    conversations,
    onSelectConversation,
}: {
    conversations: Conversation[];
    onSelectConversation: (conversation: Conversation) => void;
}) {
    return (
        <div className="border-r border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Past Conversations</h2>
            </div>
            <ScrollArea className="h-full">
                {conversations.map((conversation) => (
                    <button
                        key={conversation.id}
                        onClick={() => onSelectConversation(conversation)}
                        className="w-full p-4 text-left hover:bg-gray-100 border-b border-gray-200"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">
                                {conversation.title}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {conversation.date}
                        </span>
                    </button>
                ))}
            </ScrollArea>
        </div>
    );
}

export function ChatInterface({ isMobile = false }: { isMobile?: boolean }) {
    const [chatState, setChatState] = useState<{
        messages: Message[];
        isHistoryOpen: boolean;
        isExpanded: boolean;
        isChatOpen: boolean;
        currentConversation: Conversation | null;
    }>({
        messages: [],
        isHistoryOpen: false,
        isExpanded: false,
        isChatOpen: false,
        currentConversation: null,
    });

    const [input, setInput] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            isChatOpen: true,
        }));
        setInput("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...chatState.messages, userMessage],
                }),
            });

            const data = await response.json();
            setChatState((prev) => ({
                ...prev,
                messages: [
                    ...prev.messages,
                    { role: "assistant", content: data.text },
                ],
            }));
        } catch (error) {
            console.error("Error:", error);
            setChatState((prev) => ({
                ...prev,
                messages: [
                    ...prev.messages,
                    {
                        role: "assistant",
                        content:
                            "Sorry, there was an error processing your request.",
                    },
                ],
            }));
        }
    };

    const handleSelectConversation = (conversation: Conversation) => {
        setChatState((prev) => ({
            ...prev,
            messages: conversation.messages,
            currentConversation: conversation,
            isHistoryOpen: false,
            isChatOpen: true,
        }));
    };

    return (
        <div className={`flex ${!isMobile && "h-full"} relative`}>
            {!isMobile && chatState.isHistoryOpen && (
                <ChatHistory
                    conversations={pastConversations}
                    onSelectConversation={handleSelectConversation}
                />
            )}
            <div
                className={`flex flex-col ${!isMobile && "flex-1"} rounded-md ${
                    isMobile &&
                    `absolute bottom-2 w-11/12 left-1/2 -translate-x-1/2 shadow-lg shadow-blue-500/50 border-2 border-slate-300  ${
                        chatState.isExpanded ? "h-[80dvh]" : ""
                    }`
                } shadow-lg bg-white`}
            >
                {chatState.isChatOpen && (
                    <div
                        className={`flex ${chatState.isHistoryOpen ? "justify-end" : "justify-between"} p-2 border-b`}
                    >
                        {!chatState.isHistoryOpen && (
                            <button
                                onClick={() =>
                                    setChatState((prev) => ({
                                        ...prev,
                                        isExpanded: !prev.isExpanded,
                                    }))
                                }
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <Maximize2 className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={() =>
                                setChatState((prev) => ({
                                    ...prev,
                                    isChatOpen: false,
                                    isExpanded: false,
                                    isHistoryOpen: false,
                                }))
                            }
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                )}

                {chatState.isChatOpen && chatState.isHistoryOpen && (
                    <div className="overflow-scroll">
                        <ChatHistory
                            conversations={pastConversations}
                            onSelectConversation={handleSelectConversation}
                        />
                    </div>
                )}
                {chatState.isChatOpen && !chatState.isHistoryOpen && (
                    <MessageList
                        messages={chatState.messages}
                        isMobile={isMobile}
                        isExpanded={chatState.isExpanded}
                    />
                )}

                <form
                    onSubmit={handleSubmit}
                    className="border-t border-gray-200 p-4"
                >
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                                setChatState((prev) => ({
                                    ...prev,
                                    isHistoryOpen: !prev.isHistoryOpen,
                                    isChatOpen: true,
                                    isExpanded: true,
                                }))
                            }
                        >
                            <Clock className="h-5 w-5" />
                        </Button>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about this book..."
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" variant="ghost">
                            <SendHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
