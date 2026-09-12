import { useMemo } from 'react';
import { sampleSurfaces } from '../data/sample-surfaces';
import { sampleAd } from '../data/sample-ad';
import { resolveLayout } from '../engine/resolver';
import { StageCanvas } from './StageCanvas';

export function CompareMode() {
  // Resolve all standard surfaces independently. No surface-specific branching!
  const layouts = useMemo(() => {
    return sampleSurfaces.map(surface => ({
      surface,
      layout: resolveLayout(sampleAd, surface)
    }));
  }, []);

  return (
    <div className="flex-1 p-6" style={{ overflowY: 'auto', background: 'var(--bg-root)' }}>
      <div className="mb-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-sm font-mono text-muted uppercase tracking-wider mb-2">
          ONE DECLARATIVE SPEC → MULTIPLE RESOLVED LAYOUTS
        </h2>
        <div style={{ height: 1, width: 100, background: 'var(--accent-primary)', marginBottom: 24 }}></div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {layouts.map(({ surface, layout }) => {
          
          const stateCounts = layout.elements.reduce((acc, el) => {
            acc[el.state] = (acc[el.state] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const isInvalid = layout.violations.length > 0;

          return (
            <div key={surface.id} className="panel" style={{ height: '450px', borderRadius: '0', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <div className="p-3 border-b flex justify-between items-center bg-card" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <div className="font-semibold text-xs uppercase tracking-wider">{surface.id.replace(/-/g, ' ')}</div>
                  <div className="text-[10px] font-mono text-muted mt-1">{surface.width} × {surface.height}</div>
                </div>
                {isInvalid ? (
                  <span className="badge error">INVALID</span>
                ) : (
                  <span className="badge success">VALID</span>
                )}
              </div>
              
              <div className="flex-1 relative" style={{ overflow: 'hidden' }}>
                <StageCanvas 
                  surface={surface}
                  layout={layout}
                  adSpec={sampleAd}
                  showConstraints={false}
                  selectedElementId={null}
                  onSelectElement={() => {}}
                />
              </div>
              
              <div className="p-3 border-t flex gap-4 text-[10px] font-mono uppercase tracking-wider bg-card" style={{ borderColor: 'var(--border-color)', justifyContent: 'space-around' }}>
                <div className="flex-col items-center">
                  <span className="text-muted mb-1">Elements</span>
                  <span className="font-semibold text-main">{layout.elements.length}</span>
                </div>
                <div className="flex-col items-center">
                  <span className="text-muted mb-1">Resized</span>
                  <span className="font-semibold text-main">{stateCounts['resized'] || 0}</span>
                </div>
                <div className="flex-col items-center">
                  <span className="text-muted mb-1">Truncated</span>
                  <span className="font-semibold text-main">{stateCounts['truncated'] || 0}</span>
                </div>
                <div className="flex-col items-center">
                  <span className="text-muted mb-1">Hidden</span>
                  <span className="font-semibold text-main">{stateCounts['hidden'] || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
