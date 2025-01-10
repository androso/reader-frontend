import React, { useEffect, useRef, memo } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useEpubProcessor } from "@/hooks/useEpubProcessor";
import { useChapterLoader } from "./useChapterLoader";

interface EpubReaderProps {
	url: string;
}

// Memoized text block component
const TextBlock = memo(
	({
		id,
		content,
		isActive,
	}: {
		id: string;
		content: string;
		isActive: boolean;
	}) => (
		<div
			id={id}
			className={`mb-4 p-4 transition-all ${
				isActive
					? "border-l-4 border-blue-500 bg-blue-50"
					: "border-l-4 border-transparent"
			}`}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	),
);

TextBlock.displayName = "TextBlock";

// Memoized chapter component
const Chapter = memo(
	({
		chapter,
		activeTextblockId,
	}: {
		chapter: any;
		activeTextblockId: string | null;
	}) => (
		<div id={chapter.hrefId}>
			{chapter.textBlocks.map((textBlock: any) => (
				<TextBlock
					key={textBlock.id}
					id={textBlock.id}
					content={textBlock.content}
					isActive={activeTextblockId === textBlock.id}
				/>
			))}
		</div>
	),
);

Chapter.displayName = "Chapter";

const EpubReader: React.FC<EpubReaderProps> = memo(({ url }) => {
	const { processEpub, isLoading, error, epubContent, zipData } =
		useEpubProcessor();
	const contentRef = useRef<HTMLDivElement>(null);
	const { chapters, loadAllChapters, flatTextBlocks } = useChapterLoader(
		epubContent,
		zipData,
	);
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
	const [activeTextblockId, setActiveTextblockId] = React.useState<
		string | null
	>(null);

	useEffect(() => {
		if (!activeTextblockId && flatTextBlocks.length > 0) {
			setActiveTextblockId(flatTextBlocks[0].id);
		}
	}, [flatTextBlocks]);

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
		if (!flatTextBlocks) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				const currTextBlockIndex = flatTextBlocks.findIndex(
					(block) => block.id === activeTextblockId,
				);
				
				// if the next item is outside the limits of the flatTextBlocks we dont change it
				const newIndex =
					e.key === "ArrowDown"
						? Math.min(
								currTextBlockIndex + 1,
								flatTextBlocks.length - 1,
							)
						: Math.max(currTextBlockIndex - 1, 0);

				if (newIndex !== currTextBlockIndex) {
					const targetBlock = flatTextBlocks[newIndex];
					setActiveTextblockId(targetBlock.id);

					// Scroll the active block into view
					document.getElementById(targetBlock.id)?.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [flatTextBlocks, activeTextblockId]);

	if (isLoading) {
		return (
			<div className="loading-spinner">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent" />
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

			<div className="h-full overflow-y-auto">
				<div className="max-w-3xl mx-auto pt-20 px-6" ref={contentRef}>
					{chapters?.map((chapter) => (
						<Chapter
							key={chapter.id}
							chapter={chapter}
							activeTextblockId={activeTextblockId}
						/>
					))}
				</div>
			</div>
		</>
	);
});

EpubReader.displayName = "EpubReader";

export default EpubReader;
