"use client";

import React from "react";
import { motion } from "framer-motion";

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(150).fill(1);
  const cols = new Array(100).fill(1);

  const colors = [
    "rgb(125 211 252)",   // sky-300
    "rgb(249 168 212)",   // pink-300
    "rgb(134 239 172)",   // green-300
    "rgb(253 224 71)",    // yellow-300
    "rgb(252 165 165)",   // red-300
    "rgb(216 180 254)",   // purple-300
    "rgb(147 197 253)",   // blue-300
    "rgb(165 180 252)",   // indigo-300
    "rgb(196 181 253)",   // violet-300
  ];

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      style={{
        transform: `translate(-50%, -50%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
        width: "200vw",
        height: "200vh",
      }}
      className={`flex absolute top-1/2 left-1/2 ${className}`}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row-${i}`}
          className="relative w-16 h-8 border-l border-slate-700/30"
        >
          {cols.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
              whileTap={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
              key={`col-${j}`}
              className="relative w-16 h-8 border-r border-t border-slate-700/30"
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export default function BackgroundBoxes({ className }: { className?: string }) {
  return (
    <div
      className={`fixed inset-0 z-0 overflow-hidden pointer-events-none ${className}`}
    >
      <div className="absolute inset-0 pointer-events-auto overflow-hidden">
        <BoxesCore />
      </div>
    </div>
  );
}
