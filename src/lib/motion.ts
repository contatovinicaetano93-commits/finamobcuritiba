export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const CARD_HOVER_DARK =
  'relative transition-colors duration-300 hover:bg-[#141414] motion-reduce:transition-none before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:origin-left before:scale-x-0 before:bg-bronze before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:scale-x-100 motion-reduce:before:transition-none'

export const CARD_HOVER_LIGHT =
  'relative transition-colors duration-300 hover:bg-[#f7f3ea] motion-reduce:transition-none before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:origin-left before:scale-x-0 before:bg-bronze before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:scale-x-100 motion-reduce:before:transition-none'
