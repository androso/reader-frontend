import React, { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { useEpubProcessor } from "@/hooks/useEpubProcessor";
import { useImageLoader } from "@/hooks/useImageLoader";
import { useChapterLoader } from "./useChapterLoader";
// import { useChapterLoader } from "../hooks/useChapterLoader";

interface EpubReaderProps {
	url: string;
}

const EpubReader: React.FC<EpubReaderProps> = ({ url }) => {
	const { processEpub, isLoading, error, epubContent, zipData } =
		useEpubProcessor();
	const contentRef = useRef<HTMLDivElement>(null);
	// const { loadImage } = useImageLoader(zipData, epubContent?.basePath || "");

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
		<div className="reader-container">
			<button
				className="burger-menu"
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
					<div
						id={`${chapter.hrefId}`}
						key={chapter.id}
						className={`chapter ${index > 0 ? "mt-8" : ""}`}
						dangerouslySetInnerHTML={{ __html: chapter.element.innerHTML }}
					/>
				))}
			</div>
		</div>
	);
};

export default EpubReader;
