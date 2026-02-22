<!--
  Analytics Page — Charts and metrics for ticket performance
  Route: /dashboard/analytics
  Layout: dashboard

  Displays ticket volume over time, resolution stats,
  channel/status/priority breakdowns, sentiment trends,
  and agent performance leaderboard.

  Uses CSS-only bar charts (no external chart library needed).
-->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

type AnalyticsResponse = {
  data: {
    overview: {
      totalTickets: number
      openTickets: number
      resolvedTickets: number
      avgResolutionHours: number
      resolutionRate: number
      ticketsThisWeek: number
      ticketsToday: number
    }
    dailyVolume: { date: string; count: number }[]
    channels: Record<string, number>
    statuses: Record<string, number>
    priorities: Record<string, number>
    sentiment: { positive: number; neutral: number; negative: number }
    categories: { name: string; count: number }[]
    agentPerformance: { id: string; name: string; avatarUrl: string | null; resolved: number }[]
  }
}

const { data: analytics, pending, error, refresh } = await useFetch<AnalyticsResponse>('/api/analytics', {
  key: 'analytics-data',
})

const stats = computed(() => analytics.value?.data)

// Overview KPIs
const overviewCards = computed(() => {
  const o = stats.value?.overview
  if (!o) return []
  return [
    {
      label: 'Total Tickets',
      value: o.totalTickets,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Resolution Rate',
      value: `${o.resolutionRate}%`,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Avg. Resolution',
      value: o.avgResolutionHours > 0 ? `${o.avgResolutionHours}h` : '—',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'This Week',
      value: o.ticketsThisWeek,
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ]
})

// Max for volume chart
const maxVolume = computed(() => {
  if (!stats.value?.dailyVolume) return 1
  return Math.max(1, ...stats.value.dailyVolume.map((d) => d.count))
})

// Channel labels and colors
const channelConfig: Record<string, { label: string; color: string }> = {
  WEB: { label: 'Web', color: 'bg-blue-400' },
  EMAIL: { label: 'Email', color: 'bg-indigo-400' },
  WHATSAPP: { label: 'WhatsApp', color: 'bg-green-400' },
  SLACK: { label: 'Slack', color: 'bg-purple-400' },
}

// Status colors
const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-blue-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-400' },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-400' },
  CLOSED: { label: 'Closed', color: 'bg-white/40' },
}

