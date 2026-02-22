<!--
  Dashboard Layout (Layout del Dashboard)
  File: layouts/dashboard.vue
  
  This layout wraps all pages under /dashboard/* routes.
  It provides the standard agency dashboard UI: sidebar + header + main content area.
  
  ARCHITECTURE:
  - The Nuxt router handles which page goes in <slot /> (the main content area)
  - The sidebar navigation links use NuxtLink which handles active states automatically
  - The auth store provides current user data (fetched once, shared everywhere)
  - Mobile: collapsible sidebar (toggle button shows/hides it)
  - Desktop: fixed sidebar always visible
  
  (Este layout envuelve todas las páginas bajo las rutas /dashboard/*.
   Proporciona la UI estándar del dashboard de agencia: sidebar + header + área de contenido.
   
   ARQUITECTURA:
   - El router de Nuxt maneja qué página va en <slot /> (el área de contenido principal)
   - Los enlaces de navegación del sidebar usan NuxtLink que maneja estados activos automáticamente
   - El store de auth provee datos del usuario actual (obtenidos una vez, compartidos en todas partes)
   - Móvil: sidebar colapsable (botón de toggle muestra/oculta)
   - Escritorio: sidebar fijo siempre visible)
-->
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

// useAuthStore() accesses our global auth state (from Pinia)
// (useAuthStore() accede a nuestro estado de auth global (de Pinia))
const authStore = useAuthStore()

// Hydrate the auth store when the dashboard first loads
// (Hidratar el store de auth cuando el dashboard carga por primera vez)
if (!authStore.isInitialized) {
  await authStore.fetchCurrentUser()
}

const isSidebarOpen = ref(false)

// --- Notification Panel ---
const showNotifications = ref(false)
const notifLoading = ref(false)

type Notification = {
  id: string
  type: 'new_ticket' | 'customer_message' | 'sla_breach' | 'ai_suggestion'
  title: string
  description: string
  ticketId: string | null
  createdAt: string
  priority?: string
}

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)

async function fetchNotifications() {
  notifLoading.value = true
  try {
    const res = await $fetch<{ data: { notifications: Notification[], unreadCount: number } }>('/api/notifications')
    notifications.value = res.data.notifications
    unreadCount.value = res.data.unreadCount
  } catch { /* silently fail */ }
  finally { notifLoading.value = false }
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) fetchNotifications()
}

function closeNotifications() {
  showNotifications.value = false
}

function notifIcon(type: string) {
  switch (type) {
    case 'new_ticket': return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    case 'customer_message': return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    case 'sla_breach': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    case 'ai_suggestion': return 'M13 10V3L4 14h7v7l9-11h-7z'
    default: return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
  }
}

