"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Maximize2, History } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import MessageList, { Message } from "./MessageList";
import ChatHistory, { Conversation } from "./ChatHistory";

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
        const userMessage = { role: "user", content: input };
        setInput("");

        try {
            const token = localStorage.getItem("token");
            const endpoint = chatState.currentConversation
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/book/${bookId}/conversations/${chatState.currentConversation.id}/messages`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/book/${bookId}/conversations`;

            // setChatState((prev) => ({
            //     ...prev,
            //     messages: [...prev.messages, userMessage],
            //     isChatOpen: true,
            // }));

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
                currentConversation: {
                    ...(chatState.currentConversation as any),
                    messages: [...prev.messages, assistantMessage],
                },
            }));

            let conversationId: string | null = null;
            const textDecoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Append new chunk to buffer and split into lines
                buffer += textDecoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || ""; // Keep last partial line in buffer

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // Check if this is a data line
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6).trim();

                        // Handle the [DONE] message
                        if (data === "[DONE]") {
                            continue;
                        }

                        try {
                            const jsonData = JSON.parse(data);

                            // Handle conversation ID
                            if (jsonData.type === "conversation_id") {
                                conversationId = jsonData.conversationId;
                                setChatState((prev) => {
                                    console.log({ prev });
                                    return {
                                        ...prev,
                                        currentConversation: {
                                            id: conversationId as string,
                                            title: "new",
                                            date: new Date()
                                                .toISOString()
                                                .split("T")[0],
                                            messages: prev.messages.slice(),
                                        },
                                    };
                                });
                            }
                            //     setChatState((prev) => ({
                            //         ...prev,
                            //         currentConversation: {
                            //             id: conversationId!,
                            //             title: "New Conversation",
                            //             date: new Date().toISOString().split("T")[0],
                            //             messages: prev.messages,
                            //         },
                            //     }));
                            //     continue;
                            // }

                            // Handle content updates
                            if (jsonData.content !== undefined) {
                                console.log(
                                    "chat state should be updating here",
                                    jsonData.content
                                );
                                setChatState((prev) => {
                                    const lastMessage =
                                        prev.messages[prev.messages.length - 1];

                                    if (lastMessage.role === "assistant") {
                                        const updatedMessages = [
                                            ...prev.messages.slice(),
                                            {
                                                ...lastMessage,
                                                content:
                                                    lastMessage.content +
                                                    jsonData.content,
                                            },
                                        ];
                                        return {
                                            ...prev,
                                            messages: updatedMessages,
                                            currentConversation: {
                                                ...(prev.currentConversation as any),
                                                messages: updatedMessages,
                                            },
                                        };
                                    }
                                    return prev;
                                });
                            }
                        } catch (e) {
                            console.error(
                                "Failed to parse SSE data:",
                                e,
                                "Data:",
                                data
                            );
                        }
                    }
                }
            }

            // After the stream is complete, refresh the conversations list
            await refetchConversations();
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

    useEffect(() => {
        console.log({ chatState });
    }, [chatState]);

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
                                setChatState({
                                    messages: [],
                                    isHistoryOpen: false,
                                    isExpanded: false,
                                    isChatOpen: false,
                                    currentConversation: null,
                                })
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
                    onSubmit={(e) => {
                        e.preventDefault();
                        const userMessage = { role: "user", content: input };
                        setChatState((prev) => ({
                            ...prev,
                            messages: [...prev.messages, userMessage],
                            isChatOpen: true,
                        }));
                        handleSubmit(e);
                    }}
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
