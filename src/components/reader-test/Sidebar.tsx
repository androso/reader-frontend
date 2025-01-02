import React, { useEffect, useState } from "react";
import { type EpubContent } from "@/types/EpubReader";

interface SidebarProps {
	epubContent: EpubContent;
	isOpen: boolean;
	onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ epubContent, isOpen, onClose }) => {
	const [chapterTitles, setChapterTitles] = useState<Record<string, string>>(
		{}
	);
	const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

	useEffect(() => {
		const titles: Record<string, string> = {};
		if (epubContent.toc.length > 0) {
			epubContent.toc.forEach((entry) => {
				if (entry.id) {
					titles[entry.id] = entry.title;
				}
			});
		} else {
			epubContent.spine.forEach((id) => {
				const item = epubContent.manifest[id];
				if (item) {
					titles[id] =
						item.href
							.split("/")
							.pop()
							?.replace(/\.x?html$/, "") || `Chapter ${id}`;
				}
			});
		}
		setChapterTitles(titles);
	}, [epubContent]);

	const hasChildren = (currentIndex: number) => {
		const currentEntry = epubContent.toc[currentIndex];
		// Look ahead for any entries that belong to this entry
		for (let i = currentIndex + 1; i < epubContent.toc.length; i++) {
			const nextEntry = epubContent.toc[i];
			// Stop if we hit another entry at the same or higher level
			if (nextEntry.level <= currentEntry.level) {
				break;
			}
			// Found a child entry
			return true;
		}
		return false;
	};

	const handleToggle = (index: number) => {
		const newExpandedItems = new Set(expandedItems);
		if (expandedItems.has(index.toString())) {
			newExpandedItems.delete(index.toString());
		} else {
			newExpandedItems.add(index.toString());
		}
		setExpandedItems(newExpandedItems);
	};

	const renderTocItem = (entry: (typeof epubContent.toc)[0], index: number) => {
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
		if (entry.title == "The Beginning of Infinity") {
			// console.log({ entry });
		}

		return (
			<div key={`${entry.id}-${index}`}>
				<div
					className={`toc-item level-${entry.level}`}
					style={{
						paddingLeft: `${entry.level * 1.5}rem`,
						display: "flex",
						alignItems: "center",
						cursor: hasChildrenItems ? "pointer" : "default",
					}}
				>
					{hasChildrenItems && (
						<button
							onClick={() => handleToggle(index)}
							style={{
								background: "none",
								border: "none",
								padding: "4px",
								cursor: "pointer",
								marginRight: "4px",
							}}
						>
							{isExpanded ? "▼" : "▶"}
						</button>
					)}
					<a
						href={`#${entry.href}`}
						onClick={onClose}
						style={{
							textDecoration: "none",
							color: entry.isPage ? "#666" : "inherit",
							fontSize: entry.isPage ? "0.9em" : "inherit",
							flex: 1,
						}}
					>
						{entry.title}
					</a>
				</div>
			</div>
		);
	};

	return (
		<div className={`sidebar ${isOpen ? "open" : ""}`}>
			<div className="sidebar-header">
				<h2>Contents</h2>
				<button onClick={onClose} className="close-button">
					×
				</button>
			</div>
			<div className="sidebar-content">
				<h3>{epubContent.metadata.title}</h3>
				<p className="author">{epubContent.metadata.creator}</p>
				<nav className="toc">
					{epubContent.toc.map((entry, index) => {
						return renderTocItem(entry, index);
					})}
				</nav>
			</div>
		</div>
	);
};

export default Sidebar;
