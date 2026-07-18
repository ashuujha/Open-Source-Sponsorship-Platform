import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface TechNode {
  id: string;
  name: string;
  icon: string;
  color: string;
  iconBg: string;
}

interface CreatorNode {
  id: string;
  name: string;
  avatar: string;
  logo: string;
  logoBg: string;
}

export default function TechFlowDiagram() {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const leftNodes: TechNode[] = [
    { id: "react", name: "React", icon: "⚛️", color: "#38bdf8", iconBg: "bg-sky-500/10" },
    { id: "typescript", name: "TypeScript", icon: "TS", color: "#3178c6", iconBg: "bg-blue-600/10" },
    { id: "tailwind", name: "Tailwind CSS", icon: "🍃", color: "#0ea5e9", iconBg: "bg-teal-500/10" },
    { id: "libsiter", name: "Libsiter", icon: "🔥", color: "#f97316", iconBg: "bg-orange-500/10" },
    { id: "github", name: "GitHub", icon: "🐙", color: "#ffffff", iconBg: "bg-neutral-800/20" },
  ];

  const rightNodes: CreatorNode[] = [
    {
      id: "creator1",
      name: "Dan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
      logo: "⚛️",
      logoBg: "bg-purple-600/25",
    },
    {
      id: "creator2",
      name: "Alex",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
      logo: "▲",
      logoBg: "bg-black",
    },
    {
      id: "creator3",
      name: "Sarah",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
      logo: "⚡",
      logoBg: "bg-emerald-600/25",
    },
    {
      id: "creator4",
      name: "Marcus",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
      logo: "⚡",
      logoBg: "bg-green-600/25",
    },
    {
      id: "creator5",
      name: "Elena",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
      logo: "▲",
      logoBg: "bg-orange-600/25",
    },
  ];

  // Bezier paths that bundle slightly in the center to match the visual architecture
  const paths = [
    { id: 0, d: "M 130,52 C 240,42 210,56 360,62" },
    { id: 1, d: "M 130,118 C 240,118 210,122 360,128" },
    { id: 2, d: "M 130,184 C 230,184 220,188 360,194" },
    { id: 3, d: "M 130,250 C 230,250 220,254 360,260" },
    { id: 4, d: "M 130,316 C 240,326 210,318 360,326" },
  ];

  return (
    <div id="tech-flow-container" className="relative flex items-center justify-between w-full h-[380px] bg-neutral-950/20 rounded-3xl p-4 overflow-hidden border border-neutral-900/40">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] pointer-events-none" />

      {/* Left side: Tech nodes */}
      <div className="flex flex-col justify-between h-full z-10 w-[130px]">
        {leftNodes.map((node, idx) => (
          <motion.div
            key={node.id}
            id={`tech-node-${node.id}`}
            className="flex items-center gap-2.5 px-3 py-2 bg-neutral-900/80 border border-neutral-800/70 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all duration-300 shadow-lg shadow-black/40 group w-full"
            onMouseEnter={() => setHoveredLine(idx)}
            onMouseLeave={() => setHoveredLine(null)}
            whileHover={{ x: 4, scale: 1.02 }}
          >
            <div className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold ${node.iconBg} border border-neutral-700/30 group-hover:scale-110 transition-transform`}>
              <span style={{ color: node.color }}>{node.icon}</span>
            </div>
            <span className="text-xs font-medium text-neutral-300 group-hover:text-white font-sans">
              {node.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Middle: SVG Connections */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 500 380" fill="none" preserveAspectRatio="none">
          <defs>
            {/* Linear gradients for each connection path */}
            {leftNodes.map((node, idx) => (
              <linearGradient key={node.id} id={`grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={node.color} stopOpacity={hoveredLine === idx ? 0.9 : 0.4} />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity={hoveredLine === idx ? 0.9 : 0.25} />
                <stop offset="100%" stopColor={node.color} stopOpacity={hoveredLine === idx ? 0.9 : 0.4} />
              </linearGradient>
            ))}
            {/* Drop shadows for glowing path */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="strong-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render lines */}
          {paths.map((path) => {
            const isHovered = hoveredLine === path.id;
            const nodeColor = leftNodes[path.id].color;

            return (
              <g key={path.id}>
                {/* Underglow path */}
                <path
                  d={path.d}
                  stroke={nodeColor}
                  strokeWidth={isHovered ? 6 : 1.5}
                  strokeOpacity={isHovered ? 0.35 : 0.08}
                  filter={isHovered ? "url(#strong-glow)" : "none"}
                  className="transition-all duration-300"
                />

                {/* Primary connection path */}
                <path
                  id={`flow-path-${path.id}`}
                  d={path.d}
                  stroke={`url(#grad-${path.id})`}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  filter={isHovered ? "url(#glow)" : "none"}
                  className="transition-all duration-300"
                />

                {/* Flow particles traveling along paths */}
                <circle r={isHovered ? 3.5 : 2} fill={nodeColor} filter="url(#glow)">
                  <animateMotion
                    dur={isHovered ? "1.8s" : "3.5s"}
                    repeatCount="indefinite"
                    path={path.d}
                    keyPoints="0;1"
                    keyTimes="0;1"
                  />
                </circle>

                {/* Delayed second particle for richer flow animation */}
                <circle r={isHovered ? 2.5 : 1.5} fill="#ffffff" fillOpacity="0.8">
                  <animateMotion
                    dur={isHovered ? "1.8s" : "3.5s"}
                    begin="1s"
                    repeatCount="indefinite"
                    path={path.d}
                    keyPoints="0;1"
                    keyTimes="0;1"
                  />
                </circle>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right side: Creator/Maintainer nodes */}
      <div className="flex flex-col justify-between h-full z-10 w-[110px] items-end">
        {rightNodes.map((node, idx) => (
          <motion.div
            key={node.id}
            id={`creator-node-${node.id}`}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredLine(idx)}
            onMouseLeave={() => setHoveredLine(null)}
            whileHover={{ scale: 1.08 }}
          >
            {/* Pulsating back-ring when parent tech path is hovered */}
            <AnimatePresence>
              {hoveredLine === idx && (
                <motion.div
                  className="absolute -inset-1.5 rounded-full bg-blue-500/25 blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>

            <div className="relative flex items-center justify-center">
              {/* Maintainer Avatar Image */}
              <img
                src={node.avatar}
                alt={node.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full border-2 border-neutral-800 group-hover:border-blue-500/80 transition-colors object-cover shadow-md"
              />

              {/* Connected project/tech emblem tag overlay */}
              <div className={`absolute -right-1 -bottom-1 w-5 h-5 flex items-center justify-center rounded-full text-[10px] text-white border border-neutral-800 ${node.logoBg} shadow-sm backdrop-blur-sm font-bold`}>
                {node.logo}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
