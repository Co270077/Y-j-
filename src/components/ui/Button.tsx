import { forwardRef, type ButtonHTMLAttributes } from 'react'
import * as m from 'motion/react-m'
import { snappy } from '../../motion/transitions'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-white text-black hover:bg-gray-100 active:bg-gray-100',
  secondary: 'bg-surface-raised text-text-primary border border-gray-700 hover:bg-surface-overlay',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-raised',
  danger: 'bg-danger/15 text-danger hover:bg-danger/25',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-sm)]',
  md: 'px-4 py-2.5 text-sm rounded-[var(--radius-md)]',
  lg: 'px-6 py-3 text-base rounded-[var(--radius-md)]',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}, ref) {
  return (
    <m.button
      ref={ref}
      whileTap={!props.disabled ? { scale: 0.97, transition: snappy } : undefined}
      className={`
        inline-flex items-center justify-center font-medium
        transition-colors duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </m.button>
  )
})

export default Button
