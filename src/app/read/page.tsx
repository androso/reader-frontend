"use client";

import { BookViewer } from "@/components/BookViewer";
import { ChatInput } from "@/components/ChatInput";
import { useParams } from "next/navigation";

export default function Reader() {
	const params = useParams();
	const bookId = params.bookId as string | null;
	return (
		<div className="h-screen w-screen flex flex-col">
			<BookViewer bookId={bookId ?? ""} />
			<ChatInput />
		</div>
	);
}