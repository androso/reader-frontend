import ePub from "epubjs";

export function initReader(element: HTMLElement, bookId: string) {
  // In production this would fetch from an API
  const book = ePub("/sample.epub");
  
  const rendition = book.renderTo(element, {
    width: "100%",
    height: "100%",
    spread: "none"
  });

  rendition.display();

  // Add keyboard navigation
  const keyListener = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      rendition.prev();
    }
    if (e.key === "ArrowRight") {
      rendition.next();
    }
  };

  document.addEventListener("keyup", keyListener);

  return () => {
    document.removeEventListener("keyup", keyListener);
    book.destroy();
  };
}
