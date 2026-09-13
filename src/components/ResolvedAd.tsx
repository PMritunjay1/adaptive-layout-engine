import type { ResolvedLayout } from '../models/layout';
import type { AdSpec } from '../models/ad-spec';

interface ResolvedAdProps {
  layout: ResolvedLayout;
  adSpec: AdSpec;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  scale: number;
}

export function ResolvedAd({ layout, adSpec, selectedElementId, onSelectElement, scale }: ResolvedAdProps) {
  return (
    <>
      {layout.elements.map(resolvedEl => {
        if (!resolvedEl.visible) return null;
        
        const specEl = adSpec.elements.find(e => e.id === resolvedEl.id);
        if (!specEl) return null;

        const isSelected = selectedElementId === resolvedEl.id;

        // Degradation Visual Language:
        // the engine made a deliberate trade-off, not a UI error.
        const isResized = resolvedEl.state === 'resized';
        const isTruncated = resolvedEl.state === 'truncated';
        
        // Truncated gets a subtle warning border, resized gets a slight background tint overlay
        const degradationOutline = isTruncated ? '1px dashed var(--accent-warning)' : 'none';
        const degradationOpacity = (isResized || isTruncated) ? 0.85 : 1;

        return (
          <div
            key={resolvedEl.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement(resolvedEl.id);
            }}
            style={{
              position: 'absolute',
              left: `${resolvedEl.x * scale}px`,
              top: `${resolvedEl.y * scale}px`,
              width: `${resolvedEl.width * scale}px`,
              height: `${resolvedEl.height * scale}px`,
              cursor: 'pointer',
              zIndex: isSelected ? 10 : specEl.priority,
              transition: 'box-shadow 0.15s ease, outline 0.15s ease',
              boxShadow: isSelected ? '0 0 0 2px var(--accent-primary)' : 'none',
              outline: degradationOutline,
              opacity: degradationOpacity,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ElementContent type={specEl.type} content={specEl.content} imageUrl={specEl.imageUrl} state={resolvedEl.state} w={resolvedEl.width} h={resolvedEl.height} />
          </div>
        );
      })}
    </>
  );
}

function ElementContent({ type, content, imageUrl, state, w, h }: { type: string, content?: string, imageUrl?: string, state: string, w: number, h: number }) {
  const isTruncated = state === 'truncated';
  const textStyle: React.CSSProperties = {
    textAlign: 'center',
    width: '100%',
    whiteSpace: isTruncated ? 'nowrap' : 'normal',
    overflow: 'hidden',
    textOverflow: isTruncated ? 'ellipsis' : 'clip',
    padding: `4px`,
    fontFamily: 'var(--font-sans)',
  };

  switch (type) {
    case 'headline': {
      const fs = Math.max(16, Math.min(w * 0.15, h * 0.5));
      return (
        <div style={{ ...textStyle, fontSize: `${fs}px`, fontWeight: 600, color: '#F2EFE8', padding: `8px` }}>
          {content}
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
          borderRadius: `2px`,
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: `8px`
        }}>
          {content}
        </div>
      );
    }
    case 'image':
      return (
        <div style={{ width: '100%', height: '100%', background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: `2px`, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Ad content" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }} 
            />
          ) : null}
          <div style={{ display: imageUrl ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span style={{ fontSize: `9px`, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: `6px`, fontFamily: 'var(--font-mono)' }}>IMAGE</span>
          </div>
        </div>
      );
    case 'price': {
      const fs = Math.max(14, Math.min(w * 0.25, h * 0.6));
      return (
        <div style={{ ...textStyle, fontSize: `${fs}px`, fontWeight: 700, color: 'var(--text-main)', padding: `8px` }}>
          {content}
        </div>
      );
    }
    case 'branding': {
      const fs = Math.max(10, Math.min(w * 0.2, h * 0.5));
      return (
        <div style={{ ...textStyle, fontSize: `${fs}px`, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: `1px`, padding: `8px` }}>
          {content}
        </div>
      );
    }
    case 'secondaryText': {
      const fs = Math.max(10, Math.min(w * 0.1, h * 0.4));
      return (
        <div style={{ ...textStyle, fontSize: `${fs}px`, color: 'var(--text-muted)', padding: `8px` }}>
          {content}
        </div>
      );
    }
    default:
      return <div style={{ ...textStyle, fontSize: `12px`, background: 'var(--bg-panel)', width: '100%', height: '100%', border: '1px solid var(--border-color)' }}>{content || type}</div>;
  }
}
