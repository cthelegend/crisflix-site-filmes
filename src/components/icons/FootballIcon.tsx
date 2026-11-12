import { createLucideIcon } from "lucide-react";

const FootballIcon = createLucideIcon("Football", [
  ["circle", { cx: "12", cy: "12", r: "10", strokeWidth: "1.5", key: "outline" }],
  ["path", { d: "M12 5.5v2M18.18 9.99l-1.9.62M15.82 17.26l-1.18-1.62M8.18 17.26l1.18-1.62M5.82 9.99l1.9.62", strokeWidth: "1", key: "seams" }],
  ["path", { d: "M12 7.5l4.28 3.11-1.63 5.03h-5.3l-1.63-5.03Z", fill: "currentColor", stroke: "none", key: "center" }],
  ...[0, 72, 144, 216, 288].map((rotation) => ["path", {
    d: "M8.91 2.49a10 10 0 0 1 6.18 0L14 5.5h-4Z",
    transform: `rotate(${rotation} 12 12)`, fill: "currentColor", stroke: "none", key: `panel-${rotation}`,
  }] as ["path", { d: string; transform: string; fill: string; stroke: string; key: string }]),
]);

export default FootballIcon;
