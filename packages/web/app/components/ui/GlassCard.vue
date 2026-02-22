<!--
  GlassCard Component (Componente Tarjeta de Cristal)
  The core visual building block of our glassmorphism design system.
  Wraps any content in a frosted-glass card effect.

  Props:
  - variant: 'default' | 'heavy' | 'subtle' — controls opacity/blur intensity
  - padding: 'sm' | 'md' | 'lg' | 'none' — controls internal spacing
  - hover: boolean — adds a hover glow animation
  
  Usage (Uso):
  <GlassCard>Any content here</GlassCard>
  <GlassCard variant="heavy" padding="lg" :hover="true">Premium card</GlassCard>

  (Componente central de nuestro sistema de diseño glassmorfismo.
   Envuelve cualquier contenido en un efecto de tarjeta de cristal esmerilado.)
-->
<script setup lang="ts">
// defineProps: declares what data the parent can pass to this component
// (defineProps: declara qué datos puede pasar el padre a este componente)
const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'heavy' | 'subtle'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hover?: boolean
    as?: string // HTML element to render as (Elemento HTML a renderizar)
  }>(),
  {
    variant: 'default',
    padding: 'md',
    hover: false,
    as: 'div',
  },
)

// Compute CSS classes based on props
// (Calcular clases CSS basadas en las props)
const variantClasses = computed(() => ({
  default: 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-glass',
  heavy: 'bg-white/20 backdrop-blur-xl border border-white/25 rounded-2xl shadow-glass-lg',
  subtle: 'bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-glass-sm',
}[props.variant]))

const paddingClasses = computed(() => ({
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}[props.padding]))

const hoverClasses = computed(() =>
  props.hover
    ? 'transition-all duration-300 hover:bg-white/15 hover:shadow-glass-lg hover:-translate-y-0.5 cursor-pointer'
    : '',
)
</script>

<template>
  <component
    :is="as"
    :class="[variantClasses, paddingClasses, hoverClasses]"
  >
    <slot />
  </component>
</template>