function notifColor(type: string) {
  switch (type) {
    case 'new_ticket': return 'text-blue-400'
    case 'customer_message': return 'text-emerald-400'
    case 'sla_breach': return 'text-red-400'
    case 'ai_suggestion': return 'text-purple-400'
    default: return 'text-white/40'
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// Load notification count on mount
onMounted(() => fetchNotifications())

// Navigation items — each page in the app (Elementos de navegación — cada página de la app)
const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', // folder icon
    exactMatch: true, // Only active when exactly /dashboard (Solo activo en exactamente /dashboard)
  },
  {
    name: 'Tickets',
    href: '/dashboard/tickets',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

// useRoute gives us the current route — needed to highlight active nav items
// (useRoute nos da la ruta actual — necesario para resaltar elementos de nav activos)
const route = useRoute()

function isActiveRoute(href: string, exactMatch = false) {
  if (exactMatch) {
    return route.path === href
  }
  return route.path.startsWith(href)
}

// Plan badge colors (Colores de insignia de plan)
const planColors: Record<string, string> = {
  FREE: 'text-white/50',
  STARTER: 'text-blue-400',
  PRO: 'text-indigo-400',
  ENTERPRISE: 'text-amber-400',
}
</script>

<template>
  <div class="flex h-screen bg-app-gradient overflow-hidden">
    <!-- Mobile Sidebar Overlay (Overlay de sidebar móvil) -->
    <!-- Clicking the dark overlay closes the sidebar on mobile -->
    <!-- (Hacer clic en el overlay oscuro cierra el sidebar en móvil) -->
    <Transition name="fade">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        @click="isSidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar (Barra lateral) -->
    <!-- On desktop (lg+): always visible. On mobile: slides in/out via translate -->
    <!-- (En escritorio: siempre visible. En móvil: se desliza con translate) -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex flex-col h-full bg-[#0d0b24]/90 backdrop-blur-xl border-r border-white/[0.06]">
          <!-- Logo / Brand (Logo / Marca) -->
          <div class="flex items-center gap-3 p-6 border-b border-white/10">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow flex-shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-white font-semibold text-sm truncate">
                {{ authStore.organization?.name || 'Agency' }}
              </p>
              <p class="text-xs" :class="planColors[authStore.plan]">
                {{ authStore.plan }} plan
              </p>
            </div>
          </div>

          <!-- Navigation (Navegación) -->
          <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <NuxtLink
              v-for="item in navigation"
              :key="item.href"
              :to="item.href"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
              :class="isActiveRoute(item.href, item.exactMatch)
                ? 'bg-indigo-500/20 text-white shadow-glass-sm border border-indigo-500/30'
                : 'text-white/60 hover:bg-white/5 hover:text-white'"
              @click="isSidebarOpen = false"
            >
              <svg
                class="w-5 h-5 flex-shrink-0 transition-colors"
                :class="isActiveRoute(item.href, item.exactMatch) ? 'text-indigo-400' : 'text-white/40 group-hover:text-white/60'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
              </svg>
              {{ item.name }}
            </NuxtLink>
          </nav>

          <!-- User Profile Section (Sección de perfil de usuario) -->
          <div class="p-4 border-t border-white/10">
            <div class="flex items-center gap-3 px-3 py-2">
              <!-- Avatar (initial letter as placeholder) (Avatar — letra inicial como placeholder) -->
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {{ authStore.currentUser?.fullName?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-white text-sm font-medium truncate">
                  {{ authStore.currentUser?.fullName || 'User' }}
                </p>
                <p class="text-white/40 text-xs truncate">
                  {{ authStore.currentUser?.role?.toLowerCase() }}
                </p>
              </div>
              <!-- Logout button (Botón de cierre de sesión) -->
              <button
                class="text-white/30 hover:text-red-400 transition-colors"
                title="Sign out"
                @click="authStore.logout"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

    <!-- Main content area (Área de contenido principal) -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Header (Encabezado superior) -->
      <header class="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
        <!-- Mobile menu button (Botón de menú móvil) -->
        <button
          class="lg:hidden text-white/60 hover:text-white transition-colors"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Page title: rendered by each page via provide/inject or just route name -->
        <!-- (Título de página: renderizado por cada página o por el nombre de ruta) -->
        <h1 class="text-white font-semibold text-lg flex-1">
          <!-- The currently active nav item's name, or fallback -->
          {{ navigation.find(n => isActiveRoute(n.href, n.exactMatch))?.name || 'Dashboard' }}
        </h1>

        <!-- Header right: quick actions (Derecha del header: acciones rápidas) -->
        <div class="flex items-center gap-3">
          <!-- New ticket shortcut (Atajo de nuevo ticket) -->
          <NuxtLink
            to="/dashboard/tickets/new"
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </NuxtLink>

          <!-- Notification bell (Campana de notificaciones) -->
          <div class="relative">
            <button
              class="relative text-white/50 hover:text-white transition-colors"
              @click="toggleNotifications"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <!-- Badge count -->
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center"
              >
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>
            </button>

            <!-- Notification dropdown panel -->
            <Transition name="fade">
              <div
                v-if="showNotifications"
                class="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[28rem] bg-[#12101f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <!-- Header -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <h3 class="text-white font-semibold text-sm">Notifications</h3>
                  <button @click="closeNotifications" class="text-white/30 hover:text-white/60 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Loading -->
                <div v-if="notifLoading" class="flex items-center justify-center py-8">
                  <div class="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
                </div>

                <!-- Notifications list -->
                <div v-else-if="notifications.length" class="overflow-y-auto max-h-[22rem] divide-y divide-white/[0.04]">
                  <NuxtLink
                    v-for="n in notifications"
                    :key="n.id"
                    :to="n.ticketId ? `/dashboard/tickets/${n.ticketId}` : '/dashboard'"
                    class="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors block"
                    @click="closeNotifications"
                  >
                    <div class="mt-0.5 flex-shrink-0">
                      <svg :class="['w-4 h-4', notifColor(n.type)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="notifIcon(n.type)" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-white/80 text-sm font-medium">{{ n.title }}</span>
                        <span
                          v-if="n.priority === 'URGENT'"
                          class="px-1.5 py-0.5 bg-red-500/20 text-red-300 text-[9px] rounded-full uppercase font-bold"
                        >
                          Urgent
                        </span>
                      </div>
                      <p class="text-white/40 text-xs mt-0.5 truncate">{{ n.description }}</p>
                      <p class="text-white/20 text-[10px] mt-1">{{ timeAgo(n.createdAt) }}</p>
                    </div>
                  </NuxtLink>
                </div>

                <!-- Empty -->
                <div v-else class="py-8 text-center">
                  <svg class="w-8 h-8 mx-auto text-white/10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p class="text-white/30 text-sm">No notifications yet</p>
                  <p class="text-white/20 text-xs mt-1">Create tickets to see activity here</p>
                </div>
              </div>
            </Transition>

            <!-- Click-outside overlay to close (below the dropdown) -->
            <div
              v-if="showNotifications"
              class="fixed inset-0 z-40"
              @click.self="closeNotifications"
            />
          </div>
        </div>
      </header>

      <!-- Page content — Nuxt injects the current page here via <slot /> -->
      <!-- (Contenido de página — Nuxt inyecta la página actual aquí vía <slot />) -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>

  <!--
    Toast container — teleports to <body> (see Toast.vue).
    Placed here so it's alive for the entire dashboard session.
    (Contenedor de toasts — usa Teleport a <body>. Colocado aquí para que viva
    durante toda la sesión del dashboard.)
  -->
  <UiToast />
</template>

<style scoped>
/* Vue transition classes for the mobile sidebar overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
