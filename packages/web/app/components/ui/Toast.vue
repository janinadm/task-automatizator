<!--
  Toast Notification Container (Contenedor de notificaciones Toast)
  File: components/ui/Toast.vue

  Renders the stack of active toast notifications in the bottom-right corner.
  
  KEY CONCEPTS:
  1. <Teleport to="body"> — renders toasts outside the normal DOM tree so they always
     appear on top regardless of z-index stacking context issues in nested layouts.
  2. <TransitionGroup> — animates each toast sliding in and out individually.
  3. useToast() shared state — this component reads from the SAME state that the pages
     write to (via useState() key sharing).

  (CONCEPTOS CLAVE:
   1. <Teleport to="body"> — renderiza los toasts fuera del árbol DOM normal para que siempre
      aparezcan encima sin importar el contexto de apilamiento z-index en layouts anidados.
   2. <TransitionGroup> — anima cada toast entrando y saliendo individualmente.
   3. Estado compartido useToast() — este componente lee del MISMO estado que las páginas escriben.)
-->
<script setup lang="ts">
const { toasts, dismiss } = useToast()

// Icon and color config per toast type (Icono y color por tipo de toast)
const typeConfig = {
  info: {
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    bg: 'bg-white/10 border-white/20',
    icon_color: 'text-blue-400',
    title: 'Info',
  },
  success: {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    bg: 'bg-green-500/10 border-green-500/20',
    icon_color: 'text-green-400',
    title: 'Success',
  },
  warning: {
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon_color: 'text-amber-400',
    title: 'Warning',
  },
  error: {
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    bg: 'bg-red-500/10 border-red-500/20',
    icon_color: 'text-red-400',
    title: 'Error',
  },
} as const
</script>

<template>
  <!--
    Teleport renders this section directly inside <body> so it always floats above
    every other element regardless of z-index context.
    (Teleport renderiza esta sección directamente en <body> para que siempre flote
    sobre cualquier otro elemento.)
  -->
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
      <!--
        TransitionGroup handles enter/leave animations for each toast.
        `name="toast"` maps to the .toast-* CSS classes below.
        `tag="div"` wraps the list without adding extra DOM structure.
        (TransitionGroup maneja animaciones de entrada/salida para cada toast.
         `name="toast"` mapea a las clases CSS .toast-* de abajo.)
      -->
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl cursor-pointer select-none"
          :class="typeConfig[toast.type].bg"
          @click="dismiss(toast.id)"
        >
          <!-- Icon (Icono) -->
          <svg
            class="w-5 h-5 mt-0.5 flex-shrink-0"
            :class="typeConfig[toast.type].icon_color"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="typeConfig[toast.type].icon" />
          </svg>

          <!-- Message (Mensaje) -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white leading-snug">{{ toast.message }}</p>
            <p class="text-xs text-white/40 mt-0.5">Click to dismiss</p>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/*
 * TransitionGroup: "toast" transitions
 * These classes animate items in (enter) and out (leave) of the list.
 *
 * ENTER: item fades in from below (slides up while fading in)
 * LEAVE: item fades out to the right (slides right while fading out)
 *
 * (Transiciones de toast: Los items entran desde abajo y salen hacia la derecha)
 */

/* Starting state for entering items (Estado inicial para items que entran) */
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

/* How entering items animate to their final state (Cómo los items que entran animan a su estado final) */
.toast-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Items are fully visible in their normal state (Los items son completamente visibles en su estado normal) */
.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* State during leave animation (Estado durante la animación de salida) */
.toast-leave-active {
  transition: all 0.2s ease-in;
  /* IMPORTANT: position: absolute during leave so other toasts reflow smoothly */
  /* (IMPORTANTE: position: absolute durante la salida para que otros toasts refluyan suavemente) */
  position: absolute;
  width: 100%;
}

/* Final state when leaving (Estado final al salir) */
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

/* Smooth repositioning when items are added/removed (Reposicionamiento suave al añadir/eliminar) */
.toast-move {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
