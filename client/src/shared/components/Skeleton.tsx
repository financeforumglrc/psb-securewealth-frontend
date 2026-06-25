import { motion } from 'framer-motion';

interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  borderRadius?: number;
  className?: string;
}

export const Skeleton = ({ height = 20, width = '100%', borderRadius = 6, className = '' }: SkeletonProps) => (
  <motion.div
    className={className}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      height,
      width,
      borderRadius,
      background: 'var(--skeleton-bg, #e5e7eb)',
      display: 'block'
    }}
  />
);

export const SkeletonCard = () => (
  <div style={{ padding: '1rem', border: '0.5px solid #e5e7eb', borderRadius: 12 }}>
    <Skeleton height={16} width="60%" />
    <div style={{ marginTop: 8 }} />
    <Skeleton height={32} width="40%" />
    <div style={{ marginTop: 12 }} />
    <Skeleton height={12} width="80%" />
    <div style={{ marginTop: 6 }} />
    <Skeleton height={12} width="60%" />
  </div>
);

export const SkeletonDashboard = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
    {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);
