'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

// Fade up animation for sections
export const FadeIn = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { delay?: number; duration?: number }
>(({ children, className, delay = 0, duration = 0.5, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
))
FadeIn.displayName = 'FadeIn'

// Stagger children animations
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { staggerDelay?: number }
>(({ children, className, staggerDelay = 0.1, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
))
StaggerContainer.displayName = 'StaggerContainer'

// Stagger item
export const StaggerItem = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
)
StaggerItem.displayName = 'StaggerItem'

// Scale on hover
export function ScaleOnHover({
  children,
  className,
  scale = 1.02,
}: {
  children: React.ReactNode
  className?: string
  scale?: number
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Slide in from side
export function SlideIn({
  children,
  className,
  direction = 'left',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
}) {
  const directionMap = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: -50 },
    down: { x: 0, y: 50 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Reveal text character by character
export function TextReveal({
  children,
  className,
  delay = 0,
}: {
  children: string
  className?: string
  delay?: number
}) {
  const words = children.split(' ')

  return (
    <motion.span className={cn('inline-flex flex-wrap', className)}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.3,
                delay: delay + (wordIndex * word.length + charIndex) * 0.02,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  )
}

// Counter animation for numbers
export function AnimatedCounter({
  value,
  duration = 2,
  className,
  suffix = '',
  prefix = '',
}: {
  value: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <CountUp value={value} duration={duration} />
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  )
}

function CountUp({ value, duration }: { value: number; duration: number }) {
  return (
    <motion.span
      initial={{ opacity: 1 }}
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ filter: 'blur(4px)' }}
        whileInView={{ filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {value.toLocaleString('pt-PT')}
      </motion.span>
    </motion.span>
  )
}

// Parallax wrapper
export function Parallax({
  children,
  className,
  offset = 50,
}: {
  children: React.ReactNode
  className?: string
  offset?: number
}) {
  return (
    <motion.div
      initial={{ y: offset }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Magnetic button effect
export function MagneticWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={cn('relative', className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  )
}
