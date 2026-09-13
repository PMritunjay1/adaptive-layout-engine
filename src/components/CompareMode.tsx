import { useMemo } from 'react';
import { sampleSurfaces } from '../data/sample-surfaces';
import { sampleAd } from '../data/sample-ad';
import { resolveLayout } from '../engine/resolver';
import { CompareRenderer } from './CompareRenderer';

export function CompareMode() {
  // Resolve all standard surfaces independently using the same adSpec.
  const layouts = useMemo(() => {
    return sampleSurfaces.map(surface => ({
      surface,
      layout: resolveLayout(sampleAd, surface)
    }));
  }, []);

  return (
    <div className="flex-1 p-8" style={{ overflowY: 'auto', background: 'var(--bg-root)' }}>
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-sm font-mono text-muted uppercase tracking-wider mb-2">
          ONE DECLARATIVE SPEC → MULTIPLE RESOLVED LAYOUTS
        </h2>
        <div style={{ height: 1, width: 100, background: 'var(--accent-primary)' }}></div>
      </div>
      
      {/* 2x2 Grid Layout */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
          gap: '32px', 
          maxWidth: '1400px', 
          margin: '0 auto' 
        }}
      >
        {layouts.map(({ surface, layout }) => {
          
          const stateCounts = layout.elements.reduce((acc, el) => {
            acc[el.state] = (acc[el.state] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const isInvalid = layout.violations.length > 0;

          return (
            <div 
              key={surface.id} 
              className="panel" 
              style={{ 
                height: '500px', 
                borderRadius: '4px', 
                border: '1px solid var(--border-color)', 
                display: 'flex', 
                flexDirection: 'column',
                background: 'var(--bg-panel)'
              }}
            >
              {/* Card Header */}
              <div 
                className="p-4 border-b flex justify-between items-start bg-card" 
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div>
                  <div className="font-semibold text-sm uppercase tracking-wider text-main">
                    {surface.id.replace(/-/g, ' ')}
                  </div>
                  <div className="text-xs font-mono text-muted mt-1">
                    {surface.width} × {surface.height}
                  </div>
                </div>
                {isInvalid ? (
                  <span className="badge error">INVALID</span>
                ) : (
                  <span className="badge success" style={{ border: '1px solid var(--accent-success)', color: 'var(--accent-success)', background: 'transparent', padding: '4px 8px', borderRadius: '2px', fontSize: '10px' }}>VALID</span>
                )}
              </div>
              
              {/* Card Preview Area */}
              <div 
                className="flex-1 relative" 
                style={{ overflow: 'hidden', background: '#0a0a0a' }} // distinct dark background for preview
              >
                <CompareRenderer 
                  surface={surface}
                  layout={layout}
                  adSpec={sampleAd}
                />
              </div>
              
              {/* Card Footer */}
              <div 
                className="p-4 border-t flex text-xs font-mono uppercase tracking-wider bg-card" 
                style={{ borderColor: 'var(--border-color)', justifyContent: 'space-between' }}
              >
                <div className="flex-col items-center flex-1 text-center">
                  <div className="text-muted mb-2" style={{ fontSize: '10px' }}>Elements</div>
                  <div className="font-semibold text-main text-sm">{layout.elements.length}</div>
                </div>
                <div className="flex-col items-center flex-1 text-center">
                  <div className="text-muted mb-2" style={{ fontSize: '10px' }}>Resized</div>
                  <div className="font-semibold text-main text-sm">{stateCounts['resized'] || 0}</div>
                </div>
                <div className="flex-col items-center flex-1 text-center">
                  <div className="text-muted mb-2" style={{ fontSize: '10px' }}>Truncated</div>
                  <div className="font-semibold text-main text-sm">{stateCounts['truncated'] || 0}</div>
                </div>
                <div className="flex-col items-center flex-1 text-center">
                  <div className="text-muted mb-2" style={{ fontSize: '10px' }}>Hidden</div>
                  <div className="font-semibold text-main text-sm">{stateCounts['hidden'] || 0}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
