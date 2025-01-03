
"use client";

import { useParams } from "next/navigation";
import EpubReader from "@/components/reader-test/EpubReader";
import { useWindowSize } from "@/hooks/useWindowSize";
import { ChatInterface } from "@/components/reader/ChatInterface";

export default function Reader() {
	const params = useParams();
	const bookId = params.id as string | null;

	return (
		<div className="min-h-screen bg-[#D7D7D7] p-8">
			<div className="w-full rounded-lg relative flex justify-center">
				<div className="w-[48%] bg-[#FCFCFC] mr-4 rounded-lg">
					<ChatInterface />
				</div>
				<div className="h-[789px] w-[48%] relative overflow-hidden bg-[#FCFCFC] rounded-lg">
					<EpubReader url={`/api/books/${bookId}`} />
				</div>
			</div>
		</div>
	);
}
