import React, { useState, memo } from "react";
import { type EpubContent } from "@/types/EpubReader";

interface SidebarProps {
	epubContent: EpubContent;
	isOpen: boolean;
	onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(
	({ epubContent, isOpen, onClose }) => {
		const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

		const hasChildren = (currentIndex: number) => {
			const currentEntry = epubContent.toc[currentIndex];
			return epubContent.toc.some(
				(entry, i) =>
					i > currentIndex &&
					entry.level > currentEntry.level &&
					!epubContent.toc
						.slice(currentIndex + 1, i)
						.some((e) => e.level <= currentEntry.level)
			);
		};

		const handleToggle = (index: number) => {
			setExpandedItems((prev) => {
				const next = new Set(prev);
				if (next.has(index.toString())) {
					next.delete(index.toString());
				} else {
					next.add(index.toString());
				}
				return next;
			});
		};

		const renderTocItem = (
			entry: (typeof epubContent.toc)[0],
			index: number
		) => {
			if (!entry) return null;

			const isExpanded = expandedItems.has(index.toString());
			const hasChildrenItems = hasChildren(index);
			const isVisible =
				entry.level === 0 ||
				epubContent.toc
					.slice(0, index)
					.some(
						(prev, i) =>
							prev.level < entry.level &&
							expandedItems.has(i.toString()) &&
							!epubContent.toc
								.slice(i + 1, index)
								.some((item) => item.level <= prev.level)
					);

			if (!isVisible) return null;

			return (
				<div key={`${entry.id}-${index}`} className="">
					<div
						className={`toc-item level-${entry.level} flex items-center cursor-pointer`}
						style={{
							paddingLeft: `${entry.level * 1.5}rem`,
						}}
					>
						{hasChildrenItems && (
							<button
								onClick={() => handleToggle(index)}
								className="bg-none border-none p-1 cursor-pointer mr-1"
							>
								{isExpanded ? "▼" : "▶"}
							</button>
						)}
						<a
							href={`#${entry.href}`}
							onClick={onClose}
							className={`text-decoration-none flex-1 ${entry.isPage ? "text-gray-600 text-sm" : ""}`}
						>
							{entry.title}
						</a>
					</div>
				</div>
			);
		};

		return (
			<aside className={`sticky top-0 left-0 w-72 bg-white shadow-lg z-50 transition-transform max-h-full overflow-y-scroll ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
				<div className="flex justify-between items-center p-4 border-b border-gray-200 h-16">
					<h2 className="text-lg font-semibold">Contents</h2>
					<button onClick={onClose} className="bg-none border-none text-2xl cursor-pointer p-2">
						×
					</button>
				</div>
				<div className="p-4 h-[calc(100%-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
					<h3 className="text-xl font-semibold">{epubContent.metadata.title}</h3>
					<p className="text-gray-600 italic mt-2 mb-6">{epubContent.metadata.creator}</p>
					<nav className="flex flex-col gap-3 pb-8">
						{epubContent.toc.map((entry, index) => renderTocItem(entry, index))}
					</nav>
				</div>
			</aside>
		);
	}
);

export default Sidebar;
