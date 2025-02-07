import { TextBlock } from "@/types/EpubReader";
import React, { useCallback, useEffect, useRef, useState } from "react";

export const useTextBlockNavigation = (
    flatTextBlocks: TextBlock[],
    contentRef: React.RefObject<HTMLDivElement | null>
) => {
    const [activeTextBlockId, setActiveTextBlockId] = useState<string | null>(
        null
    );
    // manual scroll == navigation using arrow up and down
    const [isManualScroll, setIsManualScroll] = useState(false);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    const fetchProgress = async (bookId: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/${bookId}/progress`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Parse the progressPosition string back to an object
            const progress = JSON.parse(data.progressPosition);

            // Return the block ID
            return progress.progress_block; // This will return something like "c01-block-16"
        } catch (error) {
            console.error("An error ocurred while progress was fetched", error);
            return null;
        }
    };

    //save progress
    const saveProgress = async (textBlockId: string) => {
        const bookId = window.location.pathname.split("/")[2];
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/${bookId}/progress`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ progress_block: textBlockId }),
                }
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Progress cant be saved", error);
        }
    };

    useEffect(() => {
        if (!activeTextBlockId && flatTextBlocks.length > 0) {
            const bookId = window.location.pathname.split("/")[2];
            const initializeProgress = async () => {
                const storedId = await fetchProgress(bookId);
                setActiveTextBlockId(storedId || flatTextBlocks[0].id);
                const element = document.getElementById(
                    storedId || flatTextBlocks[0].id
                );
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            };
            //this retrieves the progress from the server
            initializeProgress();
        }
    }, [flatTextBlocks]);

    const getVisibilityRatio = useCallback((element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const $parentElement = contentRef.current?.parentElement;
        const parentRect = $parentElement?.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // adjust coordinates of element relative to parent
        const relativeTop = elementRect.top - parentRect!.top;
        const relativeBottom = elementRect.bottom - parentRect!.top;
        const windowHeight = $parentElement!.clientHeight;

        // If element is not in viewport at all
        if (relativeBottom < 0 || relativeTop > windowHeight) {
            return 0;
        }
        if (
            (relativeTop >= 0 && relativeBottom > windowHeight) ||
            (relativeBottom < windowHeight && relativeTop <= 0)
        ) {
            return 0;
        }

        // Calculate the visible height of the element
        const visibleHeight =
            Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const ratio = visibleHeight / rect.height;
        return Math.max(0, Math.min(1, ratio));
    }, []);

    const findMostVisibleBlock = useCallback(() => {
        if (!flatTextBlocks) return null;
        let maxVisibility = 0;
        let mostVisibleId = null;

        for (const block of flatTextBlocks) {
            const element = document.getElementById(block.id);
            if (element) {
                const visibility = getVisibilityRatio(element);
                if (visibility > maxVisibility) {
                    maxVisibility = visibility;
                    mostVisibleId = block.id;
                }
            }
        }

        return mostVisibleId;
    }, [flatTextBlocks, getVisibilityRatio]);

    const handleScroll = useCallback(() => {
        if (!isManualScroll) {
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }

            scrollTimeout.current = setTimeout(() => {
                const mostVisibleId = findMostVisibleBlock();
                if (mostVisibleId && mostVisibleId !== activeTextBlockId) {
                    setActiveTextBlockId(mostVisibleId);
                    saveProgress(mostVisibleId);
                }
            }, 1000);
        }
    }, [activeTextBlockId, isManualScroll]);

    // scroll listener
    useEffect(() => {
        const $container = contentRef.current?.parentElement;
        if (!$container) return;
        $container.addEventListener("scroll", handleScroll);

        return () => {
            $container.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, [handleScroll]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key == "ArrowDown" || e.key == "ArrowUp") {
                e.preventDefault();
                setIsManualScroll(true);

                const currTextBlockIndex = flatTextBlocks.findIndex(
                    (block) => block.id === activeTextBlockId
                );

                const newIndex =
                    e.key === "ArrowDown"
                        ? Math.min(
                              currTextBlockIndex + 1,
                              flatTextBlocks.length
                          )
                        : Math.max(currTextBlockIndex - 1, 0);

                if (newIndex !== currTextBlockIndex) {
                    const targetBlock = flatTextBlocks[newIndex];
                    setActiveTextBlockId(targetBlock.id);
                    saveProgress(targetBlock.id);
                    // scroll
                    // we could replace document with the container ref
                    document.getElementById(targetBlock.id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }

                // we enable scroll after the animation of the keydown is done
                setTimeout(() => {
                    setIsManualScroll(false);
                }, 1000);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [flatTextBlocks, activeTextBlockId]);

    return {
        activeTextBlockId,
    };
};
