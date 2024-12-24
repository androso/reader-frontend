"use client";

import { BookViewer } from "@/components/BookViewer";
import { useParams } from "next/navigation";

export default function Reader() {
	const params = useParams();
	const bookId = params.id as string | null;
	return (
		<div className="h-screen w-screen flex flex-col">
			<BookViewer bookId={bookId ?? ""} />
		</div>
	);
}