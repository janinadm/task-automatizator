<!--
  Dashboard Home Page (Página de inicio del Dashboard)
  Route: /dashboard
  
  This is the KPI overview — what every agent/admin sees first after login.
  For now: static placeholder cards that we'll wire up with real data in Phase 4.
  
  (Esta es la vista general de KPIs — lo que cada agente/admin ve primero después del login.
   Por ahora: tarjetas estáticas de placeholder que conectaremos con datos reales en la Fase 4.)
-->
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

// Tell Nuxt to use the 'dashboard' layout for this page
// (Decirle a Nuxt que use el layout 'dashboard' para esta página)
definePageMeta({
  layout: 'dashboard',
})

const authStore = useAuthStore()

// Greeting based on time of day (Saludo basado en la hora del día)
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

// Placeholder KPI data — will be replaced by real /api/dashboard/stats in Phase 4
// (Datos KPI de placeholder — serán reemplazados por /api/dashboard/stats real en Fase 4)
const kpis = [
  {
    label: 'Open Tickets',
    value: '—',
    change: null,
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    label: 'Resolved Today',
    value: '—',
    change: null,
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    iconColor: 'text-green-400',
  },
  {
    label: 'SLA Breaching',
    value: '—',
    change: null,
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    color: 'from-red-500/20 to-orange-500/20 border-red-500/30',
    iconColor: 'text-red-400',
  },
  {
    label: 'AI Suggestions',
    value: '—',
    change: null,
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    iconColor: 'text-purple-400',
  },
]
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Welcome header (Encabezado de bienvenida) -->
    <div>
      <h2 class="text-2xl font-bold text-white">
        {{ greeting }}, {{ authStore.currentUser?.name?.split(' ')[0] || 'there' }} 👋
      </h2>
      <p class="text-white/50 mt-1 text-sm">
        Here's what's happening with your tickets today.
      </p>
    </div>

    <!-- KPI Cards (Tarjetas KPI) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="relative overflow-hidden p-5 rounded-2xl border bg-gradient-to-br"
        :class="kpi.color"
      >
        <!-- Icon (Ícono) -->
        <div class="flex items-start justify-between mb-4">
          <svg class="w-6 h-6" :class="kpi.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="kpi.icon" />
          </svg>
        </div>
        <!-- Value (Valor) -->
        <p class="text-3xl font-bold text-white mb-1">
          {{ kpi.value }}
        </p>
        <!-- Label (Etiqueta) -->
        <p class="text-sm text-white/60">{{ kpi.label }}</p>

        <!-- Coming soon badge (Insignia de próximamente) -->
        <div class="absolute top-3 right-3 text-xs text-white/30 font-mono">
          Phase 4
        </div>
      </div>
    </div>

    <!-- Placeholder content for recent tickets -->
    <!-- (Contenido de placeholder para tickets recientes) -->
    <UiGlassCard padding="lg">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-white font-semibold">Recent Tickets</h3>
        <NuxtLink to="/dashboard/tickets" class="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
          View all →
        </NuxtLink>
      </div>

      <!-- Empty state with animated shimmer (Estado vacío con shimmer animado) -->
      <div class="space-y-3">
        <div
          v-for="i in 4"
          :key="i"
          class="h-14 rounded-xl bg-white/5 animate-pulse"
          :style="{ animationDelay: `${i * 100}ms` }"
        />
      </div>
      <p class="text-center text-white/30 text-xs mt-4">
        Ticket list coming in Phase 5 · (Lista de tickets en Fase 5)
      </p>
    </UiGlassCard>
  </div>
</template>
