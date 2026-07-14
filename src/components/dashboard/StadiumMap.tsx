import React, { useEffect, useRef, useState } from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { stadiumLayout } from '../../data/stadiumLayout';
import type { Coordinates } from '../../data/stadiumLayout';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface TooltipData {
  x: number;
  y: number;
  name: string;
  occupancy: number;
  capacity: number;
  density: number;
}

export const StadiumMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      
      // Account for object-fit: contain
      const canvasRatio = canvas.width / canvas.height;
      const rectRatio = rect.width / rect.height;
      
      let renderWidth = rect.width;
      let renderHeight = rect.height;
      let offsetX = 0;
      let offsetY = 0;
      
      if (rectRatio > canvasRatio) {
         renderWidth = rect.height * canvasRatio;
         offsetX = (rect.width - renderWidth) / 2;
      } else {
         renderHeight = rect.width / canvasRatio;
         offsetY = (rect.height - renderHeight) / 2;
      }
      
      const x = (e.clientX - rect.left - offsetX) / renderWidth;
      const y = (e.clientY - rect.top - offsetY) / renderHeight;
      
      const state = useStadiumStore.getState();
      let hoveredZone = null;
      
      for (const zone of stadiumLayout.zones) {
        if (!zone.path || zone.path.length === 0) continue;
        
        // Point in polygon check (ray casting)
        let inside = false;
        for (let i = 0, j = zone.path.length - 1; i < zone.path.length; j = i++) {
          const xi = zone.path[i].x, yi = zone.path[i].y;
          const xj = zone.path[j].x, yj = zone.path[j].y;
          
          const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        
        if (inside) {
          hoveredZone = zone;
          break;
        }
      }

      if (hoveredZone) {
        const zoneState = state.zones[hoveredZone.id];
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          name: hoveredZone.name,
          occupancy: zoneState?.currentOccupancy || 0,
          capacity: hoveredZone.maxCapacity,
          density: zoneState?.density || 0
        });
      } else {
        setTooltip(null);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => setTooltip(null));

    const render = () => {
      const state = useStadiumStore.getState();
      const width = canvas.width;
      const height = canvas.height;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Draw Stadium Outer Boundary
      ctx.fillStyle = '#0f172a'; // very dark
      ctx.beginPath();
      ctx.ellipse(width/2, height/2, width*0.48, height*0.56, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Pitch
      ctx.fillStyle = '#14532d'; // darker pitch green
      ctx.beginPath();
      const pitchW = width * 0.20;
      const pitchH = height * 0.35;
      ctx.rect(width/2 - pitchW/2, height/2 - pitchH/2, pitchW, pitchH);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Pitch markings
      ctx.beginPath();
      ctx.moveTo(width/2 - pitchW/2, height/2);
      ctx.lineTo(width/2 + pitchW/2, height/2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(width/2, height/2, pitchW * 0.3, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Zones (Polygons + Heatmap)
      stadiumLayout.zones.forEach(zone => {
        if (!zone.path || zone.path.length === 0) return;
        
        const zoneState = state.zones[zone.id];
        const density = zoneState?.density || 0;
        
        // HSL heatmap based on density
        let hue = 220; // Default blue
        let alpha = 0.2;
        if (density > 0) {
           hue = 120 - (density * 120); // 120 (Green) to 0 (Red)
           alpha = 0.3 + (density * 0.5); // more opaque when full
        }
        
        ctx.fillStyle = `hsla(${Math.max(0, hue)}, 80%, 50%, ${alpha})`;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        zone.path.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x * width, p.y * height);
          else ctx.lineTo(p.x * width, p.y * height);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Spawn particles based on density
      Object.values(state.zones).forEach(z => {
        if (z.density > 0.1 && Math.random() < z.density * 0.15) {
          const layout = stadiumLayout.zones.find(l => l.id === z.id);
          if (layout) {
             particles.push({
               x: layout.center.x * width + (Math.random() - 0.5) * 40,
               y: layout.center.y * height + (Math.random() - 0.5) * 40,
               vx: (Math.random() - 0.5) * 0.6,
               vy: (Math.random() - 0.5) * 0.6,
               life: 0,
               maxLife: 60 + Math.random() * 60
             });
          }
        }
      });

      // Draw and update particles
      particles = particles.filter(p => p.life < p.maxLife);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        
        const alpha = 1 - (p.life / p.maxLife);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Gates
      stadiumLayout.gates.forEach(gate => {
        const stateGate = state.gates[gate.id];
        const cx = gate.location.x * width;
        const cy = gate.location.y * height;
        
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = stateGate?.isOpen ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(gate.id, cx, cy + 4);

        // Directional arrow
        if (stateGate?.isOpen && stateGate.queueLength > 0) {
          const dir = stateGate.mode === 'inflow' ? -1 : 1;
          const dx = cx - width/2;
          const dy = cy - height/2;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const nx = dx/dist;
          const ny = dy/dist;

          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          const tCx = cx + nx * 22 * dir;
          const tCy = cy + ny * 22 * dir;
          
          ctx.moveTo(tCx + nx * 6, tCy + ny * 6);
          ctx.lineTo(tCx - nx * 6 - ny * 6, tCy - ny * 6 + nx * 6);
          ctx.lineTo(tCx - nx * 6 + ny * 6, tCy - ny * 6 - nx * 6);
          ctx.closePath();
          ctx.fill();
        }
      });

      // Draw Teams
      const teamIcons: Record<string, string> = {
        'security': '🛡️',
        'medical': '⚕️',
        'cleaning': '🧹'
      };
      
      const drawnTeams = new Map<string, number>();
      
      Object.values(state.teams).forEach(team => {
        let locCoords: Coordinates | null = null;
        let isGate = false;
        
        const zone = stadiumLayout.zones.find(z => z.name === team.location);
        if (zone) locCoords = zone.center;
        else {
          const gate = stadiumLayout.gates.find(g => `Gate ${g.id}` === team.location);
          if (gate) {
            locCoords = gate.location;
            isGate = true;
          }
        }

        if (locCoords) {
           const locKey = `${locCoords.x},${locCoords.y}`;
           const offsetCount = drawnTeams.get(locKey) || 0;
           drawnTeams.set(locKey, offsetCount + 1);
           
           // Apply expanding offset if multiple teams are at same location
           const cx = locCoords.x * width + (offsetCount * 12) - (offsetCount > 0 ? 6 : 0);
           // Offset Y so it doesn't block gate text which is at cy + 4
           const cy = locCoords.y * height + (offsetCount * 5) + (isGate ? 18 : 0);
           
           ctx.font = '16px Arial';
           ctx.textAlign = 'center';
           ctx.fillText(teamIcons[team.department] || '🚩', cx, cy + 6);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', () => setTooltip(null));
    };
  }, []);

  return (
    <div className="card flex-col items-center justify-center p-0" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div className="font-semibold text-primary" style={{ position: 'absolute', top: '16px', left: '16px' }}>
        MetLife Stadium Live Map
      </div>
      
      {/* Legend */}
      <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'var(--bg-secondary)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <div className="font-semibold text-primary mb-xs">Heatmap (Density)</div>
        <div className="flex-row items-center gap-sm mb-xs">
          <div style={{ width: '100px', height: '8px', background: 'linear-gradient(to right, hsl(120, 80%, 40%), hsl(60, 80%, 50%), hsl(0, 80%, 50%))', borderRadius: '4px' }} />
        </div>
        <div className="flex-row justify-between w-full mb-sm">
          <span>Low</span>
          <span>Max</span>
        </div>
        <div className="flex-col gap-xs">
          <div>🛡️ Security</div>
          <div>⚕️ Medical</div>
          <div>🧹 Cleaning</div>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600}
        className="w-full h-full"
        style={{ objectFit: 'contain', cursor: tooltip ? 'crosshair' : 'default' }}
      />

      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 15,
          top: tooltip.y + 15,
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-active)',
          padding: 'var(--space-sm)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          pointerEvents: 'none',
          zIndex: 100
        }}>
          <div className="font-semibold text-primary mb-xs">{tooltip.name}</div>
          <div className="text-xs text-secondary mb-xs">
            Occupancy: <span className="text-primary">{Math.floor(tooltip.occupancy)} / {tooltip.capacity}</span>
          </div>
          <div className="text-xs text-secondary">
            Density: <span className={tooltip.density > 0.85 ? 'text-critical' : tooltip.density > 0.6 ? 'text-warning' : 'text-ok'}>
              {(tooltip.density * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
