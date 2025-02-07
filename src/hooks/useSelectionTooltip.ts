import { MousePosition, TooltipPosition } from "@/types/tooltipTypes";
import { useRef, useState } from "react";

export const getSelectionInfo = (): { text: string; range: Range | null } => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0)
        return { text: "", range: null };

    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();

    return { text, range };
};

export const calculateDistance = (
    start: MousePosition,
    end: MousePosition
): number => {
    return Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
};

interface UseSelectionTooltipOptions {
    minDragDistance?: number;
    tooltipOffset?: number;
}

export default function useSelectionTooltip({
    minDragDistance = 5,
    tooltipOffset = 40,
}: UseSelectionTooltipOptions) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
        x: 0,
        y: 0,
    });
    const mouseStartPositionRef = useRef<null | MousePosition>(null);
    const handleMouseDown = (e: MouseEvent) => {
        // register the initial position and avoid creating a tooltip right away
        mouseStartPositionRef.current = { x: e.clientX, y: e.clientY };
        setShowTooltip(false);
    };

    const handleSelection = (e: MouseEvent) => {
        if (!mouseStartPositionRef.current) return;
        const distance = calculateDistance(mouseStartPositionRef.current, {
            x: e.clientX,
            y: e.clientY,
        });
        const isDrag = distance > minDragDistance;
        if (!isDrag) {
            setShowTooltip(false);
            mouseStartPositionRef.current = null;
            return;
        }

        const { text, range } = getSelectionInfo();
        if (!range || !text) {
            setShowTooltip(false);
            mouseStartPositionRef.current = null;
            return;
        }

        const rect = range.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom + 5,
        });

        setShowTooltip(true);
        mouseStartPositionRef.current = null;
    };

    return {
        showTooltip,
        tooltipPosition,
        hideTooltip: () => setShowTooltip(false),
        handleMouseDown,
        handleSelection,
    };
}
