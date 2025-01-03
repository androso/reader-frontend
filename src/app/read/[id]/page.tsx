
"use client";

import { useParams } from "next/navigation";
import EpubReader from "@/components/reader-test/EpubReader";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function Reader() {
	const params = useParams();
	const bookId = params.id as string | null;

	return (
		<div className="min-h-screen bg-red-200 flex items-center justify-center p-4">
			<div className="w-full max-w-4xl bg-white rounded-lg shadow-lg relative">
				<div className="h-[789px] relative overflow-hidden">
					<EpubReader url={`/api/books/${bookId}`} />
				</div>
			</div>
		</div>
	);
}
