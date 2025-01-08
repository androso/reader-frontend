
"use client";

import { useParams } from "next/navigation";
import EpubReader from "@/components/reader-test/EpubReader";
import { useWindowSize } from "@/hooks/useWindowSize";
import { ChatInterface } from "@/components/reader/ChatInterface";

export default function Reader() {
	const params = useParams();
	const bookId = params.id as string | null;
	const { width } = useWindowSize();
	const isMobile = width < 768;
	
	return (
		<div className="h-screen bg-[#D7D7D7] ">
			<div className="h-screen w-full rounded-lg relative flex justify-center p-8">
				{!isMobile && (
					<div className="w-[48%] bg-[#FCFCFC] mr-4 rounded-lg">
						<ChatInterface />
					</div>
				)}
				<div className={`w-${isMobile ? '[100%]' : '[48%]'} relative overflow-hidden bg-[#FCFCFC] rounded-lg`}>
					<EpubReader url={`${process.env.NEXT_PUBLIC_API_URL}/api/books/${bookId}`} />
				</div>
			</div>
		</div>
	);
}
