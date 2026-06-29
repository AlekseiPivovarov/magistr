import React, { useEffect, useRef } from 'react';

const ParallaxBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    let rafId: number | null = null;
    let ticking = false;

    const updateScroll = () => {
      if (containerRef.current) {
        const items = containerRef.current.querySelectorAll<HTMLDivElement>('.pwa-item');
        
        items.forEach((el) => {
          const delay = parseFloat(el.dataset.delay || '0');
          const amplitude = parseFloat(el.dataset.amplitude || '0.5');
          const speed = parseFloat(el.dataset.speed || '0.05');
          const offset = scrollYRef.current * speed;
          
          el.style.transform = `translate(-50%, -50%) 
            translateY(${offset}px) 
            translateX(${Math.sin(scrollYRef.current * 0.0005 + delay) * amplitude}px)`;
        });
      }
      ticking = false;
    };

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
      
      if (!ticking) {
        rafId = requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      if (!ticking) {
        rafId = requestAnimationFrame(updateScroll);
        ticking = true;
      }
    });

    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Адаптивность
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024 && window.innerWidth >= 768;

  let gridCols, rowsPerLayer, opacityMultiplier, fontSizeMultiplier;

  if (isMobile) {
    gridCols = 3;
    rowsPerLayer = 5;
    opacityMultiplier = 0.6;
    fontSizeMultiplier = 0.7;
  } else if (isTablet) {
    gridCols = 4;
    rowsPerLayer = 6;
    opacityMultiplier = 0.8;
    fontSizeMultiplier = 0.85;
  } else {
    gridCols = 4;
    rowsPerLayer = 8;
    opacityMultiplier = 1;
    fontSizeMultiplier = 1;
  }

  // Цвета
  const bgStart = '#1a1a1a';
  const bgMiddle = '#2a2a2a';
  const bgEnd = '#1a1a1a';
  const textStart = '#666666';
  const textMiddle = '#888888';
  const textEnd = '#666666';

  const pwaGrid = [];

  // Слой 1 (задний) — скорость 0.05
  for (let row = -2; row < rowsPerLayer; row++) {
    for (let col = 0; col < gridCols; col++) {
      const cellWidth = 100 / gridCols;
      const cellHeight = 100 / (rowsPerLayer - 2);
      pwaGrid.push({
        id: `layer1-${row * gridCols + col}`,
        // ⭐ Ограничиваем left максимум 95%
        left: Math.min(col * cellWidth + cellWidth * 0.15 + Math.random() * cellWidth * 0.7, 95),
        top: row * cellHeight + cellHeight * 0.15 + Math.random() * cellHeight * 0.7,
        fontSize: (25 + Math.random() * 30) * fontSizeMultiplier,
        opacity: (0.04 + Math.random() * 0.03) * opacityMultiplier,
        delay: Math.random() * 20,
        rotation: (Math.random() - 0.5) * 3,
        amplitude: Math.random() * 0.5 + 0.2,
        speed: 0.05,
      });
    }
  }

  // Слой 2 (средний) — скорость 0.2
  for (let row = -2; row < rowsPerLayer; row++) {
    for (let col = 0; col < gridCols; col++) {
      const cellWidth = 100 / gridCols;
      const cellHeight = 100 / (rowsPerLayer - 2);
      pwaGrid.push({
        id: `layer2-${row * gridCols + col}`,
        left: Math.min(col * cellWidth + cellWidth * 0.25 + Math.random() * cellWidth * 0.5, 95),
        top: row * cellHeight + cellHeight * 0.25 + Math.random() * cellHeight * 0.5,
        fontSize: (30 + Math.random() * 35) * fontSizeMultiplier,
        opacity: (0.08 + Math.random() * 0.04) * opacityMultiplier,
        delay: Math.random() * 20,
        rotation: (Math.random() - 0.5) * 4,
        amplitude: Math.random() * 0.8 + 0.3,
        speed: 0.2,
      });
    }
  }

  // Слой 3 (передний) — скорость 0.5
  for (let row = -2; row < rowsPerLayer; row++) {
    for (let col = 0; col < gridCols; col++) {
      const cellWidth = 100 / gridCols;
      const cellHeight = 100 / (rowsPerLayer - 2);
      pwaGrid.push({
        id: `layer3-${row * gridCols + col}`,
        left: Math.min(col * cellWidth + cellWidth * 0.1 + Math.random() * cellWidth * 0.8, 95),
        top: row * cellHeight + cellHeight * 0.1 + Math.random() * cellHeight * 0.8,
        fontSize: (35 + Math.random() * 40) * fontSizeMultiplier,
        opacity: (0.12 + Math.random() * 0.06) * opacityMultiplier,
        delay: Math.random() * 20,
        rotation: (Math.random() - 0.5) * 5,
        amplitude: Math.random() * 1.0 + 0.4,
        speed: 0.5,
      });
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: `linear-gradient(135deg, ${bgStart} 0%, ${bgMiddle} 50%, ${bgEnd} 100%)`,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {pwaGrid.map((item) => (
        <div
          key={item.id}
          className="pwa-item"
          data-delay={item.delay}
          data-amplitude={item.amplitude}
          data-speed={item.speed}
          style={{
            position: 'absolute',
            left: `${item.left}%`,
            top: `${item.top}%`,
            fontSize: `${item.fontSize}px`,
            fontWeight: 900,
            fontFamily: 'Arial Black, sans-serif',
            opacity: item.opacity,
            transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
            background: `linear-gradient(135deg, ${textStart} 0%, ${textMiddle} 50%, ${textEnd} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            willChange: 'transform',
            pointerEvents: 'none',
          }}
        >
          PWA
        </div>
      ))}
    </div>
  );
};

export default ParallaxBackground;