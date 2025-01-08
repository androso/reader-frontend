import { useState, useCallback } from "react";
import JSZip from "jszip";
import { type EpubContent } from "@/types/EpubReader";
import { useImageLoader } from "@/hooks/useImageLoader";
import { resolveRelativePath } from "@/lib/utils";

export interface Chapter {
	id: string;
	content: string;
	element: HTMLElement;
	hrefId: string;
}

export const useChapterLoader = (
	epubContent: EpubContent | null,
	zipData: JSZip | null
) => {
	const { loadImage } = useImageLoader(zipData, epubContent?.basePath ?? "");
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadCssContent = useCallback(
		async (href: string, currentPath?: string): Promise<string | null> => {
			if (!epubContent || !zipData) return null;
			try {
				const paths = [
					href,
					resolveRelativePath(href, epubContent.basePath),
					currentPath ? resolveRelativePath(href, currentPath) : null,
					`${epubContent.basePath}styles/${href}`,
					`${epubContent.basePath}Styles/${href}`,
					`${epubContent.basePath}css/${href}`,
				].filter(Boolean);

				for (const path of paths) {
					const cssFile = zipData.file(path);
					if (cssFile) {
						const content = await cssFile.async("text");
						return content.replace(
							/@import\s+['"]([^'"]+)['"]/g,
							async (_, importPath) => {
								const importedCss = await loadCssContent(importPath, path);
								return importedCss || "";
							}
						);
					}
				}
			} catch (err) {
				console.warn("Error loading CSS:", href);
			}
			return null;
		},
		[epubContent, zipData]
	);

	const processHtml = useCallback(
		async (html: string, baseUrl: string): Promise<HTMLElement> => {
			if (!epubContent) throw new Error("No EPUB content available");
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, "text/html");

			const stylePromises = Array.from(
				doc.querySelectorAll('link[rel="stylesheet"]')
			).map(async (stylesheet) => {
				const href = stylesheet.getAttribute("href");
				if (href) {
					const cssContent = await loadCssContent(href);
					if (cssContent) {
						const style = doc.createElement("style");
						style.textContent = cssContent;
						stylesheet.replaceWith(style);
					}
				}
			});

			await Promise.all(stylePromises);

			const imagePromises = Array.from(doc.querySelectorAll("img")).map(
				async (img) => {
					const src = img.getAttribute("src");
					if (src && !src.startsWith("blob:") && !src.startsWith("data:")) {
						try {
							const resolvedPath = resolveRelativePath(
								src,
								epubContent.basePath
							);
							img.setAttribute("data-original-src", resolvedPath);
							const dataUrl = await loadImage(resolvedPath);
							img.src = dataUrl;
						} catch (error) {
							img.src =
								'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="%23eee" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/%3E%3C/svg%3E';
							img.alt = "Failed to load image";
						}
					}
				}
			);

			await Promise.all(imagePromises);
			doc.querySelectorAll("script").forEach((script) => script.remove());
			

            Array.from(doc.body.children).forEach((child) => {
				// here i can add identifiers to each text element that i could then use to register the progress of a user on a book
                child.classList.add("just-id");
            });
			return doc.body;
		},
		[epubContent, loadImage, loadCssContent]
	);

	const loadChapter = useCallback(
		async (id: string): Promise<Chapter | null> => {
			if (!epubContent || !zipData) return null;
			try {
				const manifestItem = epubContent.manifest[id];
				if (!manifestItem) {
					throw new Error(`Manifest item not found for id: ${id}`);
				}

				const fullPath = `${epubContent.basePath}${manifestItem.href}`;
				const file = zipData.file(fullPath);

				if (!file) {
					throw new Error(`File not found in EPUB: ${fullPath}`);
				}

				const content = await file.async("text");
				const baseUrl = `${window.location.origin}/${epubContent.basePath}`;
				const element = await processHtml(content, baseUrl);

				const newHref = manifestItem.href.includes(".")
					? manifestItem.href.substring(0, manifestItem.href.lastIndexOf("."))
					: manifestItem.href;

				return { id, content, element, hrefId: newHref };
			} catch (err) {
				console.warn(`Failed to load chapter ${id}:`, err);
				return null;
			}
		},
		[epubContent, zipData, processHtml]
	);

	const loadAllChapters = useCallback(async () => {
		if (!epubContent) {
			setError("No EPUB content available");
			return;
		}

		if (!chapters.length) {
			setIsLoading(true);
			try {
				const chapterPromises = epubContent.spine.map((id) => loadChapter(id));
				const loadedChapters = await Promise.all(chapterPromises);
				const validChapters = loadedChapters.filter(
					(ch): ch is Chapter => ch !== null
				);
				setChapters(validChapters);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load chapters"
				);
			} finally {
				setIsLoading(false);
			}
		}
	}, [epubContent, loadChapter, chapters.length]);

	return {
		chapters,
		isLoading,
		error,
		loadAllChapters,
	};
};
