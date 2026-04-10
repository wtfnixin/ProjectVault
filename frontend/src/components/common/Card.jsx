import { motion } from 'framer-motion';
import './Card.css';

export default function Card({ 
  children, 
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick,
  className = ''
}) {
  const classNames = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    hover && 'card-hover',
    onClick && 'card-clickable',
    className
  ].filter(Boolean).join(' ');

  const MotionWrapper = hover || onClick ? motion.div : 'div';
  const animProps = hover || onClick ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  } : {};

  return (
    <MotionWrapper className={classNames} onClick={onClick} {...animProps}>
      {children}
    </MotionWrapper>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`card-footer ${className}`}>{children}</div>;
}
