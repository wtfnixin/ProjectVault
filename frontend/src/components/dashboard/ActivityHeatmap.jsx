import React, { useMemo } from 'react';
import { format, subDays, startOfDay, getDay } from 'date-fns';
import './ActivityHeatmap.css';

export default function ActivityHeatmap({ data = {} }) {
  const { allCells, activeDays } = useMemo(() => {
    const today = startOfDay(new Date());
    const numDays = 365;
    const oldestDay = subDays(today, numDays - 1);
    
    // 0 (Sunday) to 6 (Saturday)
    const startPadding = getDay(oldestDay);
    
    // Pad the first column so the earliest day aligns with the correct weekday
    const paddedDays = Array.from({ length: startPadding }).fill(null);
    
    const activeDaysList = Array.from({ length: numDays }).map((_, i) => {
      return format(subDays(today, numDays - 1 - i), 'yyyy-MM-dd');
    });

    return {
      allCells: [...paddedDays, ...activeDaysList],
      activeDays: activeDaysList
    };
  }, []);

  const getLevel = (count) => {
    if (!count || count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  const totalActivities = Object.values(data).reduce((sum, curr) => sum + curr, 0);

  return (
    <div className="activity-heatmap-container">
      <div className="heatmap-scroll-area">
        <div className="heatmap-weekdays">
           <span>Mon</span>
           <span>Wed</span>
           <span>Fri</span>
        </div>
        <div className="heatmap-grid">
          {allCells.map((dateStr, idx) => {
            if (!dateStr) {
               return <div key={`pad-${idx}`} className="heatmap-cell empty-pad"></div>;
            }
            
            const count = data[dateStr] || 0;
            const level = getLevel(count);
            
            // Format nice title for native HTML tooltip
            const displayDate = format(new Date(dateStr), 'MMM d, yyyy');
            const tooltipStr = count === 0 
              ? `No activity on ${displayDate}` 
              : `${count} activit${count === 1 ? 'y' : 'ies'} on ${displayDate}`;
            
            return (
              <div
                key={dateStr}
                className={`heatmap-cell level-${level}`}
                title={tooltipStr}
                data-date={dateStr}
                data-count={count}
              ></div>
            );
          })}
        </div>
      </div>
      <div className="heatmap-footer">
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="heatmap-cell level-0"></div>
          <div className="heatmap-cell level-1"></div>
          <div className="heatmap-cell level-2"></div>
          <div className="heatmap-cell level-3"></div>
          <div className="heatmap-cell level-4"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
