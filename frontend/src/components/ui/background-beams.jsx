"use client";
import React from "react";
import { cn } from "../../lib/utils.js";

export const BackgroundBeams = React.memo(({ className }) => {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
    "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
    "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
    "M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835",
    "M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827",
    "M-331 -245C-331 -245 -263 160 201 287C665 414 733 819 733 819",
    "M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811",
    "M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803",
    "M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795",
    "M-303 -277C-303 -277 -235 128 229 255C693 382 761 787 761 787",
    "M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779",
  ];

  return (
    <div className={cn("absolute inset-0 flex h-full w-full items-center justify-center pointer-events-none overflow-hidden", className)}>
      <style jsx>{`
        @keyframes beam-flow {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: -1000; }
        }
        .beam-path {
          stroke-dasharray: 800;
          animation: beam-flow 25s linear infinite;
        }
      `}</style>
      
      <svg
        className="absolute z-0 h-full w-full opacity-60"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, index) => (
          <path
            key={index}
            d={path}
            className="beam-path"
            stroke="url(#goldGradient)"
            strokeWidth="1.5"
            style={{ animationDelay: `${index * 0.5}s` }}
          />
        ))}

        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C5A03A" stopOpacity="0" />
            <stop offset="30%" stopColor="#C5A03A" stopOpacity="1" />
            <stop offset="70%" stopColor="#E5C160" stopOpacity="1" />
            <stop offset="100%" stopColor="#856020" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
});

BackgroundBeams.displayName = "BackgroundBeams";
