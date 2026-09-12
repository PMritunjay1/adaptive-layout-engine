import { useRef, useEffect, useState } from 'react';
import type { SurfaceProfile } from '../models/surface';
import type { ResolvedLayout } from '../models/layout';
import type { AdSpec } from '../models/ad-spec';
import { ResolvedAd } from './ResolvedAd';

interface StageCanvasProps {
  surface: SurfaceProfile;
  layout: ResolvedLayout;
  adSpec: AdSpec;
  showConstraints: boolean;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
}

export function StageCanvas({ surface, layout, adSpec, showConstraints, selectedElementId, onSelectElement }: StageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const container = entries[0];
      if (!container) return;
      
      const padding = 60;
      const availableWidth = container.contentRect.width - padding;
      const availableHeight = container.contentRect.height - padding;
      
      const scaleX = availableWidth / surface.width;
      const scaleY = availableHeight / surface.height;
      
      setScale(Math.min(scaleX, scaleY, 1.5));
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [surface.width, surface.height]);

  const scaledWidth = surface.width * scale;
  const scaledHeight = surface.height * scale;

  return (
    <div 
      ref={containerRef}
      className="flex-1 flex items-center justify-center technical-grid"
      onClick={() => onSelectElement('')} // Deselect when clicking canvas background
    >
      <div 
        style={{
          position: 'relative',
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          background: 'var(--bg-card)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* The actual mapped ad elements */}
        <ResolvedAd 
          layout={layout} 
          adSpec={adSpec} 
          scale={scale} 
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
        />
        
        {/* Constraint Overlay (Safe Area) */}
        {showConstraints && surface.safeArea && (
          <div
            style={{
              position: 'absolute',
              top: `${surface.safeArea.top * scale}px`,
              right: `${surface.safeArea.right * scale}px`,
              bottom: `${surface.safeArea.bottom * scale}px`,
              left: `${surface.safeArea.left * scale}px`,
              border: '1px solid var(--accent-secondary)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            {/* Corner Markers */}
            <div style={cornerMarkerStyle('top', 'left')} />
            <div style={cornerMarkerStyle('top', 'right')} />
            <div style={cornerMarkerStyle('bottom', 'left')} />
            <div style={cornerMarkerStyle('bottom', 'right')} />
            
            <div 
              style={{
                position: 'absolute',
                top: '-18px',
                left: '0',
                background: 'var(--accent-secondary)',
                color: '#11110F',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              Safe Area
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function cornerMarkerStyle(v: 'top'|'bottom', h: 'left'|'right'): React.CSSProperties {
  return {
    position: 'absolute',
    [v]: '-4px',
    [h]: '-4px',
    width: '8px',
    height: '8px',
    border: '1px solid var(--accent-secondary)',
    background: 'var(--bg-root)',
  };
}
