"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils.js"; // Asegúrate de tener esta utilidad, si no, usa una cadena normal

export const BackgroundBeams = ({ className }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-none overflow-hidden",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
      >
        <svg
          viewBox="0 0 1000 1000"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Aquí definimos el color dorado y la animación lenta */}
          <motion.path
            d="M0 0 L1000 1000"
            stroke="#C5A03A"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M1000 0 L0 1000"
            stroke="#C5A03A"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 15 }}
          />
        </svg>
      </motion.div>
    </div>
  );
};
