import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HeatmapCell } from "../types";

interface HeatmapProps {
  projectName: string;
}

export default function Heatmap({ projectName }: HeatmapProps) {
  // Generate a list of 7 rows (days) by 24 columns (weeks) of data
  // We'll pre-populate with static values + some random variations for premium looks
  const generateHeatmapData = (): HeatmapCell[][] => {
    const rows: HeatmapCell[][] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const baseDate = new Date(2026, 0, 1);

    for (let r = 0; r < 7; r++) {
      const rowCells: HeatmapCell[] = [];
      for (let c = 0; c < 24; c++) {
        const cellDate = new Date(baseDate);
        cellDate.setDate(baseDate.getDate() + (c * 7 + r));

        // Create a nice distribution of colors: mostly green and blue as in the screenshot
        // 0: dark/empty, 1-2: blue tones, 3-4: green tones
        let intensity: 0 | 1 | 2 | 3 | 4 = 0;
        const rand = Math.random();
        if (rand > 0.85) intensity = 4; // Bright green
        else if (rand > 0.65) intensity = 3; // Medium green
        else if (rand > 0.45) intensity = 2; // Bright blue
        else if (rand > 0.25) intensity = 1; // Subdued blue
        else intensity = 0; // Dark grey/inactive

        const count = intensity === 0 ? 0 : Math.floor(intensity * 3 + Math.random() * 4);

        const dateString = cellDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        rowCells.push({
          date: dateString,
          count,
          intensity,
        });
      }
      rows.push(rowCells);
    };
    return rows;
  };

  const [grid] = useState<HeatmapCell[][]>(generateHeatmapData());
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const getIntensityClass = (intensity: 0 | 1 | 2 | 3 | 4) => {
    switch (intensity) {
      case 0:
        return "bg-neutral-900 border-neutral-950 hover:bg-neutral-800";
      case 1:
        return "bg-sky-950/80 border-sky-900/40 hover:bg-sky-900";
      case 2:
        return "bg-sky-600/70 border-sky-500/30 hover:bg-sky-500";
      case 3:
        return "bg-emerald-800 border-emerald-700/40 hover:bg-emerald-700";
      case 4:
        return "bg-emerald-500 border-emerald-400/30 hover:bg-emerald-400";
    }
  };

  const getRiskLevel = (intensity: number) => {
    if (intensity === 0) return { label: "No updates", color: "text-neutral-400" };
    if (intensity <= 2) return { label: "Stable / Normal Dependency Activity", color: "text-sky-400" };
    return { label: "High Frequency Maintenance / Excellent Health", color: "text-emerald-400" };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - container.left + 14,
      y: e.clientY - container.top - 55,
    });
  };

  return (
    <div id="heatmap-container" className="relative p-5 bg-neutral-950/40 border border-neutral-900 rounded-2xl w-full select-none" onMouseMove={handleMouseMove}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold text-neutral-400 tracking-wider uppercase font-sans">
          Project: <span className="text-neutral-100">{projectName}</span>
        </h4>
        <span className="text-[11px] font-medium text-sky-400/90 font-sans hover:underline cursor-help">
          Risk heatmap
        </span>
      </div>

      {/* Grid wrapper */}
      <div className="relative overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        <div className="flex flex-col gap-1 min-w-[340px]">
          {grid.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-1">
              {row.map((cell, cIdx) => (
                <div
                  key={cIdx}
                  className={`w-3.5 h-3.5 rounded-[2.5px] border ${getIntensityClass(
                    cell.intensity
                  )} transition-all duration-150 cursor-pointer flex-shrink-0`}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Subtitle labels */}
      <div className="flex items-center justify-between mt-3 text-[10px] text-neutral-500 font-mono">
        <span>Less updates</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-[1.5px] bg-neutral-900 border border-neutral-950" />
          <span className="w-2.5 h-2.5 rounded-[1.5px] bg-sky-950 border border-sky-900/40" />
          <span className="w-2.5 h-2.5 rounded-[1.5px] bg-sky-500 border border-sky-400/30" />
          <span className="w-2.5 h-2.5 rounded-[1.5px] bg-emerald-800 border border-emerald-700/40" />
          <span className="w-2.5 h-2.5 rounded-[1.5px] bg-emerald-500 border border-emerald-400/30" />
        </div>
        <span>More updates</span>
      </div>

      {/* Heatmap Tooltip overlay */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            className="absolute z-30 pointer-events-none bg-neutral-900/95 border border-neutral-800 p-2.5 rounded-lg shadow-xl backdrop-blur-sm w-48 text-left"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
          >
            <p className="text-[10px] font-bold text-neutral-400 font-mono">
              {hoveredCell.date}
            </p>
            <p className="text-xs font-semibold text-white mt-1">
              {hoveredCell.count} Dependency updates
            </p>
            <p className={`text-[9px] font-semibold mt-1.5 ${getRiskLevel(hoveredCell.intensity).color}`}>
              {getRiskLevel(hoveredCell.intensity).label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
