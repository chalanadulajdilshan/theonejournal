import React, { useState, useEffect, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [particles, setParticles] = useState([]);

  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only enable on devices with mice (fine pointer capability)
    const isMobile = !window.matchMedia('(pointer: fine)').matches;
    if (isMobile) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);

      // Check if hovering over clickable/interactive elements
      const target = e.target;
      const isClickable = target && (
        target.closest('a') || 
        target.closest('button') || 
        target.closest('select') || 
        target.closest('input') || 
        target.closest('textarea') || 
        target.closest('[role="button"]') ||
        target.closest('.ticker-item') ||
        target.closest('.article-card') ||
        target.closest('.btn-action-edit') ||
        target.closest('.btn-action-delete') ||
        target.closest('.featured-column')
      );
      setHovered(!!isClickable);

      // Creative sparkles spawn logic
      const distance = Math.hypot(e.clientX - lastPos.current.x, e.clientY - lastPos.current.y);
      if (distance > 15) {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 8 + 6,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.3, // slightly upwards drift
          life: 1.0,
        };
        setParticles(prev => [...prev.slice(-25), newParticle]);
        lastPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseLeave = () => {
      setHidden(true);
    };

    const handleMouseEnter = () => {
      setHidden(false);
    };

    const handleMouseDown = () => {
      setClicked(true);
    };

    const handleMouseUp = () => {
      setClicked(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Add custom cursor class to body
    document.body.classList.add('custom-cursor-active');

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  // Update loop for drifting particles
  useEffect(() => {
    const isMobile = !window.matchMedia('(pointer: fine)').matches;
    if (isMobile) return;

    let animFrame;
    const update = () => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.025,
          }))
          .filter(p => p.life > 0)
      );
      animFrame = requestAnimationFrame(update);
    };
    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  if (hidden) return null;

  return (
    <>
      {/* Sparkles Particle Trail */}
      {particles.map(p => (
        <div
          key={p.id}
          className="cursor-particle"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.life,
            transform: `translate(-50%, -50%) scale(${p.life}) rotate(${p.life * 360}deg)`,
          }}
        />
      ))}

      {/* Inner Dot */}
      <div 
        className={`cursor-dot ${clicked ? 'cursor-clicked' : ''} ${hovered ? 'cursor-hovered' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
      {/* Outer Ring */}
      <div 
        className={`cursor-ring ${clicked ? 'cursor-clicked' : ''} ${hovered ? 'cursor-hovered' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
    </>
  );
}
