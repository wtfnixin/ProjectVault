import './Skeleton.css';

export default function ActivitySkeleton() {
  return (
    <div className="activity-list">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="activity-item" style={{ pointerEvents: 'none', display: 'flex', gap: 12, padding: '12px 0' }}>
          <div className="skeleton skeleton-circle" style={{ width: 32, height: 32, flexShrink: 0 }}></div>
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" style={{ width: '70%', height: 14, marginBottom: 6 }}></div>
            <div className="skeleton skeleton-text" style={{ width: '30%', height: 12 }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
