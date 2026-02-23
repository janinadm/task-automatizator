// Nuxt Configuration (Configuración de Nuxt)
// This is the central config file for our Nuxt 3 application.
// Here we register modules, configure build options, and set up runtime behavior.
// (Este es el archivo central de configuración de nuestra app Nuxt 3.
//  Aquí registramos módulos, configuramos opciones de build y comportamiento en runtime.)

export default defineNuxtConfig({
  // compatibilityDate ensures consistent behavior across Nuxt versions
  // (compatibilityDate asegura comportamiento consistente entre versiones de Nuxt)
  compatibilityDate: '2025-07-15',

  // === Nitro Server Config ===
  // preset: 'vercel' tells Nitro to output to .vercel/output (Vercel's expected format)
  // Vercel auto-detects this and deploys serverless functions correctly.
  // In local dev, Nuxt ignores this and uses its own dev server.
  // (preset: 'vercel' le dice a Nitro que genere en .vercel/output — el formato que espera Vercel)
  nitro: {
    preset: 'vercel',
  },

  // Enable Vue DevTools for debugging in development
  // (Habilitar Vue DevTools para depuración en desarrollo)
  devtools: { enabled: true },

  // === Nuxt Modules (Módulos de Nuxt) ===
  // Modules extend Nuxt's functionality — they auto-configure tools like Tailwind, Pinia, and Supabase
  // (Los módulos extienden la funcionalidad de Nuxt — auto-configuran herramientas como Tailwind, Pinia y Supabase)
  modules: [
    '@nuxtjs/tailwindcss',  // Utility-first CSS framework (Framework CSS de utilidades)
    '@pinia/nuxt',          // State management for Vue 3 (Gestión de estado para Vue 3)
    '@nuxtjs/supabase',     // Supabase integration: Auth, DB, Realtime (Integración con Supabase)
  ],

  // === Global CSS (CSS global) ===
  // Our custom CSS with @tailwind directives + glassmorphism components + dark theme
  // (Nuestro CSS personalizado con directivas @tailwind + componentes glassmorfismo + tema oscuro)
  css: ['~/assets/css/main.css'],

  // === Tailwind Module Config (Configuración del módulo Tailwind) ===
  // cssPath: false prevents the module from injecting its own CSS file,
  // since we already include @tailwind directives in our main.css
  // (cssPath: false evita que el módulo inyecte su propio CSS,
  //  ya que incluimos las directivas @tailwind en nuestro main.css)
  tailwindcss: {
    cssPath: false,
  },

  // === Supabase Configuration (Configuración de Supabase) ===
  // The module reads SUPABASE_URL and SUPABASE_KEY from .env automatically
  // (El módulo lee SUPABASE_URL y SUPABASE_KEY del .env automáticamente)
  supabase: {
    redirectOptions: {
      login: '/login',           // Redirect here if not authenticated (Redirigir aquí si no autenticado)
      callback: '/confirm',      // OAuth callback URL (URL de callback para OAuth)
      include: ['/dashboard(/*)?'], // Protect these routes (Proteger estas rutas)
      exclude: ['/', '/signup', '/login'], // Public routes (Rutas públicas)
    },
  },

  // === Runtime Config (Configuración de Runtime) ===
  // Variables accessible at runtime. 'public' vars are exposed to the client.
  // 'private' vars (top level) are server-only — NEVER expose API keys to the browser!
  // (Variables accesibles en runtime. Las 'public' se exponen al cliente.
  //  Las privadas (nivel superior) son solo del servidor — ¡NUNCA exponer API keys al navegador!)
  runtimeConfig: {
    // Server-only (Solo servidor) — these come from process.env automatically
    geminiApiKey: '',          // NUXT_GEMINI_API_KEY
    supabaseServiceRoleKey: '', // NUXT_SUPABASE_SERVICE_ROLE_KEY
    cronSecret: '',            // NUXT_CRON_SECRET — to validate cron job requests
    public: {
      // Client-accessible (Accesible desde el cliente) — safe to expose
      appName: 'AuraDesk',
      // Supabase URL is public (it's in the Supabase dashboard, not a secret)
      // We need it on the server too for creating admin clients
      // (La URL de Supabase es pública — también la necesitamos en el servidor para clientes admin)
      supabaseUrl: process.env.SUPABASE_URL || '',
    },
  },

  // === TypeScript Configuration (Configuración de TypeScript) ===
  typescript: {
    strict: true,    // Enable strict mode for better type safety (Modo estricto para mejor seguridad de tipos)
    shim: false,     // Not needed in Nuxt 4 (No necesario en Nuxt 4)
  },

  // === App Metadata (Metadatos de la aplicación) ===
  app: {
    head: {
      title: 'AuraDesk — Intelligent Customer Triage',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'AI-powered customer service triage platform. Reduce response time by 60% with automated sentiment analysis and intelligent routing.',
        },
      ],
      link: [
        // Favicon
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // Google Fonts — Inter for UI, clean and modern
        // (Google Fonts — Inter para la interfaz, limpia y moderna)
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
        },
      ],
    },
  },
})
