
import React, { useEffect, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useEpubProcessor } from "@/hooks/useEpubProcessor";
import { Chapter, useChapterLoader } from "./useChapterLoader";

interface EpubReaderProps {
	url: string;
}

const ChapterContent = memo(
	({ chapter, index }: { chapter: Chapter; index: number }) => (
		<div
			id={`${chapter.hrefId}`}
			key={chapter.id}
			className={`${index > 0 ? "mt-8" : ""} [&>img]:max-w-full [&>img]:h-auto [&>img]:mx-auto [&>img]:my-4 [&>img]:block [&>h1]:text-gray-700 [&>h2]:text-gray-700 [&>h3]:text-gray-700 [&>h1]:mt-8 [&>h2]:mt-8 [&>h3]:mt-8 [&>h1]:mb-4 [&>h2]:mb-4 [&>h3]:mb-4 [&>p]:mb-6 [&>p]:text-gray-600`}
			dangerouslySetInnerHTML={{ __html: chapter.element.innerHTML }}
		/>
	)
);

const EpubReader: React.FC<EpubReaderProps> = memo(({ url }) => {
	const { processEpub, isLoading, error, epubContent, zipData } = useEpubProcessor();
	const contentRef = useRef<HTMLDivElement>(null);
	const { chapters, loadAllChapters } = useChapterLoader(epubContent, zipData);
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
			<div className="absolute top-0 left-0 right-0 p-4 bg-transparent z-10">
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
			<div className="h-full overflow-y-auto pt-16 px-6">
				<div className="max-w-3xl mx-auto py-6" ref={contentRef}>
					{chapters?.map((chapter, index) => (
						<ChapterContent key={chapter.id} chapter={chapter} index={index} />
					))}
				</div>
			</div>
		</>
	);
});

export default EpubReader;
