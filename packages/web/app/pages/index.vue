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
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-800">
    <!-- GlassMorphism Card (Tarjeta con efecto glassmorfismo) -->
    <div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-12 max-w-lg text-center">
      <h1 class="text-4xl font-bold text-white mb-4">
        Agency Task Automator
      </h1>
      <p class="text-lg text-white/70 mb-8">
        Intelligent customer service triage powered by AI
      </p>
      <div class="flex gap-4 justify-center">
        <NuxtLink
          to="/login"
          class="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-white font-medium transition-all duration-300"
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
