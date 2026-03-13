type SkeletonVariant = 'text' | 'circle' | 'card' | 'block'

interface SkeletonProps {
  variant?: SkeletonVariant
  width?: number | string
  height?: number | string
  className?: string
}

export default function Skeleton({
  variant = 'block',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const shapeClass = {
    text: 'rounded-full',
    circle: 'rounded-full',
    card: 'rounded-[var(--radius-lg)]',
    block: 'rounded-[var(--radius-md)]',
  }[variant]

  return (
    <div
      className={`skeleton-shimmer ${shapeClass} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
