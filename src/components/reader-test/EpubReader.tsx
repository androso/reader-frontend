import React, { useEffect, useRef, memo } from "react";
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
			className={`bg-white p-8 shadow-sm leading-[1.8] ${index > 0 ? "mt-8" : ""} [&>img]:max-w-full [&>img]:h-auto [&>img]:mx-auto [&>img]:my-4 [&>img]:block [&>h1]:text-gray-700 [&>h2]:text-gray-700 [&>h3]:text-gray-700 [&>h1]:mt-8 [&>h2]:mt-8 [&>h3]:mt-8 [&>h1]:mb-4 [&>h2]:mb-4 [&>h3]:mb-4 [&>p]:mb-6 [&>p]:text-gray-600`}
			dangerouslySetInnerHTML={{ __html: chapter.element.innerHTML }}
		/>
	)
);

const EpubReader: React.FC<EpubReaderProps> = memo(({ url }) => {
	const { processEpub, isLoading, error, epubContent, zipData } =
		useEpubProcessor();
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
		<div className="relative max-w-3xl mx-auto px-4 bg-[#fff] overflow-hidden">
			 <button
				className="sticky top-4 left-4 p-2 bg-white border-none rounded cursor-pointer z-40 shadow-md"
				onClick={() => setIsSidebarOpen(!isSidebarOpen)}
			>
				☰
			</button>
			<Sidebar
				epubContent={epubContent}
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/> 
			<div ref={contentRef} className="prose prose-lg mx-auto reader-content">
				{chapters?.map((chapter, index) => (
					<ChapterContent key={chapter.id} chapter={chapter} index={index} />
				))}
			</div>
		</div>
	);
});

export default EpubReader;
