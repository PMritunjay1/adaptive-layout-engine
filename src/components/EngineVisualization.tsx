import { ArrowDown, Database, Sliders, LayoutTemplate, Layers, CheckCircle, Crosshair, AlertCircle } from 'lucide-react';

export function EngineVisualization() {
  const steps = [
    { label: 'Ad Spec', icon: <Database size={16} /> },
    { label: 'Validation', icon: <AlertCircle size={16} /> },
    { label: 'Priority Sorting', icon: <Sliders size={16} /> },
    { label: 'Degradation States', icon: <Layers size={16} /> },
    { label: 'Candidate Generation', icon: <Crosshair size={16} /> },
    { label: 'Bounds Check', icon: <AlertCircle size={16} /> },
    { label: 'Collision Check', icon: <AlertCircle size={16} /> },
    { label: 'Candidate Accepted / Degraded', icon: <CheckCircle size={16} /> },
    { label: 'Final Validation', icon: <AlertCircle size={16} /> },
    { label: 'Resolved Layout', icon: <LayoutTemplate size={16} /> },
    { label: 'Renderer', icon: <LayoutTemplate size={16} /> },
  ];

  return (
    <div className="flex-col gap-2 p-6 bg-root rounded border" style={{ maxWidth: 400, margin: '0 auto', background: 'var(--bg-panel)', borderColor: 'var(--border-color)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <h3 className="text-sm font-semibold mb-6 text-center uppercase tracking-wider text-muted">Engine Architecture Pipeline</h3>
      {steps.map((step, idx) => (
        <div key={step.label} className="flex-col items-center">
          <div className="flex items-center gap-3 p-3 bg-card border rounded w-full justify-center" style={{ borderColor: 'var(--border-color)' }}>
            <span style={{ color: 'var(--accent-primary)' }}>{step.icon}</span>
            <span className="font-semibold text-xs uppercase tracking-wider">{step.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className="py-1">
              <ArrowDown size={16} color="var(--text-muted)" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
