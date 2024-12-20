import { TooltipPosition } from "@/types/tooltipTypes";

export default function TextSelectionTooltip({
    position,
    children,
    extClassNames = "",
}: {
    position: TooltipPosition;
    children: React.ReactNode;
    extClassNames?: string;
}) {
    return (
        <div
            className={`absolute bg-gray-800 text-white px-4 py-2 rounded shadow-lg transform -translate-x-1/2 ${extClassNames} z-50`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            {children}
        </div>
    );
}
