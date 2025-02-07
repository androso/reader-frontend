import React, { useEffect, useRef, memo, useCallback, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useEpubProcessor } from "@/hooks/useEpubProcessor";
import { useChapterLoader } from "@/hooks/useChapterLoader";
import { useTextBlockNavigation } from "@/hooks/useTextBlockNavigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
    }) => {
        const [offset, setOffset] = React.useState(0);
        const [isDragging, setIsDragging] = React.useState(false);
        const [startX, setStartX] = React.useState(0);

        const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
            setIsDragging(true);
            const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
            setStartX(clientX);
            e.preventDefault();
        };

        const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
            if (!isDragging) return;
            const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
            const deltaX = clientX - startX;
            setOffset(Math.min(Math.max(0, deltaX), 100));
        };

        const handleDragEnd = () => {
            setIsDragging(false);
            setOffset(0);
        };

        return (
            <div
                id={id}
                className={`transition-all transform select-none cursor-grab active:cursor-grabbing relative  `}
            >
                <div
                    className="absolute inset-0 z-10"
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    onMouseMove={handleDragMove}
                    onTouchMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onTouchEnd={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    style={{
                        touchAction: "none",
                    }}
                />
                <div
                    className={` mb-4 p-4 ${
                        isActive
                            ? "border-l-4 border-blue-500 bg-blue-50"
                            : "border-l-4 border-transparent"
                    } ${isDragging ? "shadow-lg" : "shadow-sm"}`}
                    style={{
                        transform: `translateX(${offset}px)`,
                        transition: !isDragging
                            ? "transform 0.2s ease-out"
                            : "none",
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        );
    }
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
    )
);

Chapter.displayName = "Chapter";

const useTextSelection = (tooltipContent: string = "hello") => {
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const expandSelectionToWord = () => {
            const sel = window.getSelection();
            if (!sel?.rangeCount) return;

            const range = sel.getRangeAt(0);
            const start = range.startContainer;
            const end = range.endContainer;

            // Only expand if there's an actual selection (not just a click)
            if (range.startOffset === range.endOffset) return;

            // Only process text nodes
            if (
                start.nodeType === Node.TEXT_NODE &&
                end.nodeType === Node.TEXT_NODE
            ) {
                const startText = start.textContent || "";
                const endText = end.textContent || "";

                // Find word boundaries
                let startOffset = range.startOffset;
                while (
                    startOffset > 0 &&
                    /\S/.test(startText[startOffset - 1])
                ) {
                    startOffset--;
                }

                let endOffset = range.endOffset;
                while (
                    endOffset < endText.length &&
                    /\S/.test(endText[endOffset])
                ) {
                    endOffset++;
                }

                // Update the range
                range.setStart(start, startOffset);
                range.setEnd(end, endOffset);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        };

        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (selection?.toString().length) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Calculate position considering viewport bounds
                const viewportWidth = window.innerWidth;
                const tooltipWidth = tooltipRef.current?.offsetWidth || 0;
                const leftPosition = Math.min(
                    rect.right,
                    viewportWidth - tooltipWidth - 20
                );

                setTooltipPosition({
                    x: leftPosition,
                    y:
                        rect.top -
                        (tooltipRef.current?.offsetHeight || 0) -
                        10 +
                        window.scrollY,
                });
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        document.addEventListener("mouseup", expandSelectionToWord);
        document.addEventListener("selectionchange", handleSelectionChange);

        return () => {
            document.removeEventListener("mouseup", expandSelectionToWord);
            document.removeEventListener(
                "selectionchange",
                handleSelectionChange
            );
        };
    }, []);

    return { tooltipRef, tooltipPosition, isVisible };
};

const EpubReader: React.FC<EpubReaderProps> = memo(({ url }) => {
    const { processEpub, isLoading, error, epubContent, zipData } =
        useEpubProcessor();
    const contentRef = useRef<HTMLDivElement>(null);
    const { chapters, loadAllChapters, flatTextBlocks } = useChapterLoader(
        epubContent,
        zipData
    );
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    // const { isVisible, tooltipPosition, tooltipRef } = useTextSelection();
    const { activeTextBlockId } = useTextBlockNavigation(
        flatTextBlocks,
        contentRef
    );

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
            <Sidebar
                epubContent={epubContent}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="h-full  relative">
                <div className="sticky top-0 left-0 right-0 p-4 bg-white z-50 h-[8%]">
                    <button
                        className="bg-transparent border-none cursor-pointer z-40 hover:bg-gray-100 transition-colors duration-200 rounded"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
                <div className="max-w-3xl mx-auto  px-6 max-h-[92%] overflow-y-auto">
                    <div className="" ref={contentRef}>
                        {/* Tooltip */}
                        {/* <div
                            ref={tooltipRef}
                            className={`fixed bg-gray-800 text-white px-3 py-2 rounded shadow-lg transition-opacity duration-200 pointer-events-none ${
                                isVisible ? "opacity-100" : "opacity-0"
                            }`}
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y}px`,
                            }}
                        >
                            hello
                        </div> */}
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            chapters.map((chapter) => (
                                <Chapter
                                    key={chapter.id}
                                    chapter={chapter}
                                    activeTextblockId={activeTextBlockId}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
});

EpubReader.displayName = "EpubReader";

export default EpubReader;
