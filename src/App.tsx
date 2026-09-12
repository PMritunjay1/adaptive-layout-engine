import { useState, useMemo } from 'react';
import { sampleSurfaces } from './data/sample-surfaces';
import { sampleAd } from './data/sample-ad';
import { resolveLayout } from './engine/resolver';
import type { SurfaceProfile } from './models/surface';

import { SurfaceSidebar } from './components/SurfaceSidebar';
import { StageCanvas } from './components/StageCanvas';
import { InspectorPanel } from './components/InspectorPanel';
import { CompareMode } from './components/CompareMode';
import { EngineVisualization } from './components/EngineVisualization';

import { X } from 'lucide-react';

function AppMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" stroke="var(--accent-primary)" strokeWidth="1.5" />
      <rect x="6" y="6" width="12" height="12" stroke="var(--accent-primary)" strokeWidth="1.5" />
      <rect x="10" y="10" width="4" height="4" fill="var(--accent-primary)" />
      <path d="M2 12H6M18 12H22M12 2V6M12 18V22" stroke="var(--accent-primary)" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState<'studio' | 'compare'>('studio');
  const [showEngineModal, setShowEngineModal] = useState(false);
  
  const [activeSurfaceId, setActiveSurfaceId] = useState<string>('mobile-portrait');
  
  const [customSurfaceDraft, setCustomSurfaceDraft] = useState<SurfaceProfile>({
    id: 'custom',
    width: 1373,
    height: 417,
    safeArea: { top: 20, right: 20, bottom: 20, left: 20 },
    minTextSize: 12,
    minTapTarget: 44,
    touchEnabled: true
  });
  
  const [appliedCustomSurface, setAppliedCustomSurface] = useState<SurfaceProfile>(customSurfaceDraft);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showConstraints, setShowConstraints] = useState<boolean>(true);

  // Derive the active surface profile
  const activeSurfaceProfile = useMemo(() => {
    if (activeSurfaceId === 'custom') {
      return appliedCustomSurface;
    }
    return sampleSurfaces.find(s => s.id === activeSurfaceId) || sampleSurfaces[0];
  }, [activeSurfaceId, appliedCustomSurface]);

  // Synchronously resolve the layout whenever the spec or surface profile changes.
  const resolvedLayout = useMemo(() => {
    setSelectedElementId(null);
    return resolveLayout(sampleAd, activeSurfaceProfile);
  }, [activeSurfaceProfile]);

  return (
    <div id="root">
      {/* Header */}
      <header className="flex items-center justify-between" style={{ padding: '0 24px', height: '56px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-panel)' }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <AppMark />
            <div className="flex flex-col">
              <div className="font-semibold text-sm" style={{ letterSpacing: '0.5px' }}>ADAPTIVE LAYOUT STUDIO</div>
              <div className="text-xs text-muted font-mono" style={{ fontSize: '10px' }}>CONSTRAINT-BASED COMPOSITION ENGINE v0.1</div>
            </div>
          </div>
          
          <div className="divider" style={{ width: '1px', height: '24px', margin: 0 }}></div>
          
          <div className="flex gap-4">
            <button 
              className={`uppercase tracking-wider text-xs ${viewMode === 'studio' ? 'active' : ''}`}
              style={{ 
                border: 'none', 
                background: 'transparent',
                padding: '4px 0',
                color: viewMode === 'studio' ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom: viewMode === 'studio' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                borderRadius: 0
              }}
              onClick={() => setViewMode('studio')}
            >
              Studio
            </button>
            <button 
              className={`uppercase tracking-wider text-xs ${viewMode === 'compare' ? 'active' : ''}`}
              style={{ 
                border: 'none', 
                background: 'transparent',
                padding: '4px 0',
                color: viewMode === 'compare' ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom: viewMode === 'compare' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                borderRadius: 0
              }}
              onClick={() => setViewMode('compare')}
            >
              Compare
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            className="text-xs text-muted hover:text-main"
            style={{ border: 'none', background: 'transparent' }}
            onClick={() => setShowEngineModal(true)}
          >
            How it works
          </button>
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-success)' }}></div>
            ENGINE ONLINE
          </div>
        </div>
      </header>

      {/* Main Layout */}
      {viewMode === 'studio' ? (
        <main className="flex flex-1" style={{ overflow: 'hidden' }}>
          <SurfaceSidebar 
            activeSurfaceId={activeSurfaceId}
            onSelectSurface={setActiveSurfaceId}
            customSurfaceDraft={customSurfaceDraft}
            setCustomSurfaceDraft={setCustomSurfaceDraft}
            onApplyCustomSurface={() => setAppliedCustomSurface(customSurfaceDraft)}
          />
          
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-root)' }}>
              <div className="font-mono text-xs uppercase tracking-wider text-muted">{activeSurfaceProfile.id.replace(/-/g, ' ')}</div>
              <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={showConstraints} 
                  onChange={e => setShowConstraints(e.target.checked)} 
                  style={{ width: 'auto' }}
                />
                Show Constraints
              </label>
            </div>
            <StageCanvas 
              surface={activeSurfaceProfile}
              layout={resolvedLayout}
              adSpec={sampleAd}
              showConstraints={showConstraints}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
            />
          </div>
          
          <InspectorPanel 
            layout={resolvedLayout}
            adSpec={sampleAd}
            selectedElementId={selectedElementId}
          />
        </main>
      ) : (
        <CompareMode />
      )}

      {/* Engine Architecture Modal */}
      {showEngineModal && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(17, 17, 15, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowEngineModal(false)}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '2px', border: '1px solid var(--border-color)', position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          >
            <button 
              onClick={() => setShowEngineModal(false)}
              style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none' }}
            >
              <X size={16} />
            </button>
            <EngineVisualization />
          </div>
        </div>
      )}
    </div>
  );
}
