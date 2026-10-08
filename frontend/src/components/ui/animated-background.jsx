import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 1000,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const AnimatedShape = ({ type, size, duration, delay, windowSize }) => {
  const keyframes = useMemo(() => {
    const steps = 8;
    const x = Array.from({ length: steps }, () => Math.random() * windowSize.width - size / 2);
    const y = Array.from({ length: steps }, () => Math.random() * windowSize.height - size / 2);
    
    // OPACIDAD AUMENTADA: Alterna entre 0 (invisible) y picos altos (0.5 a 0.9)
    const opacity = Array.from({ length: steps }, (_, i) => (i % 2 === 0 ? 0 : Math.random() * 0.8 + 0.9));
    const scale = Array.from({ length: steps }, () => Math.random() * 0.5 + 0.7);

    return { x, y, opacity, scale };
  }, [windowSize, size]);

  const getBorderRadius = () => {
    switch (type) {
      case 'circle': return '50%';
      case 'ellipse': return '50% / 60%';
      case 'blob': return '30% 70% 70% 30% / 30% 30% 70% 70%';
      case 'triangle': return '0%'; 
      default: return '10%'; 
    }
  };

  return (
    <motion.div
      className={`absolute flex items-center justify-center ${
        type !== 'triangle' ? 'bg-gray-400 border border-gray-500' : ''
      }`}
      style={{
        width: size,
        height: size,
        borderRadius: getBorderRadius(),
      }}
      initial={{ x: keyframes.x[0], y: keyframes.y[0], opacity: 0 }}
      animate={{
        x: keyframes.x,
        y: keyframes.y,
        opacity: keyframes.opacity,
        scale: keyframes.scale,
        rotate: [0, 180, 360, 180, 0], 
      }}
      transition={{
        duration: duration, // Aplica los nuevos tiempos prolongados
        repeat: Infinity,
        ease: "easeInOut", 
        delay: delay,
      }}
    >
      {type === 'triangle' && (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,10 90,90 10,90"
            /* Colores ajustados con opacidad alta en el SVG */
            fill="rgba(156, 163, 175, 0.85)" 
            stroke="rgba(107, 114, 128, 1)"
            strokeWidth="2"
          />
        </svg>
      )}
    </motion.div>
  );
};

export default function AnimatedBackground() {
  const windowSize = useWindowSize();

  // TIEMPOS AUMENTADOS: Tiempos de más de 2 minutos para un movimiento muy pausado
  const shapes = [
    { type: 'circle', size: 150, duration: 200, delay: 0 },
    { type: 'square', size: 120, duration: 250, delay: 2 },
    { type: 'ellipse', size: 200, duration: 300, delay: 5 },
    { type: 'blob', size: 280, duration: 190, delay: 1 },
    { type: 'triangle', size: 160, duration: 300, delay: 3 },
    { type: 'blob', size: 180, duration: 200, delay: 6 },
    { type: 'square', size: 100, duration: 300, delay: 4 },
    { type: 'ellipse', size: 320, duration: 200, delay: 7 },
    { type: 'triangle', size: 130, duration: 267, delay: 2 },
    { type: 'circle', size: 220, duration: 279, delay: 8 },
  ];

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden bg-black z-0">
      {shapes.map((shape, index) => (
        <AnimatedShape
          key={`shape-${index}`}
          type={shape.type}
          size={shape.size}
          duration={shape.duration}
          delay={shape.delay}
          windowSize={windowSize}
        />
      ))}
    </div>
  );
}