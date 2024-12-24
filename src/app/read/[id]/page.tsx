"use client";

import { BookViewer } from "@/components/BookViewer";
import { ReactReader } from "@/components/reader/ReactReader/ReactReader";
import TextSelectionTooltip from "@/components/ui/TextSelectionTooltip";
import { useToast } from "@/hooks/use-toast";
import useSelectionTooltip from "@/hooks/useSelectionTooltip";
import { Rendition } from "epubjs";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

export default function Reader() {
	const params = useParams();
	const bookId = params.id as string | null;

	return (
		<div className="h-screen w-screen bg-red bg-[#d7d7d7] flex items-center justify-center">
			<div className="h-[93%] w-[93vw] flex justify-center items-center ">
				<div className="w-[48%] h-full rounded-lg bg-[#353B58] mr-5">text</div>
				<BookViewer bookId={bookId ?? ""} />
			</div>
		</div>
	);
}
