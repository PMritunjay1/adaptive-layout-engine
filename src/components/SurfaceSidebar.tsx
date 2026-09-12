import type { SurfaceProfile } from '../models/surface';
import { sampleSurfaces } from '../data/sample-surfaces';
import { Maximize, Edit3, Monitor, Zap } from 'lucide-react';

interface SurfaceSidebarProps {
  activeSurfaceId: string;
  onSelectSurface: (id: string) => void;
  customSurfaceDraft: SurfaceProfile;
  setCustomSurfaceDraft: React.Dispatch<React.SetStateAction<SurfaceProfile>>;
  onApplyCustomSurface: () => void;
}

export function SurfaceSidebar({
  activeSurfaceId,
  onSelectSurface,
  customSurfaceDraft,
  setCustomSurfaceDraft,
  onApplyCustomSurface
}: SurfaceSidebarProps) {
  
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof SurfaceProfile, subfield?: keyof SurfaceProfile['safeArea']) => {
    const value = parseInt(e.target.value) || 0;
    
    setCustomSurfaceDraft(prev => {
      if (subfield) {
        return {
          ...prev,
          safeArea: {
            ...prev.safeArea,
            [subfield]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleStressTest = () => {
    setCustomSurfaceDraft({
      id: 'custom',
      width: 250,
      height: 350,
      safeArea: { top: 20, right: 20, bottom: 20, left: 20 },
      minTextSize: 12,
      minTapTarget: 44,
      touchEnabled: true
    });
    onSelectSurface('custom');
    setTimeout(() => onApplyCustomSurface(), 0);
  };

  return (
    <div className="panel" style={{ width: '260px', minWidth: '260px' }}>
      <div className="panel-header flex items-center gap-2">
        <Monitor size={14} />
        Surfaces
      </div>
      
      <div className="flex-col pb-4">
        {sampleSurfaces.map(surface => (
          <div 
            key={surface.id}
            className={`surface-row ${activeSurfaceId === surface.id ? 'active' : ''}`}
            onClick={() => onSelectSurface(surface.id)}
          >
            <div className="font-semibold text-xs uppercase tracking-wider" style={{ color: activeSurfaceId === surface.id ? 'var(--accent-primary)' : 'inherit' }}>
              {surface.id.replace(/-/g, ' ')}
            </div>
            <div className="text-[10px] font-mono text-muted flex items-center gap-1 mt-1">
              <Maximize size={10} /> {surface.width} × {surface.height}
            </div>
          </div>
        ))}
        
        <div className="divider my-4"></div>
        
        <div className="px-4 flex-col gap-3">
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider flex items-center gap-2" style={{ color: activeSurfaceId === 'custom' ? 'var(--accent-primary)' : 'inherit' }}>
              <Edit3 size={14} />
              Unknown Surface
            </div>
            <div className="text-[10px] text-muted mt-1 leading-relaxed">
              This surface profile was not predefined by the engine.
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <label>Width</label>
              <input type="number" value={customSurfaceDraft.width} onChange={e => handleCustomChange(e, 'width')} />
            </div>
            <div className="flex-1">
              <label>Height</label>
              <input type="number" value={customSurfaceDraft.height} onChange={e => handleCustomChange(e, 'height')} />
            </div>
          </div>
          
          <div>
            <label className="mb-1">Safe Area (T/R/B/L)</label>
            <div className="flex gap-1">
              <input type="number" value={customSurfaceDraft.safeArea.top} onChange={e => handleCustomChange(e, 'safeArea', 'top')} title="Top" />
              <input type="number" value={customSurfaceDraft.safeArea.right} onChange={e => handleCustomChange(e, 'safeArea', 'right')} title="Right" />
              <input type="number" value={customSurfaceDraft.safeArea.bottom} onChange={e => handleCustomChange(e, 'safeArea', 'bottom')} title="Bottom" />
              <input type="number" value={customSurfaceDraft.safeArea.left} onChange={e => handleCustomChange(e, 'safeArea', 'left')} title="Left" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <label>Min Text</label>
              <input type="number" value={customSurfaceDraft.minTextSize} onChange={e => handleCustomChange(e, 'minTextSize')} />
            </div>
            <div className="flex-1">
              <label>Min Tap Target</label>
              <input type="number" value={customSurfaceDraft.minTapTarget} onChange={e => handleCustomChange(e, 'minTapTarget')} />
            </div>
          </div>
          
          <button 
            className="primary mt-2 uppercase tracking-wider text-[10px]" 
            onClick={() => {
              onSelectSurface('custom');
              onApplyCustomSurface();
            }}
          >
            Resolve Custom Surface
          </button>
          
          <button 
            className="mt-1 text-[10px] uppercase tracking-wider flex items-center justify-center gap-2" 
            style={{ color: 'var(--accent-warning)', borderColor: 'var(--accent-warning)', background: 'transparent' }}
            onClick={handleStressTest}
          >
            <Zap size={12} />
            Constraint Stress Test
          </button>
        </div>
      </div>
    </div>
  );
}
