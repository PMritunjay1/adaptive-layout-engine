import { sampleAd } from '../src/data/sample-ad';
import { sampleSurfaces } from '../src/data/sample-surfaces';
import { resolveLayout } from '../src/engine/resolver';

function runAudit() {
  const report: any = {};
  
  for (const surface of sampleSurfaces) {
    const layout = resolveLayout(sampleAd, surface);
    
    report[surface.id] = {
      isValid: layout.violations.length === 0,
      violations: layout.violations,
      elements: layout.elements.map(e => ({
        id: e.id,
        visible: e.visible,
        state: e.state,
        box: `${e.width}x${e.height} at (${e.x},${e.y})`,
        reason: e.reason
      }))
    };
  }
  
  console.log(JSON.stringify(report, null, 2));
}

runAudit();
