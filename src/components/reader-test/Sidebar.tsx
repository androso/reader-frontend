import React, { useEffect, useState, memo } from "react";
// import { EpubContent } from "./EpubUploader";
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
								className="toggle-button"
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

		//   if (!isOpen) return null;

		return (
			<aside className={`sidebar ${isOpen ? "open" : ""}`}>
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
						{epubContent.toc.map((entry, index) => renderTocItem(entry, index))}
					</nav>
				</div>
			</aside>
		);
	}
);

export default Sidebar;
