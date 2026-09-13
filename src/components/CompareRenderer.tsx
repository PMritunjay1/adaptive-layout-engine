import React, { useEffect, useRef, useState } from 'react';
import type { SurfaceProfile } from '../models/surface';
import type { ResolvedLayout } from '../models/layout';
import type { AdSpec, AdElementSpec } from '../models/ad-spec';

interface CompareRendererProps {
  surface: SurfaceProfile;
  layout: ResolvedLayout;
  adSpec: AdSpec;
}

export function CompareRenderer({ surface, layout, adSpec }: CompareRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // Safe dimensions calculation, padding of 40px
        const availableW = Math.max(1, entry.contentRect.width - 40);
        const availableH = Math.max(1, entry.contentRect.height - 40);
        
        const scaleX = availableW / surface.width;
        const scaleY = availableH / surface.height;
        
        setScale(Math.min(scaleX, scaleY));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [surface.width, surface.height]);

  return (
    <div 
      ref={containerRef} 
      className="technical-grid"
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div 
        style={{
          position: 'relative',
          width: `${surface.width}px`,
          height: `${surface.height}px`,
          transform: `scale(${scale})`,
          background: 'var(--bg-card)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          // Optional subtle inner border to show artboard limits clearly
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {layout.elements.map(el => {
          if (!el.visible) return null;
          const spec = adSpec.elements.find(s => s.id === el.id);
          if (!spec) return null;

          return (
            <div 
              key={el.id}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                // Explicitly requested DEBUG borders to verify coordinate mapping
                border: '1px solid rgba(255, 100, 100, 0.4)',
                opacity: (el.state === 'resized' || el.state === 'truncated') ? 0.85 : 1
              }}
            >
               <CompareElementContent spec={spec} el={el} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompareElementContent({ spec, el }: { spec: AdElementSpec, el: any }) {
  const isTruncated = el.state === 'truncated';
  const textStyle: React.CSSProperties = {
    textAlign: 'center',
    width: '100%',
    whiteSpace: isTruncated ? 'nowrap' : 'normal',
    overflow: 'hidden',
    textOverflow: isTruncated ? 'ellipsis' : 'clip',
    fontFamily: 'var(--font-sans)',
    padding: '8px'
  };

  // Safe derivation of font size strictly within the renderer based on resolved logical box
  const w = el.width;
  const h = el.height;

  switch (spec.type) {
    case 'headline': {
      const fs = Math.max(16, Math.min(w * 0.15, h * 0.5));
      return (
        <div style={{ ...textStyle, fontSize: `${fs}px`, fontWeight: 600, color: '#F2EFE8' }}>
          {spec.content}
        </div>
      );
    }
    case 'cta': {
      const fs = Math.max(12, Math.min(w * 0.15, h * 0.4));
      return (
        <div style={{ 
          ...textStyle, 
          fontSize: `${fs}px`, 
          fontWeight: 600, 
          background: 'var(--accent-primary)', 
          color: '#11110F',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {spec.content}
        </div>
      );
    }
    case 'image':
      return (
        <div style={{ width: '100%', height: '100%', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {spec.imageUrl ? (
            <img 
              src={spec.imageUrl} 
              alt="Ad content" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
             <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>IMAGE</div>
          )}
        </div>
      );
    case 'price': {
      const fs = Math.max(14, Math.min(w * 0.25, h * 0.6));
      return (
        <div style={{ ...textStyle, fontSize: `${fs}px`, fontWeight: 700, color: 'var(--text-main)' }}>
          {spec.content}
        </div>
      );
    }
    case 'branding': {
      const fs = Math.max(10, Math.min(w * 0.2, h * 0.5));
      return (
        <div style={{ ...textStyle, fontSize: `${fs}px`, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {spec.content}
        </div>
      );
    }
    case 'secondaryText': {
      const fs = Math.max(10, Math.min(w * 0.1, h * 0.4));
      return (
        <div style={{ ...textStyle, fontSize: `${fs}px`, color: 'var(--text-muted)' }}>
          {spec.content}
        </div>
      );
    }
    default:
      return <div style={{ ...textStyle, fontSize: `12px` }}>{spec.content || spec.type}</div>;
  }
}