// Priority colors
const priorityConfig: Record<string, { label: string; color: string }> = {
  URGENT: { label: 'Urgent', color: 'bg-red-400' },
  HIGH: { label: 'High', color: 'bg-orange-400' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-400' },
  LOW: { label: 'Low', color: 'bg-emerald-400' },
}

// Totals for bar widths
function totalOf(obj: Record<string, number> | undefined) {
  if (!obj) return 1
  return Math.max(1, Object.values(obj).reduce((a, b) => a + b, 0))
}

// Format date like "Jan 15"
function fmtDate(d: string) {
  const dt = new Date(d)
  return dt.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-white">Analytics</h2>
        <p class="text-white/40 text-sm mt-1">Performance metrics and ticket insights</p>
      </div>
      <button @click="refresh()" class="btn-ghost text-sm flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-24">
      <div class="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="glass-card p-8 text-center">
      <p class="text-red-300">Failed to load analytics data.</p>
      <button @click="refresh()" class="btn-primary mt-4 text-sm">Retry</button>
    </div>

    <template v-else-if="stats">
      <!-- Overview KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UiGlassCard
          v-for="card in overviewCards"
          :key="card.label"
          padding="md"
          :hover="true"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-white/50 text-xs uppercase tracking-wider mb-1">{{ card.label }}</p>
              <p class="text-2xl font-bold text-white">{{ card.value }}</p>
            </div>
            <div :class="[card.bg, 'p-2 rounded-xl']">
              <svg :class="['w-5 h-5', card.color]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.icon" />
              </svg>
            </div>
          </div>
        </UiGlassCard>
      </div>

      <!-- Volume Chart (30 days) -->
      <UiGlassCard padding="md">
        <h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Ticket Volume — Last 30 Days
        </h3>

        <div v-if="stats.dailyVolume.length" class="flex items-end gap-[2px] h-32">
          <div
            v-for="day in stats.dailyVolume"
            :key="day.date"
            class="flex-1 group relative"
          >
            <div
              class="bg-indigo-500/60 hover:bg-indigo-400/80 rounded-t-sm transition-all duration-200 w-full"
              :style="{ height: `${Math.max(2, (day.count / maxVolume) * 100)}%` }"
            />
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div class="bg-[#1a1a2e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap shadow-lg">
                {{ fmtDate(day.date) }}: {{ day.count }} ticket{{ day.count !== 1 ? 's' : '' }}
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-white/30 text-sm text-center py-8">No ticket data available</p>

        <!-- X-axis labels (show every 7 days) -->
        <div v-if="stats.dailyVolume.length" class="flex justify-between mt-2 text-white/30 text-[10px]">
          <span v-for="(day, i) in stats.dailyVolume.filter((_: any, idx: number) => idx % 7 === 0)" :key="day.date">
            {{ fmtDate(day.date) }}
          </span>
        </div>
      </UiGlassCard>

      <!-- 3-column grid: Channels, Status, Priority -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- By Channel -->
        <UiGlassCard padding="md">
          <h3 class="text-white font-semibold text-sm mb-4">By Channel</h3>
          <div class="space-y-3">
            <div
              v-for="(cfg, key) in channelConfig"
              :key="key"
            >
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-white/70">{{ cfg.label }}</span>
                <span class="text-white/40">{{ stats.channels[key] ?? 0 }}</span>
              </div>
              <div class="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  :class="[cfg.color, 'h-full rounded-full transition-all duration-500']"
                  :style="{ width: `${((stats.channels[key] ?? 0) / totalOf(stats.channels)) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </UiGlassCard>

        <!-- By Status -->
        <UiGlassCard padding="md">
          <h3 class="text-white font-semibold text-sm mb-4">By Status</h3>
          <div class="space-y-3">
            <div
              v-for="(cfg, key) in statusConfig"
              :key="key"
            >
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-white/70">{{ cfg.label }}</span>
                <span class="text-white/40">{{ stats.statuses[key] ?? 0 }}</span>
              </div>
              <div class="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  :class="[cfg.color, 'h-full rounded-full transition-all duration-500']"
                  :style="{ width: `${((stats.statuses[key] ?? 0) / totalOf(stats.statuses)) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </UiGlassCard>

        <!-- By Priority -->
        <UiGlassCard padding="md">
          <h3 class="text-white font-semibold text-sm mb-4">By Priority</h3>
          <div class="space-y-3">
            <div
              v-for="(cfg, key) in priorityConfig"
              :key="key"
            >
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-white/70">{{ cfg.label }}</span>
                <span class="text-white/40">{{ stats.priorities[key] ?? 0 }}</span>
              </div>
              <div class="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  :class="[cfg.color, 'h-full rounded-full transition-all duration-500']"
                  :style="{ width: `${((stats.priorities[key] ?? 0) / totalOf(stats.priorities)) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </UiGlassCard>
      </div>

      <!-- 2-column: Sentiment + Categories -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Sentiment -->
        <UiGlassCard padding="md">
          <h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sentiment Analysis
          </h3>

          <div class="space-y-4">
            <!-- Positive -->
            <div>
              <div class="flex items-center justify-between text-sm mb-1.5">
                <span class="text-emerald-400 flex items-center gap-1.5">😊 Positive</span>
                <span class="text-white/50">{{ stats.sentiment.positive }}</span>
              </div>
              <div class="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  :style="{ width: `${(stats.sentiment.positive / Math.max(1, stats.sentiment.positive + stats.sentiment.neutral + stats.sentiment.negative)) * 100}%` }"
                />
              </div>
            </div>

            <!-- Neutral -->
            <div>
              <div class="flex items-center justify-between text-sm mb-1.5">
                <span class="text-amber-400 flex items-center gap-1.5">😐 Neutral</span>
                <span class="text-white/50">{{ stats.sentiment.neutral }}</span>
              </div>
              <div class="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  class="h-full bg-amber-500 rounded-full transition-all duration-500"
                  :style="{ width: `${(stats.sentiment.neutral / Math.max(1, stats.sentiment.positive + stats.sentiment.neutral + stats.sentiment.negative)) * 100}%` }"
                />
              </div>
            </div>

            <!-- Negative -->
            <div>
              <div class="flex items-center justify-between text-sm mb-1.5">
                <span class="text-red-400 flex items-center gap-1.5">😠 Negative</span>
                <span class="text-white/50">{{ stats.sentiment.negative }}</span>
              </div>
              <div class="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  class="h-full bg-red-500 rounded-full transition-all duration-500"
                  :style="{ width: `${(stats.sentiment.negative / Math.max(1, stats.sentiment.positive + stats.sentiment.neutral + stats.sentiment.negative)) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </UiGlassCard>

        <!-- Top Categories -->
        <UiGlassCard padding="md">
          <h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Top Categories
          </h3>

          <div v-if="stats.categories.length" class="space-y-3">
            <div v-for="cat in stats.categories" :key="cat.name">
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-white/70 capitalize">{{ cat.name.toLowerCase().replace(/_/g, ' ') }}</span>
                <span class="text-white/40">{{ cat.count }}</span>
              </div>
              <div class="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  class="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  :style="{ width: `${(cat.count / Math.max(1, stats.categories[0]?.count ?? 1)) * 100}%` }"
                />
              </div>
            </div>
          </div>
          <p v-else class="text-white/30 text-sm text-center py-4">No categorized tickets yet. AI will auto-categorize new tickets.</p>
        </UiGlassCard>
      </div>

      <!-- Agent Performance -->
      <UiGlassCard padding="md">
        <h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Agent Performance — Resolved Tickets
        </h3>

        <div v-if="stats.agentPerformance.length" class="space-y-3">
          <div
            v-for="(agent, index) in stats.agentPerformance"
            :key="agent.id"
            class="flex items-center gap-3"
          >
            <span class="text-white/30 text-xs w-5 text-right">#{{ index + 1 }}</span>
            <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm text-indigo-300 font-semibold flex-shrink-0">
              {{ agent.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="text-white/80 text-sm truncate">{{ agent.name }}</span>
                <span class="text-white/40 text-xs">{{ agent.resolved }} resolved</span>
              </div>
              <div class="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  class="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  :style="{ width: `${(agent.resolved / Math.max(1, stats.agentPerformance[0]?.resolved ?? 1)) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-white/30 text-sm text-center py-4">No agent performance data yet. Assign and resolve tickets to see stats.</p>
      </UiGlassCard>
    </template>
  </div>
</template>
