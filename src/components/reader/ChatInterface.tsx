"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    SendHorizontal,
    Maximize2,
    History,
    MessageSquareText,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memo, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
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
    const handleNewThread = () => {
        onSelectConversation({
            id: Date.now(),
            title: "New Conversation",
            date: new Date().toISOString().split("T")[0],
            messages: [],
        });
    };

    return (
        <div className="border-r border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <Button
                        onClick={handleNewThread}
                        size="sm"
                        variant="outline"
                    >
                        Start new thread
                    </Button>
                </div>
            </div>
            <ScrollArea className="h-full">
                {conversations.map((conversation) => (
                    <button
                        key={conversation.id}
                        onClick={() => onSelectConversation(conversation)}
                        className="w-full p-4 text-left hover:bg-gray-100 border-b border-gray-200"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <MessageSquareText className="h-4 w-4 text-gray-500" />
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

export function ChatInterface({
    isMobile = false,
    bookId,
}: {
    isMobile?: boolean;
    bookId: string;
}) {
    const { data: conversationsData, refetch: refetchConversations } = useQuery(
        {
            queryKey: [
                `${process.env.NEXT_PUBLIC_API_URL}/api/book/${bookId}/conversations`,
            ],
            queryFn: async () => {
                const token = localStorage.getItem("token");
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/book/${bookId}/conversations`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch conversations");
                }
                return response.json();
            },
            enabled: !!bookId,
        }
    );
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
            const token = localStorage.getItem("token");
            const endpoint = chatState.currentConversation
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/book/${bookId}/conversations/${chatState.currentConversation.id}/messages`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/book/${bookId}/conversations`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    role: "user",
                    messages: [...chatState.messages, userMessage],
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response stream");

            const assistantMessage = { role: "assistant", content: "" };
            setChatState((prev) => ({
                ...prev,
                messages: [...prev.messages, assistantMessage],
            }));

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                const lines = text.split("\n\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(5);
                        if (data === "[DONE]" || !data.trim()) continue;

                        try {
                            const { content } = JSON.parse(data);
                            setChatState((prev) => {
                                const lastMessage =
                                    prev.messages[prev.messages.length - 1];
                                if (lastMessage.role === "assistant") {
                                    return {
                                        ...prev,
                                        messages: [
                                            ...prev.messages.slice(0, -1),
                                            {
                                                ...lastMessage,
                                                content:
                                                    lastMessage.content +
                                                    content,
                                            },
                                        ],
                                    };
                                }
                                return prev;
                            });
                        } catch (e) {
                            if (!data.includes("[DONE]")) {
                                console.error("Failed to parse SSE data:", e);
                            }
                        }
                    }
                }
            }
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

    const { data: selectedConversationData, isLoading: isLoadingConversation } =
        useQuery({
            queryKey: [`conversation-${chatState?.currentConversation?.id}`],
            queryFn: async () => {
                if (!chatState.currentConversation) return null;
                const token = localStorage.getItem("token");
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/book/${bookId}/conversations/${chatState.currentConversation.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch conversation");
                }
                return response.json();
            },
            enabled: !!chatState.currentConversation,
        });

    const handleSelectConversation = (conversation: Conversation) => {
        setChatState((prev) => ({
            ...prev,
            currentConversation: conversation,
            isHistoryOpen: false,
            isChatOpen: true,
        }));
    };

    useEffect(() => {
        if (selectedConversationData) {
            setChatState((prev) => ({
                ...prev,
                messages: selectedConversationData.messages,
            }));
        }
    }, [selectedConversationData]);
    console.log({ conversationsData });
    return (
        <div className={`flex ${!isMobile && "h-full"} relative`}>
            {!isMobile && chatState.isHistoryOpen && (
                <div className="overflow-x-hidden max-w-[40%]">
                    <ChatHistory
                        conversations={conversationsData?.conversations}
                        onSelectConversation={handleSelectConversation}
                    />
                </div>
            )}
            <div
                className={`flex flex-col ${!isMobile && "flex-1 justify-end"} rounded-md ${
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

                {isMobile &&
                    chatState.isChatOpen &&
                    chatState.isHistoryOpen && (
                        <div className="overflow-scroll h-full">
                            <ChatHistory
                                conversations={conversationsData.conversations}
                                onSelectConversation={handleSelectConversation}
                            />
                        </div>
                    )}
                {chatState.isChatOpen && !chatState.isHistoryOpen && (
                    <>
                        {isLoadingConversation ? (
                            <div className="flex items-center justify-center h-full">
                                <motion.div
                                    className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                />
                            </div>
                        ) : (
                            <MessageList
                                messages={chatState.messages}
                                isMobile={isMobile}
                                isExpanded={chatState.isExpanded}
                            />
                        )}
                    </>
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
                            onClick={() => {
                                refetchConversations();
                                setChatState((prev) => ({
                                    ...prev,
                                    isHistoryOpen: !prev.isHistoryOpen,
                                    isChatOpen: true,
                                    isExpanded: true,
                                }));
                            }}
                        >
                            <History className="h-5 w-5" />
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
