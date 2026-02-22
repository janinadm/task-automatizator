<!--
  Auth Layout (Layout de Autenticación)
  Wraps all authentication pages: /login, /signup, /confirm
  Provides the dark gradient background that makes glassmorphism shine.
  
  (Envuelve todas las páginas de autenticación: /login, /signup, /confirm
   Proporciona el fondo con gradiente oscuro que hace brillar el glassmorfismo.)
-->
<template>
  <!-- Full-screen gradient background (Fondo con gradiente de pantalla completa) -->
  <div
    class="min-h-screen flex items-center justify-center p-4"
    style="background: linear-gradient(135deg, #0c0a2a 0%, #1a0e35 35%, #1e0a2e 65%, #150a20 100%);"
  >
    <!-- Decorative background blobs for depth (Manchas decorativas de fondo para profundidad) -->
    <div
      class="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    />
    <div
      class="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"
    />
    <div
      class="absolute top-1/2 right-1/4 w-64 h-64 bg-indigo-500/[0.06] rounded-full blur-3xl pointer-events-none"
    />

    <!-- Page content slot (Slot de contenido de la página) -->
    <!-- <slot /> renders whatever page is inside this layout -->
    <!-- (<slot /> renderiza la página que esté dentro de este layout) -->
    <div class="relative z-10 w-full max-w-md animate-fade-in">
      <!-- App branding (Marca de la aplicación) -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-12 h-12 bg-indigo-500 rounded-xl mb-4 shadow-lg shadow-indigo-500/30"
        >
          <!-- Simple icon: lightning bolt represents speed/automation -->
          <!-- (Icono simple: rayo representa velocidad/automatización) -->
          <svg
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-white">Agency Task Automator</h1>
        <p class="text-white/50 text-sm mt-1">AI-powered customer triage</p>
      </div>

      <slot />
    </div>
  </div>
</template>
