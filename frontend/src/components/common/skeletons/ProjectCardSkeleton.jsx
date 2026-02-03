import './Skeleton.css';

export default function ProjectCardSkeleton() {
  return (
    <div className="project-card" style={{ pointerEvents: 'none' }}>
      <div className="card-header">
        <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }}></div>
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div className="skeleton skeleton-text" style={{ width: '60%', height: 20, marginBottom: 8 }}></div>
          <div className="skeleton skeleton-text" style={{ width: '40%', height: 14 }}></div>
        </div>
        <div className="skeleton skeleton-rect" style={{ width: 20, height: 20 }}></div>
      </div>
      
      <div className="card-body" style={{ padding: '16px 0' }}>
        <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
      </div>
      
      <div className="card-footer" style={{ border: 'none', padding: 0, marginTop: 16 }}>
        <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
      </div>
    </div>
  );
}
