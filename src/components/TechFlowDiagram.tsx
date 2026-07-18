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
    { id: "react", name: "React", icon: "RE", color: "#60a5fa", iconBg: "bg-blue-950/30" },
    { id: "typescript", name: "TypeScript", icon: "TS", color: "#3b82f6", iconBg: "bg-blue-950/50" },
    { id: "tailwind", name: "Tailwind CSS", icon: "TW", color: "#38bdf8", iconBg: "bg-sky-950/30" },
    { id: "libsiter", name: "Libsiter", icon: "LB", color: "#94a3b8", iconBg: "bg-slate-900/50" },
    { id: "github", name: "GitHub", icon: "GH", color: "#ffffff", iconBg: "bg-neutral-800/40" },
  ];

  const rightNodes: CreatorNode[] = [
    {
      id: "creator1",
      name: "Dan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
      logo: "RE",
      logoBg: "bg-blue-950/80",
    },
    {
      id: "creator2",
      name: "Alex",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
      logo: "VC",
      logoBg: "bg-neutral-900/80",
    },
    {
      id: "creator3",
      name: "Sarah",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
      logo: "SB",
      logoBg: "bg-slate-900/80",
    },
    {
      id: "creator4",
      name: "Marcus",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
      logo: "SB",
      logoBg: "bg-slate-900/80",
    },
    {
      id: "creator5",
      name: "Elena",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
      logo: "VC",
      logoBg: "bg-neutral-900/80",
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
    <div id="tech-flow-container" className="relative flex items-center justify-between w-full h-[380px] bg-neutral-950/20 rounded-3xl p-4 overflow-hidden border border-neutral-900/50">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_60%)] pointer-events-none" />

      {/* Left side: Tech nodes */}
      <div className="flex flex-col justify-between h-full z-10 w-[130px]">
        {leftNodes.map((node, idx) => (
          <motion.div
            key={node.id}
            id={`tech-node-${node.id}`}
            className="flex items-center gap-2.5 px-3 py-2 bg-neutral-900/80 border border-neutral-800/80 hover:border-blue-600 rounded-xl cursor-pointer transition-all duration-300 shadow group w-full"
            onMouseEnter={() => setHoveredLine(idx)}
            onMouseLeave={() => setHoveredLine(null)}
            whileHover={{ x: 4, scale: 1.02 }}
          >
            <div className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg text-[10px] font-bold ${node.iconBg} border border-neutral-800 group-hover:scale-105 transition-transform font-mono`}>
              <span style={{ color: node.color }}>{node.icon}</span>
            </div>
            <span className="text-[11px] font-semibold text-neutral-300 group-hover:text-white">
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
                <stop offset="50%" stopColor="#3b82f6" stopOpacity={hoveredLine === idx ? 0.9 : 0.2} />
                <stop offset="100%" stopColor={node.color} stopOpacity={hoveredLine === idx ? 0.9 : 0.4} />
              </linearGradient>
            ))}
            {/* Drop shadows for glowing path */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="strong-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
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
                  strokeWidth={isHovered ? 5 : 1.5}
                  strokeOpacity={isHovered ? 0.25 : 0.05}
                  filter={isHovered ? "url(#strong-glow)" : "none"}
                  className="transition-all duration-300"
                />

                {/* Primary connection path */}
                <path
                  id={`flow-path-${path.id}`}
                  d={path.d}
                  stroke={`url(#grad-${path.id})`}
                  strokeWidth={isHovered ? 2 : 1.5}
                  filter={isHovered ? "url(#glow)" : "none"}
                  className="transition-all duration-300"
                />

                {/* Flow particles traveling along paths */}
                <circle r={isHovered ? 3 : 2} fill={nodeColor} filter="url(#glow)">
                  <animateMotion
                    dur={isHovered ? "1.8s" : "3.5s"}
                    repeatCount="indefinite"
                    path={path.d}
                    keyPoints="0;1"
                    keyTimes="0;1"
                  />
                </circle>

                {/* Delayed second particle for richer flow animation */}
                <circle r={isHovered ? 2 : 1.5} fill="#ffffff" fillOpacity="0.7">
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
            whileHover={{ scale: 1.05 }}
          >
            {/* Pulsating back-ring when parent tech path is hovered */}
            <AnimatePresence>
              {hoveredLine === idx && (
                <motion.div
                  className="absolute -inset-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 blur-sm"
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
                className="w-11 h-11 rounded-full border-2 border-neutral-800 group-hover:border-blue-600 transition-colors object-cover shadow-sm"
              />

              {/* Connected project/tech emblem tag overlay */}
              <div className={`absolute -right-1 -bottom-1 w-5.5 h-5.5 flex items-center justify-center rounded-full text-[9px] text-neutral-300 border border-neutral-800 ${node.logoBg} shadow-sm backdrop-blur-sm font-bold font-mono`}>
                {node.logo}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
