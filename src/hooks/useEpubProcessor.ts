import { useState, useCallback, useEffect } from "react";
import { processEpubFile } from "@/lib/epubProcessing";
import { type EpubContent } from "@/types/EpubReader";
import JSZip from "jszip";
import ePub, { Rendition } from "epubjs";
import Section from "epubjs/types/section";

export const useEpubProcessor = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [epubContent, setEpubContent] = useState<EpubContent | null>(null);
    const [zipData, setZipData] = useState<JSZip | null>(null);

    const processEpub = useCallback(async (url: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem("token");
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch EPUB: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const [content, zip] = await processEpubFile(arrayBuffer);

            setZipData(zip);
            setEpubContent(content);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error occurred";
            setError("Failed to process EPUB file: " + errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        processEpub,
        isLoading,
        error,
        epubContent,
        zipData,
    };
};

export const useEpubJsProcessor = (url: string) => {
    const [bookChapters, setBookChapters] = useState<any[]>([]);
    const [chaptersLoading, setChaptersLoading] = useState(false);
    const [status, setStatus] = useState<
        "loading" | "error" | "idle" | "success"
    >("idle");

    const processEpubJs = async (bookUrl: string) => {
        setStatus("loading");
        const token = localStorage.getItem("token");
        setChaptersLoading(true);
        let book = ePub(bookUrl, {
            requestHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
        await book.loaded.navigation;
        book = await book.opened;
        let spineItems: Section[] = [];
        book.spine.each((spineItem: Section) => spineItems.push(spineItem));
        const chapters = [];
        for (const item of spineItems) {
            const document = await book.load(item.href);
            chapters.push({
                id: item.href,
                content: document.body.innerHTML,
            });
        }
        setBookChapters(chapters);
        setStatus("success");
    };

    useEffect(() => {
        if (!url) return;
        processEpubJs(url);
    }, [url]);

    return {
        epubJsContent: {},
        processEpubJs,
        bookChapters,
        chaptersLoading,
        status,
    };
};
