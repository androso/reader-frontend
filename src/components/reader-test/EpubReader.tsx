import React, { useEffect, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useEpubProcessor } from "@/hooks/useEpubProcessor";
import { Chapter, useChapterLoader } from "./useChapterLoader";
import { useReadingProgress } from "@/hooks/useReadingProgress";

interface EpubReaderProps {
	url: string;
}

const ChapterContent = memo(
	({ chapter, index }: { chapter: Chapter; index: number }) => (
		<div
			id={`${chapter.hrefId}`}
			key={chapter.id}
			dangerouslySetInnerHTML={{ __html: chapter.element.innerHTML }}
		/>
	)
);

const EpubReader: React.FC<EpubReaderProps> = memo(({ url }) => {
	const { processEpub, isLoading, error, epubContent, zipData } = useEpubProcessor();
	const contentRef = useRef<HTMLDivElement>(null);
	const { chapters, loadAllChapters } = useChapterLoader(epubContent, zipData);
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
	const bookId = url.split("/").pop()!;
	const progress = useReadingProgress(contentRef, bookId);

	// useEffect(() => {
	// 	console.log({progress})
	// }, [progress])
	
	useEffect(() => {
		processEpub(url);
	}, [url, processEpub]);

	useEffect(() => {
		if (epubContent && zipData) {
			loadAllChapters();
		}
	}, [epubContent, zipData, loadAllChapters]);

	if (isLoading) {
		return (
			<div className="loading-spinner">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent"></div>
				<div className="mt-4 text-lg text-gray-600">Loading book...</div>
			</div>
		);
	}

	if (error) {
		return <div className="p-4 text-red-600">{error}</div>;
	}

	if (!epubContent || !zipData) {
		return null;
	}

	return (
		<>
			{/* Header with burger menu */}
			<div className="absolute top-0 left-0 right-0 p-4 bg-white z-10">
				<button
					className="p-1 bg-transparent border-none cursor-pointer z-40 hover:bg-gray-100 transition-colors duration-200 rounded"
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
				>
					<Menu className="h-6 w-6" />
				</button>
			</div>

			<Sidebar
				epubContent={epubContent}
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>

			{/* Main content area */}
			<div className="h-full overflow-y-auto ">
				<div className="max-w-3xl mx-auto pt-20 px-6 	" ref={contentRef}>
					{chapters?.map((chapter, index) => (
						<ChapterContent key={chapter.id} chapter={chapter} index={index} />
					))}
				</div>
			</div>
		</>
	);
});

export default EpubReader;
