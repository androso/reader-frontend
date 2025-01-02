"use client";

import { useParams } from "next/navigation";
import EpubReader from "@/components/reader-test/EpubReader";

export default function Reader() {
	const params = useParams();
	const bookId = params.id as string | null;

	return (
		<div className=" w-screen bg-red bg-[] flex items-center justify-center">
			<EpubReader url={`/api/books/${bookId}`} />
		</div>
	);
}
