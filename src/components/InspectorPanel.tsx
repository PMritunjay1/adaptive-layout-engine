import { useState } from 'react';
import type { ResolvedLayout } from '../models/layout';
import type { AdSpec } from '../models/ad-spec';
import { Settings, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface InspectorPanelProps {
  layout: ResolvedLayout;
  adSpec: AdSpec;
  selectedElementId: string | null;
}

export function InspectorPanel({ layout, adSpec, selectedElementId }: InspectorPanelProps) {
  const selectedElementSpec = selectedElementId 
    ? adSpec.elements.find(e => e.id === selectedElementId) 
    : null;
    
  const selectedElementResolved = selectedElementId 
    ? layout.elements.find(e => e.id === selectedElementId) 
    : null;

  const [traceExpanded, setTraceExpanded] = useState(false);

  const stateCounts = layout.elements.reduce((acc, el) => {
    acc[el.state] = (acc[el.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="panel" style={{ width: '320px', minWidth: '320px' }}>
      <div className="panel-header flex items-center gap-2">
        <Settings size={14} />
        Inspector
      </div>
      
      <div className="panel-content">
        {/* Layout Summary */}
        <div className="flex-col gap-3">
          <div className="font-semibold text-xs uppercase tracking-wider text-muted flex items-center gap-2">
            Resolution
          </div>
          
          <div className="flex gap-2 font-mono text-[10px] uppercase">
            <div className="flex-1 border p-2" style={{ borderColor: layout.violations.length === 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              <div className="text-muted mb-1">Status</div>
              <div className="font-bold text-sm" style={{ color: layout.violations.length === 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {layout.violations.length === 0 ? 'VALID' : 'INVALID'}
              </div>
            </div>
            <div className="flex-1 border border-color p-2">
              <div className="text-muted mb-1">Elements</div>
              <div className="font-bold text-sm text-main">{layout.elements.length}</div>
            </div>
          </div>
          
          <div>
            <div className="font-semibold text-[10px] uppercase tracking-wider text-muted mb-2 mt-2">Placement</div>
            <div className="flex flex-col gap-1 font-mono text-[10px]">
              <div className="flex justify-between border-b pb-1 border-color">
                <span className="text-muted">Original</span>
                <span className="text-main">{stateCounts['placed'] || 0}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-color">
                <span className="text-muted">Resized</span>
                <span className="text-main">{stateCounts['resized'] || 0}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-color">
                <span className="text-muted">Truncated</span>
                <span className="text-main">{stateCounts['truncated'] || 0}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-color">
                <span className="text-muted">Hidden</span>
                <span className="text-main">{stateCounts['hidden'] || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Violations */}
        {layout.violations.length > 0 && (
          <div className="mt-2 flex-col gap-2 p-3 border" style={{ borderColor: 'var(--accent-danger)' }}>
            <div className="font-semibold text-[10px] uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--accent-danger)' }}>
              <AlertCircle size={14} /> Violations ({layout.violations.length})
            </div>
            {layout.violations.map((v, i) => (
              <div key={i} className="text-[10px] font-mono text-muted leading-relaxed">
                <strong style={{ color: 'var(--accent-danger)' }}>{v.elementId}:</strong> {v.message}
              </div>
            ))}
          </div>
        )}
        
        <div className="divider my-2"></div>

        {/* Selected Element */}
        {selectedElementSpec && selectedElementResolved ? (
          <div className="flex-col gap-4">
            <div>
              <div className="font-semibold text-xs uppercase tracking-wider text-muted mb-1">Element</div>
              <div className="text-sm font-semibold">{selectedElementSpec.id}</div>
              <div className="text-[10px] font-mono text-muted mt-1 uppercase">
                Type: {selectedElementSpec.type} | Priority: {selectedElementSpec.priority}
              </div>
            </div>
            
            <div>
              <div className="font-semibold text-[10px] uppercase tracking-wider text-muted mb-2">State</div>
              <span className={`badge ${
                selectedElementResolved.state === 'placed' ? 'success' :
                selectedElementResolved.state === 'hidden' ? 'error' : 'warning'
              }`}>
                {selectedElementResolved.state.toUpperCase()}
              </span>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="font-semibold text-[10px] uppercase tracking-wider text-muted mb-1">Target</div>
                <div className="font-mono text-[11px]">
                  {selectedElementSpec.preferredWidth || selectedElementSpec.minWidth || 'AUTO'} × {selectedElementSpec.preferredHeight || selectedElementSpec.minHeight || 'AUTO'}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[10px] uppercase tracking-wider text-muted mb-1">Resolved</div>
                <div className="font-mono text-[11px] text-main">
                  {selectedElementResolved.width} × {selectedElementResolved.height}
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-[10px] uppercase tracking-wider text-muted mb-1">Position</div>
              <div className="font-mono text-[11px]">
                x: {selectedElementResolved.x}  y: {selectedElementResolved.y}
              </div>
              <div className="font-mono text-[10px] text-muted mt-1">
                Pref: {selectedElementSpec.preferredPosition || 'NONE'}
              </div>
            </div>

            <div>
              <div className="font-semibold text-[10px] uppercase tracking-wider text-muted mb-2">Policy</div>
              <div className="flex flex-col gap-1 font-mono text-[10px]">
                <div className="flex justify-between border-b border-color pb-1">
                  <span className="text-muted">Resize</span>
                  <span className="text-main">{selectedElementSpec.degradation.allowResize ? '✓' : '✕'}</span>
                </div>
                <div className="flex justify-between border-b border-color pb-1">
                  <span className="text-muted">Reposition</span>
                  <span className="text-main">{selectedElementSpec.degradation.allowReposition ? '✓' : '✕'}</span>
                </div>
                <div className="flex justify-between border-b border-color pb-1">
                  <span className="text-muted">Truncate</span>
                  <span className="text-main">{selectedElementSpec.degradation.allowTruncate ? '✓' : '✕'}</span>
                </div>
                <div className="flex justify-between border-b border-color pb-1">
                  <span className="text-muted">Hide</span>
                  <span className="text-main">{selectedElementSpec.degradation.allowHide ? '✓' : '✕'}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-[10px] uppercase tracking-wider text-muted mb-2">Decision Context</div>
              <div className="p-2 border bg-card font-mono text-[10px] text-muted leading-relaxed">
                {parseReason(selectedElementResolved.reason || '')}
              </div>
            </div>
            
            <div className="border border-color">
              <button 
                className="w-full flex items-center justify-between p-2 text-[10px] uppercase tracking-wider font-semibold"
                style={{ background: 'transparent', border: 'none' }}
                onClick={() => setTraceExpanded(!traceExpanded)}
              >
                Raw Resolution Trace
                {traceExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {traceExpanded && (
                <div className="p-2 border-t font-mono text-[9px] text-muted whitespace-pre-wrap overflow-x-auto bg-card" style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {selectedElementResolved.reason}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-col items-center justify-center text-center p-8 text-muted" style={{ height: '300px' }}>
            <Settings size={24} className="mb-4 opacity-30" />
            <div className="text-[10px] uppercase tracking-wider">Select Element to Inspect</div>
          </div>
        )}
      </div>
    </div>
  );
}

function parseReason(reason: string) {
  if (reason.includes('fatal hard constraint violation')) {
    return 'Element failed to resolve and its policy does not allow hiding.';
  }
  if (reason.includes('Hide attempted: Accepted')) {
    return 'Element candidates exhausted. Policy allowed hiding, so it was removed.';
  }
  
  const matches = [...reason.matchAll(/Attempted (\w+) \(\d+x\d+\): (.*)/g)];
  if (matches.length > 0) {
    const lastAttempt = matches[matches.length - 1];
    const status = lastAttempt[2];
    if (status.startsWith('Accepted')) {
      return `Accepted candidate. No collisions or bounds violations detected at this position.`;
    }
  }
  
  return 'Engine evaluated constraints and applied the state according to policy.';
}
