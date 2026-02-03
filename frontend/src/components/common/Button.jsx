import './Button.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  type = 'button',
  className = ''
}) {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    loading && 'btn-loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="btn-spinner" />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  );
}
