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
	),
);

const EpubReader: React.FC<EpubReaderProps> = memo(({ url }) => {
	const { processEpub, isLoading, error, epubContent, zipData } =
		useEpubProcessor();
	const contentRef = useRef<HTMLDivElement>(null);
	const { chapters, loadAllChapters } = useChapterLoader(
		epubContent,
		zipData,
	);
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
	const bookId = url.split("/").pop()!;
	// const progress = useReadingProgress(contentRef, bookId);
	const [activeTextblockId, setActiveTextblockId] = React.useState<
		string | null
	>(null);
	useEffect(() => {
		console.log({ chapters });
	}, [chapters]);

	useEffect(() => {
		processEpub(url);
	}, [url, processEpub]);

	useEffect(() => {
		if (epubContent && zipData) {
			loadAllChapters();
		}
	}, [epubContent, zipData, loadAllChapters]);

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				// get id of the next textblock and update state
				
			} else if (e.key == "ArrowUp") {
				e.preventDefault();
				// get id of the previous textblock and update state
			}
		}
	}, [])

	
	if (isLoading) {
		return (
			<div className="loading-spinner">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent"></div>
				<div className="mt-4 text-lg text-gray-600">
					Loading book...
				</div>
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
					{/* {chapters?.map((chapter, index) => (
						<ChapterContent key={chapter.id} chapter={chapter} index={index} />
					))} */}
					{chapters?.map((chapter) => {
						return (
							<div key={chapter.id} id={chapter.hrefId}>
								{chapter.textBlocks.map((textBlock) => {
									return (
										<div
											key={textBlock.id}
											id={textBlock.id}
											className={`mb-4 mb-4 p-4 transition-all ${
												activeTextblockId ===
												textBlock.id
													? "border-l-4 border-blue-500 bg-blue-50"
													: "border-l-4 border-transparent"
											}`}
											dangerouslySetInnerHTML={{
												__html: textBlock.content,
											}}
										/>
									);
								})}
							</div>
						);
					})}
					{/*
						<Chapter>
							<TextBlock />
						</Chapter>
					*/}
				</div>
			</div>
		</>
	);
});

export default EpubReader;
