"use client";

import { BookViewer } from "@/components/BookViewer";
import { useParams } from "next/navigation";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function Reader() {
	const params = useParams();
	const bookId = params.id as string | null;
	const { width } = useWindowSize();

	if (width < 1080) {
		return (
			<div className="h-screen w-screen bg-[#d7d7d7] flex items-center justify-center p-4">
				<div className="max-w-md text-center bg-white p-6 rounded-lg shadow-lg">
					<h2 className="text-xl font-semibold mb-4">
						Screen Size Not Supported
					</h2>
					<p className="text-gray-600">
						Please use a device with a larger screen (minimum 1080px width) or
						download our mobile app for the best reading experience.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen w-screen bg-red bg-[#d7d7d7] flex items-center justify-center">
			<div className="h-[93%] w-[93vw] flex justify-center items-center ">
				<div className="w-[48%] h-full rounded-lg bg-[#353B58] mr-5">text</div>
				<BookViewer bookId={bookId ?? ""} />
			</div>
		</div>
	);
}
