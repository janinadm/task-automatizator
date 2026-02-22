<!--
  Dashboard Home Page — with REAL KPI data from /api/dashboard/stats
  (Página de inicio del Dashboard — con datos KPI REALES de /api/dashboard/stats)
  Route: /dashboard
  Layout: dashboard

  HOW useFetch WORKS:
  - Nuxt's useFetch() is a composable that wraps $fetch with SSR support.
  - It runs on the SERVER during SSR (fast initial load: data arrives with HTML).
  - On client navigation (SPA), it refetches in the browser.
  - `data` is reactive — when it updates, the template re-renders automatically.
  - `pending` is true while the request is in flight (use for skeleton loaders).

  (CÓMO FUNCIONA useFetch:
   - Corre en el SERVIDOR durante SSR (datos llegan con el HTML).
   - `data` es reactivo. `pending` es true mientras carga.)
-->
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'dashboard' })

const authStore = useAuthStore()

// Type the expected API response so TypeScript knows what `stats.value.data` contains.
// Without this, useFetch returns Ref<unknown> and we'd get type errors on nested access.
// (Tipar la respuesta esperada de la API para que TypeScript sepa qué contiene `stats.value.data`.)
type DashboardStatsResponse = {
  data: {
    openTickets: number
    resolvedToday: number
    slaBreaching: number
    aiSuggestionsGenerated: number
    sentiment: { positive: number; neutral: number; negative: number }
    priority: { urgent: number; high: number; medium: number; low: number }
    recentTickets: Array<{
      id: string
      subject: string
      status: string
      priority: string
      sentiment: string | null
      category: string | null
      createdAt: string
      isBreachingSla: boolean
    }>
  }
}

// useFetch('/api/dashboard/stats') calls our server API route.
// Nuxt automatically deduplicates this fetch using the `key`.
// (Nuxt deduplica automáticamente este fetch usando la `key`.)
const { data: stats, pending, error, refresh } = await useFetch<DashboardStatsResponse>('/api/dashboard/stats', {
  key: 'dashboard-stats',
})

// Time-based greeting (Saludo según la hora del día)
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

// Build KPI card data from the stats response
// (Construir datos de tarjeta KPI desde la respuesta de stats)
const kpis = computed(() => {
  const s = stats.value?.data
  return [
    {
      label: 'Open Tickets',
      value: s?.openTickets ?? '—',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
      iconColor: 'text-blue-400',
      link: '/dashboard/tickets?status=OPEN',
    },
    {
      label: 'Resolved Today',
      value: s?.resolvedToday ?? '—',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      iconColor: 'text-green-400',
      link: '/dashboard/tickets?status=RESOLVED',
    },
    {
      label: 'SLA Breaching',
      value: s?.slaBreaching ?? '—',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      color: (s?.slaBreaching ?? 0) > 0
        ? 'from-red-500/20 to-orange-500/20 border-red-500/30'
        : 'from-white/5 to-white/5 border-white/10',
      iconColor: (s?.slaBreaching ?? 0) > 0 ? 'text-red-400' : 'text-white/40',
      link: '/dashboard/tickets',
    },
    {
      label: 'AI Suggestions',
      value: s?.aiSuggestionsGenerated ?? '—',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
      iconColor: 'text-purple-400',
      link: '/dashboard/analytics',
    },
  ]
})

// Denominator for sentiment percentage bars (Denominador para barras de porcentaje de sentimiento)
const sentimentTotal = computed(() => {
  const s = stats.value?.data?.sentiment
  return s ? (s.positive + s.neutral + s.negative) || 1 : 1
})

