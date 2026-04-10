import React, { useMemo, useState } from 'react';
import { format, subDays, startOfDay, getDay } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import './ActivityHeatmap.css';

export default function ActivityHeatmap({ data = {} }) {
  const { user } = useAuth();
  
  const currentYear = new Date().getFullYear();
  const startYear = user?.created_at ? new Date(user.created_at).getFullYear() : currentYear;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => (currentYear - i).toString());

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  
  const { allCells, months } = useMemo(() => {
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

    const cells = [...paddedDays, ...activeDaysList];
    
    // Calculate months mapping above the grid
    const monthsData = [];
    let currentMonth = -1;
    cells.forEach((dateStr, index) => {
      if (!dateStr) return;
      const date = new Date(dateStr);
      const m = date.getMonth();
      if (m !== currentMonth) {
        // Calculate the column index (0 to 52)
        const col = Math.floor(index / 7);
        // Put a label if there's enough space from the last one (GitHub usually spaces them out roughly every 4-5 cols)
        if (monthsData.length === 0 || col - monthsData[monthsData.length - 1].col > 2) {
          monthsData.push({ label: format(date, 'MMM'), col });
          currentMonth = m;
        }
      }
    });

    return {
      allCells: cells,
      months: monthsData
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
    <div className="github-heatmap-wrapper">
      <div className="github-heatmap-header">
        <span className="contributions-total">{totalActivities} contributions in the last year</span>
        <span className="contributions-settings">Contribution settings <span className="caret">▾</span></span>
      </div>
      
      <div className="github-heatmap-main">
        <div className="activity-heatmap-container">
          <div className="heatmap-months">
            {months.map((m, i) => (
              <span key={i} style={{ gridColumn: m.col + 1 }}>{m.label}</span>
            ))}
          </div>
          
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
            <span className="learn-more">Learn how we count contributions</span>
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
        
        <div className="github-heatmap-years">
          {years.map(year => (
            <button 
              key={year}
              className={`year-btn ${selectedYear === year ? 'active' : ''}`} 
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
