import React, { useEffect, useRef, memo, useState } from "react";
import { Menu, MessageCircle, Bookmark, Share2, X } from "lucide-react";
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
        const [isLocked, setIsLocked] = React.useState(false);
        const dragThreshold = 80;

        const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
            const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
            setStartX(clientX);
            if (!isLocked) {
                setIsDragging(true);
            }
        };

        const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
            if (!isDragging || isLocked) return;
            const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
            const deltaX = clientX - startX;
            setOffset(Math.min(Math.max(0, deltaX), 100));
        };

        const handleDragEnd = () => {
            setIsDragging(false);
            if (offset > dragThreshold) {
                setOffset(100);
                setIsLocked(true);
            } else {
                setOffset(0);
            }
        };

        const handleUnlock = () => {
            setIsLocked(false);
            setOffset(0);
        };

        const handleParagraphClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (isLocked) {
                handleUnlock();
            }
        };

        const renderActionIcons = () => {
            if (!isLocked && offset === 0) return null;
            const opacity = Math.min((offset / dragThreshold) * 1.2, 1);
            const scale = 0.6 + opacity * 0.4;

            return (
                <div className="absolute left-0 top-0 h-full flex flex-col items-center justify-center gap-2 pl-4">
                    <button
                        className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-all transform"
                        style={{ opacity, transform: `scale(${scale})` }}
                    >
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                    </button>
                    <button
                        className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-all transform"
                        style={{ opacity, transform: `scale(${scale})` }}
                    >
                        <Bookmark className="h-5 w-5 text-blue-600" />
                    </button>
                    <button
                        className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-all transform"
                        style={{ opacity, transform: `scale(${scale})` }}
                    >
                        <Share2 className="h-5 w-5 text-blue-600" />
                    </button>
                </div>
            );
        };

        return (
            <div
                id={id}
                className={`transition-all transform select-none cursor-grab active:cursor-grabbing relative  `}
            >
                <div
                    className="absolute inset-0 z-10"
                    onMouseDown={handleDragStart}
                    onTouchStart={(e) => {
                        const touch = e.touches[0];
                        setStartX(touch.clientX);
                    }}
                    onMouseMove={handleDragMove}
                    onTouchMove={(e) => {
                        if (
                            !isDragging &&
                            Math.abs(e.touches[0].clientX - startX) > 10
                        ) {
                            setIsDragging(true);
                            e.preventDefault();
                        }
                        if (isDragging) {
                            e.preventDefault();
                            handleDragMove(e);
                        }
                    }}
                    onMouseUp={handleDragEnd}
                    onTouchEnd={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    style={{
                        touchAction: isDragging ? "none" : "pan-y",
                    }}
                />
                <div className="relative">
                    {renderActionIcons()}
                    <div
                        className={`mb-4 p-4 relative z-10 ${
                            isActive
                                ? "border-l-4 border-blue-500 bg-blue-50"
                                : "border-l-4 border-transparent"
                        } ${isDragging || isLocked ? "shadow-lg" : "shadow-sm"} ${
                            isLocked ? "cursor-pointer" : ""
                        }`}
                        onClick={handleParagraphClick}
                        style={{
                            transform: `translateX(${offset}px)`,
                            transition: !isDragging
                                ? "transform 0.2s ease-out"
                                : "none",
                            userSelect: "none",
                            pointerEvents: isLocked ? "auto" : "none",
                        }}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
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
        onNextChapter,
        isLastChapter,
    }: {
        chapter: any;
        activeTextblockId: string | null;
        onNextChapter: () => void;
        isLastChapter: boolean;
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
            {!isLastChapter && (
                <div className="flex justify-center py-8">
                    <button
                        onClick={onNextChapter}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 transition-colors"
                        aria-label="Next Chapter"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M7 13l5 5 5-5" />
                            <path d="M7 6l5 5 5-5" />
                        </svg>
                    </button>
                </div>
            )}
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
    const [activeHref, setActiveHref] = React.useState<string | null>(null);
    // const { isVisible, tooltipPosition, tooltipRef } = useTextSelection();
    const { activeTextBlockId, isLoading: textBlockIsLoading } =
        useTextBlockNavigation(flatTextBlocks, contentRef);

    const handleTocItemClick = (hrefId: string) => {
        setActiveHref(hrefId);
    };

    useEffect(() => {
        processEpub(url);
    }, [url, processEpub]);

    useEffect(() => {
        if (epubContent && zipData) {
            loadAllChapters();
        }
    }, [epubContent, zipData, loadAllChapters]);

    // Set initial activeHref based on activeTextBlockId
    useEffect(() => {
        if (!textBlockIsLoading && activeTextBlockId && chapters.length > 0) {
            const chapterId = activeTextBlockId.split("-")[0];
            const chapter = chapters.find((c) => c.hrefId.includes(chapterId));
            if (chapter && !activeHref) {
                setActiveHref(chapter.hrefId);
                // Give time for the chapter to render before scrolling
                setTimeout(() => {
                    const element = document.getElementById(activeTextBlockId);
                    if (element) {
                        element.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }
                }, 100);
            }
        }
    }, [textBlockIsLoading, activeTextBlockId, chapters]);

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
                onTocItemClick={handleTocItemClick}
                activeHref={activeHref}
            />

            <div className="h-full relative overflow-x-hidden">
                <div className="sticky top-0 left-0 right-0 p-4 bg-white z-50 h-[8%]">
                    <button
                        className="bg-transparent border-none cursor-pointer z-40 hover:bg-gray-100 transition-colors duration-200 rounded"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
                <div className="max-w-3xl mx-auto px-6 max-h-[92%] overflow-y-auto overflow-x-hidden">
                    <div className="pb-32" ref={contentRef}>
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
                        {isLoading || textBlockIsLoading ? (
                            <LoadingSpinner />
                        ) : (
                            chapters.map((chapter) => {
                                if (
                                    !activeHref ||
                                    chapter.hrefId === activeHref
                                ) {
                                    const currentChapterIndex =
                                        chapters.findIndex(
                                            (c) => c.hrefId === activeHref
                                        );
                                    const handleNextChapter = () => {
                                        const nextChapter =
                                            chapters[currentChapterIndex + 1];
                                        if (nextChapter) {
                                            setActiveHref(nextChapter.hrefId);
                                            contentRef.current?.parentElement?.scrollTo(
                                                {
                                                    top: 0,
                                                    behavior: "smooth",
                                                }
                                            );
                                        }
                                    };

                                    return (
                                        <Chapter
                                            key={chapter.id}
                                            chapter={chapter}
                                            activeTextblockId={
                                                activeTextBlockId
                                            }
                                            onNextChapter={handleNextChapter}
                                            isLastChapter={
                                                currentChapterIndex ===
                                                chapters.length - 1
                                            }
                                        />
                                    );
                                }
                                return null;
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
});

EpubReader.displayName = "EpubReader";

export default EpubReader;
