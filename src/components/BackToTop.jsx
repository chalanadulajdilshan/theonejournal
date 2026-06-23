import React, { useEffect, useRef, useState } from 'react';

// Press-and-hold scroll buttons. The up button (top-right) and down
// button (bottom-right) scroll the page slowly in their direction for
// as long as the reader holds them down — release to stop. Speed is
// `speedPxPerSec` px/sec, frame-rate independent.
export default function BackToTop({ speedPxPerSec = 1100 }) {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const rafRef = useRef(null);
  const dirRef = useRef(0);          // -1 = up, +1 = down, 0 = idle
  const lastTsRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = (document.documentElement.scrollHeight || 0) - window.innerHeight;
      setAtTop(y < 4);
      setAtBottom(max > 0 && y >= max - 4);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tick = (now) => {
    if (!dirRef.current) return;
    const dt = lastTsRef.current ? (now - lastTsRef.current) / 1000 : 0;
    lastTsRef.current = now;
    const max = (document.documentElement.scrollHeight || 0) - window.innerHeight;
    const next = Math.min(
      Math.max(0, window.scrollY + dirRef.current * speedPxPerSec * dt),
      Math.max(0, max)
    );
    window.scrollTo(0, next);
    // Auto-stop at the edges.
    if ((dirRef.current < 0 && next === 0) || (dirRef.current > 0 && next === max)) {
      stop();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = (direction) => {
    if (dirRef.current === direction) return;
    dirRef.current = direction;
    lastTsRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    dirRef.current = 0;
    lastTsRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  // Wiring pointer events so it works for mouse, touch and pen. Also
  // stop scrolling if the cursor leaves the button or the window loses
  // focus, so the page doesn't keep moving after the user lets go.
  const holdHandlers = (direction) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      start(direction);
    },
    onPointerUp: stop,
    onPointerCancel: stop,
    onPointerLeave: stop,
    onBlur: stop,
  });

  return (
    <>
      <button
        type="button"
        aria-label="Hold to scroll up"
        title="Hold to scroll up"
        className={`scroll-fab scroll-fab--top${atTop ? '' : ' is-visible'}`}
        {...holdHandlers(-1)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Hold to scroll down"
        title="Hold to scroll down"
        className={`scroll-fab scroll-fab--bottom${atBottom ? '' : ' is-visible'}`}
        {...holdHandlers(1)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14" />
          <path d="M19 12l-7 7-7-7" />
        </svg>
      </button>
    </>
  );
}