// Display helpers (Helpers de visualización)
const statusConfig: Record<string, { label: string; class: string }> = {
  OPEN: { label: 'Open', class: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  IN_PROGRESS: { label: 'In Progress', class: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  RESOLVED: { label: 'Resolved', class: 'bg-green-500/20 text-green-300 border border-green-500/30' },
  CLOSED: { label: 'Closed', class: 'bg-white/10 text-white/50 border border-white/10' },
}

const priorityConfig: Record<string, { label: string; dot: string }> = {
  URGENT: { label: 'Urgent', dot: 'bg-red-500' },
  HIGH: { label: 'High', dot: 'bg-orange-400' },
  MEDIUM: { label: 'Medium', dot: 'bg-amber-400' },
  LOW: { label: 'Low', dot: 'bg-green-400' },
}

function timeAgo(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page header (Encabezado de página) -->
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white">
          {{ greeting }}, {{ authStore.currentUser?.fullName?.split(' ')[0] || 'there' }} 👋
        </h2>
        <p class="text-white/50 mt-1 text-sm">Here's what's happening with your tickets today.</p>
      </div>
      <!-- Refresh button with loading spinner (Botón de refresco con spinner de carga) -->
      <button
        class="flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all text-sm"
        @click="refresh()"
      >
        <svg
          class="w-4 h-4"
          :class="{ 'animate-spin': pending }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Error state (Estado de error) -->
    <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
      Could not load dashboard data. Check your connection and try refreshing.
    </div>

    <!-- KPI Cards grid (Cuadrícula de tarjetas KPI) -->
    <!-- SKELETON PATTERN: v-if/v-else on the same v-for = not valid; use separate blocks -->
    <!-- (PATRÓN SKELETON: v-if/v-else en el mismo v-for no es válido; usar bloques separados) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <!-- Loading skeletons (Skeletons de carga) -->
      <template v-if="pending">
        <div
          v-for="i in 4"
          :key="i"
          class="h-28 rounded-2xl bg-white/5 animate-pulse"
          :style="{ animationDelay: `${i * 80}ms` }"
        />
      </template>

      <!-- Real KPI cards (Tarjetas KPI reales) -->
      <template v-else>
        <NuxtLink
          v-for="kpi in kpis"
          :key="kpi.label"
          :to="kpi.link"
          class="relative overflow-hidden p-5 rounded-2xl border bg-gradient-to-br transition-all duration-200 hover:scale-[1.02] hover:shadow-glass"
          :class="kpi.color"
        >
          <!-- Icon -->
          <div class="flex items-start justify-between mb-4">
            <svg class="w-6 h-6" :class="kpi.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="kpi.icon" />
            </svg>
          </div>
          <!-- Value + label (Valor + etiqueta) -->
          <p class="text-3xl font-bold text-white mb-1 tabular-nums">{{ kpi.value }}</p>
          <p class="text-sm text-white/60">{{ kpi.label }}</p>
        </NuxtLink>
      </template>
    </div>

    <!-- Main content grid: recent tickets + right sidebar stats -->
    <!-- (Cuadrícula de contenido principal: tickets recientes + sidebar de estadísticas) -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Recent Tickets Table — spans 2 of 3 columns on XL -->
      <!-- (Tabla de tickets recientes — ocupa 2 de 3 columnas en XL) -->
      <UiGlassCard padding="none" class="xl:col-span-2">
        <!-- Card header (Encabezado de tarjeta) -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 class="text-white font-semibold text-sm">Recent Tickets</h3>
          <NuxtLink
            to="/dashboard/tickets"
            class="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
          >
            View all →
          </NuxtLink>
        </div>

        <!-- Loading skeleton for table (Skeleton de tabla mientras carga) -->
        <div v-if="pending" class="p-4 space-y-3">
          <div
            v-for="i in 5"
            :key="i"
            class="h-12 rounded-lg bg-white/5 animate-pulse"
            :style="{ animationDelay: `${i * 60}ms` }"
          />
        </div>

        <!-- Ticket rows (Filas de tickets) -->
        <template v-else>
          <!-- Empty state (Estado vacío) -->
          <div
            v-if="!stats?.data?.recentTickets?.length"
            class="py-12 text-center text-white/30 text-sm"
          >
            No tickets yet — they'll appear here once created.
          </div>

          <!-- Ticket list (Lista de tickets) -->
          <div v-else class="divide-y divide-white/5">
            <NuxtLink
              v-for="ticket in stats?.data?.recentTickets"
              :key="ticket.id"
              :to="`/dashboard/tickets/${ticket.id}`"
              class="flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors group"
            >
              <!-- Priority dot (Punto de prioridad) -->
              <div
                class="w-2 h-2 rounded-full flex-shrink-0"
                :class="priorityConfig[ticket.priority]?.dot ?? 'bg-white/20'"
              />

              <!-- Title + category (Título + categoría) -->
              <div class="flex-1 min-w-0">
                <p class="text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors">
                  {{ ticket.subject }}
                </p>
                <p v-if="ticket.category" class="text-white/40 text-xs">
                  {{ ticket.category }}
                </p>
              </div>

              <!-- Status badge (Insignia de estado) -->
              <span
                class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                :class="statusConfig[ticket.status]?.class"
              >
                {{ statusConfig[ticket.status]?.label }}
              </span>

              <!-- SLA warning icon (Icono de advertencia SLA) -->
              <span
                v-if="ticket.isBreachingSla"
                class="flex-shrink-0 text-red-400"
                title="SLA Breaching"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>

              <!-- Time ago (Hace cuánto tiempo) -->
              <span class="flex-shrink-0 text-white/30 text-xs">
                {{ timeAgo(ticket.createdAt) }}
              </span>
            </NuxtLink>
          </div>
        </template>
      </UiGlassCard>

      <!-- Right column: sentiment + priority stats -->
      <!-- (Columna derecha: stats de sentimiento + prioridad) -->
      <div class="space-y-4">

        <!-- Sentiment Breakdown (Desglose de sentimiento) -->
        <UiGlassCard padding="md">
          <h3 class="text-white font-semibold text-sm mb-4">Sentiment Overview</h3>

          <!-- Skeleton (Skeleton de carga) -->
          <div v-if="pending" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-8 rounded bg-white/5 animate-pulse" />
          </div>

          <!-- Sentiment bars (Barras de sentimiento) -->
          <div v-else class="space-y-3">
            <!-- Positive (Positivo) -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-green-400">😊 Positive</span>
                <span class="text-white/50 tabular-nums">{{ stats?.data?.sentiment?.positive ?? 0 }}</span>
              </div>
              <div class="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  class="h-full rounded-full bg-green-500 transition-all duration-700"
                  :style="{ width: `${((stats?.data?.sentiment?.positive ?? 0) / sentimentTotal) * 100}%` }"
                />
              </div>
            </div>

            <!-- Neutral (Neutral) -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-white/60">😐 Neutral</span>
                <span class="text-white/50 tabular-nums">{{ stats?.data?.sentiment?.neutral ?? 0 }}</span>
              </div>
              <div class="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  class="h-full rounded-full bg-white/40 transition-all duration-700"
                  :style="{ width: `${((stats?.data?.sentiment?.neutral ?? 0) / sentimentTotal) * 100}%` }"
                />
              </div>
            </div>

            <!-- Negative (Negativo) -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-red-400">😡 Negative</span>
                <span class="text-white/50 tabular-nums">{{ stats?.data?.sentiment?.negative ?? 0 }}</span>
              </div>
              <div class="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  class="h-full rounded-full bg-red-500 transition-all duration-700"
                  :style="{ width: `${((stats?.data?.sentiment?.negative ?? 0) / sentimentTotal) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </UiGlassCard>

        <!-- Priority Breakdown (Desglose por prioridad) -->
        <UiGlassCard padding="md">
          <h3 class="text-white font-semibold text-sm mb-4">Tickets by Priority</h3>

          <!-- Skeleton (Skeleton de carga) -->
          <div v-if="pending" class="space-y-2">
            <div v-for="i in 4" :key="i" class="h-7 rounded bg-white/5 animate-pulse" />
          </div>

          <!-- Priority list (Lista de prioridades) -->
          <div v-else class="space-y-2">
            <div
              v-for="(config, key) in priorityConfig"
              :key="key"
              class="flex items-center justify-between py-1"
            >
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="config.dot" />
                <span class="text-white/60 text-sm">{{ config.label }}</span>
              </div>
              <span class="text-white font-semibold tabular-nums text-sm">
                {{ (stats?.data?.priority as any)?.[key.toLowerCase()] ?? 0 }}
              </span>
            </div>
          </div>
        </UiGlassCard>

      </div>
    </div>
  </div>
</template>
