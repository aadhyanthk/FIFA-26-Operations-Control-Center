import React, { useEffect, useRef } from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { stadiumLayout } from '../../data/stadiumLayout';

export const StadiumMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      // delta time could be used for dot animations
      // const deltaTime = time - lastTime;
      lastTime = time;

      const state = useStadiumStore.getState();
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw base oval (pitch)
      ctx.fillStyle = '#1e3a24'; // dark green pitch
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, width * 0.25, height * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw zones (heatmap)
      stadiumLayout.zones.forEach(zone => {
        const stateZone = state.zones[zone.id];
        const density = stateZone?.density || 0;
        
        let color = 'rgba(59, 130, 246, 0.3)'; // blue (low)
        if (density > 0.85) color = 'rgba(239, 68, 68, 0.6)'; // red (critical)
        else if (density > 0.65) color = 'rgba(245, 158, 11, 0.5)'; // orange
        else if (density > 0.4) color = 'rgba(234, 179, 8, 0.4)'; // yellow

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(zone.center.x * width, zone.center.y * height, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(zone.name.split(' ')[0], zone.center.x * width, zone.center.y * height + 4);
      });

      // Draw Gates
      stadiumLayout.gates.forEach(gate => {
        const stateGate = state.gates[gate.id];
        const queue = stateGate?.queueLength || 0;
        
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = stateGate?.isOpen ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.rect(gate.location.x * width - 15, gate.location.y * height - 10, 30, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(gate.id, gate.location.x * width, gate.location.y * height + 4);
        
        // Draw queue length indicator
        if (queue > 0) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
          ctx.beginPath();
          ctx.arc(gate.location.x * width, gate.location.y * height - 20, Math.min(queue / 100, 15), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        fontWeight: 600,
        color: 'var(--text-primary)'
      }}>
        MetLife Stadium Live Map
      </div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
};
