<!--
  Landing Page (Página de inicio)
  This is the public-facing home page at "/".
  It will eventually become a marketing/landing page.
  For now, it shows a simple welcome with glassmorphism styling.
  (Esta es la página pública de inicio en "/".
   Eventualmente será una landing page de marketing.
   Por ahora muestra una bienvenida simple con estilo glassmorfismo.)
-->
<template>
  <div class="min-h-screen flex items-center justify-center" style="background: linear-gradient(135deg, #0c0a2a 0%, #1a0e35 35%, #1e0a2e 65%, #150a20 100%);">
    <!-- GlassMorphism Card (Tarjeta con efecto glassmorfismo) -->
    <div class="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-glass-lg p-12 max-w-lg text-center">
      <h1 class="text-4xl font-bold text-white mb-4">
        Agency Task Automator
      </h1>
      <p class="text-lg text-white/70 mb-8">
        Intelligent customer service triage powered by AI
      </p>
      <div class="flex gap-4 justify-center">
        <NuxtLink
          to="/login"
          class="px-6 py-3 bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-sm border border-white/[0.12] rounded-xl text-white font-medium transition-all duration-300"
        >
          Log In
        </NuxtLink>
        <NuxtLink
          to="/signup"
          class="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-indigo-500/30"
        >
          Get Started
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
