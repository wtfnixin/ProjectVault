import './Skeleton.css';

export default function TableSkeleton({ rows = 5 }) {
  return (
    <div className="file-list-container" style={{ border: 'none' }}>
      <table className="files-table">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
             <tr key={i}>
               <td style={{ width: '50%' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div className="skeleton" style={{ width: 18, height: 24 }}></div>
                   <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: 0 }}></div>
                 </div>
               </td>
               <td style={{ width: '15%' }}>
                 <div className="skeleton skeleton-text" style={{ width: '50%', marginBottom: 0 }}></div>
               </td>
               <td style={{ width: '20%' }}>
                 <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: 0 }}></div>
               </td>
               <td style={{ width: '15%' }}>
                 <div className="skeleton skeleton-rect" style={{ width: 60, height: 20 }}></div>
               </td>
             </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
