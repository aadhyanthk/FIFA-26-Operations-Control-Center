import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { MetricCard } from '../dashboard/MetricCard';

export const FoodTab: React.FC = () => {
  const { foodCourts } = useStadiumStore();
  const courts = Object.values(foodCourts || {});

  const totalRevenue = courts.reduce((sum, fc) => sum + fc.revenue, 0);
  const totalQueue = courts.reduce((sum, fc) => sum + fc.headcount, 0);
  const avgQueue = courts.length > 0 ? totalQueue / courts.length : 0;
  
  const lowStockCount = courts.filter(fc => fc.drinkStock < 20 || fc.foodStock < 20).length;
  const failedEquipmentCount = courts.filter(fc => fc.equipmentStatus === 'failed').length;

  return (
    <div className="flex-col gap-lg h-full">
      <div className="flex-row gap-md">
        <MetricCard title="Total Revenue ($)" value={totalRevenue} format="number" />
        <MetricCard title="Total Headcount" value={Math.floor(totalQueue)} format="number" status={totalQueue > 400 ? 'critical' : totalQueue > 200 ? 'warning' : 'ok'} />
        <MetricCard title="Average Headcount" value={Math.floor(avgQueue)} format="number" />
        <MetricCard title="System Health (Issues)" value={failedEquipmentCount + lowStockCount} status={failedEquipmentCount > 0 ? 'critical' : lowStockCount > 0 ? 'warning' : 'ok'} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-md)'
      }}>
        {courts.map(fc => {
          const isFailed = fc.equipmentStatus === 'failed';
          const queueStatus = fc.headcount > 500 ? 'var(--critical)' : fc.headcount > 250 ? 'var(--warning)' : 'var(--ok)';
          
          return (
            <div key={fc.id} className="card flex-col gap-md" style={{
              border: isFailed ? '1px solid var(--critical-border)' : '1px solid var(--border)',
              boxShadow: isFailed ? 'var(--shadow-critical)' : 'none',
              animation: isFailed ? 'criticalPulse 2s infinite' : 'none'
            }}>
              <div className="flex-row justify-between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <h3 className="text-primary font-semibold m-0">{fc.name}</h3>
                  <div className="text-secondary text-xs">{fc.location}</div>
                </div>
                {isFailed && (
                  <span className="text-xs font-bold" style={{ color: 'var(--critical)', padding: '2px 6px', backgroundColor: 'var(--critical-bg)', borderRadius: '4px' }}>
                    EQUIPMENT FAILED
                  </span>
                )}
              </div>

              <div className="flex-row justify-between" style={{ alignItems: 'baseline' }}>
                <span className="text-secondary text-sm">Revenue</span>
                <span className="mono text-primary font-bold text-lg">${Math.floor(fc.revenue).toLocaleString()}</span>
              </div>

              <div className="flex-row justify-between" style={{ alignItems: 'baseline' }}>
                <span className="text-secondary text-sm">Current Headcount</span>
                <span className="mono font-bold text-lg" style={{ color: queueStatus }}>
                  {Math.floor(fc.headcount)}
                </span>
              </div>

              <div className="flex-col gap-xs">
                <div className="flex-row justify-between text-xs">
                  <span className="text-secondary">Drink Stock</span>
                  <span className="mono" style={{ color: fc.drinkStock < 20 ? 'var(--critical)' : fc.drinkStock < 50 ? 'var(--warning)' : 'var(--ok)' }}>
                    {Math.floor(fc.drinkStock)}%
                  </span>
                </div>
                <div className="w-full" style={{ height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(0, Math.min(100, fc.drinkStock))}%`,
                    backgroundColor: fc.drinkStock < 20 ? 'var(--critical)' : fc.drinkStock < 50 ? 'var(--warning)' : 'var(--ok)',
                    transition: 'width 0.5s ease-out, background-color 0.5s'
                  }} />
                </div>
              </div>

              <div className="flex-col gap-xs">
                <div className="flex-row justify-between text-xs">
                  <span className="text-secondary">Food Stock</span>
                  <span className="mono" style={{ color: fc.foodStock < 20 ? 'var(--critical)' : fc.foodStock < 50 ? 'var(--warning)' : 'var(--ok)' }}>
                    {Math.floor(fc.foodStock)}%
                  </span>
                </div>
                <div className="w-full" style={{ height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(0, Math.min(100, fc.foodStock))}%`,
                    backgroundColor: fc.foodStock < 20 ? 'var(--critical)' : fc.foodStock < 50 ? 'var(--warning)' : 'var(--ok)',
                    transition: 'width 0.5s ease-out, background-color 0.5s'
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
