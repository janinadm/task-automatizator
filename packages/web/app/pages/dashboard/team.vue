<!--
  Team Management Page
  Route: /dashboard/team
  Layout: dashboard

  Shows all organization members with their roles, stats,
  and allows admins to manage roles and active status.
-->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const toast = useToast()

type TeamMember = {
  id: string
  email: string
  fullName: string
  role: 'ADMIN' | 'AGENT'
  avatarUrl: string | null
  isActive: boolean
  createdAt: string
  assignedTickets: number
  resolvedTickets: number
}

type TeamResponse = {
  data: {
    team: TeamMember[]
    totalMembers: number
    currentUserRole: 'ADMIN' | 'AGENT'
  }
}

const { data: teamData, pending, error, refresh } = await useFetch<TeamResponse>('/api/team', {
  key: 'team-data',
})

const members = computed(() => teamData.value?.data.team ?? [])
const isAdmin = computed(() => teamData.value?.data.currentUserRole === 'ADMIN')

// Role update
const updatingId = ref<string | null>(null)

async function toggleRole(member: TeamMember) {
  if (!isAdmin.value || updatingId.value) return

  const newRole = member.role === 'ADMIN' ? 'AGENT' : 'ADMIN'

  updatingId.value = member.id
  try {
    await $fetch(`/api/team/${member.id}`, {
      method: 'PATCH',
      body: { role: newRole },
    })
    toast.success(`${member.fullName} is now ${newRole === 'ADMIN' ? 'an Admin' : 'an Agent'}`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to update role')
  } finally {
    updatingId.value = null
  }
}

async function toggleActive(member: TeamMember) {
  if (!isAdmin.value || updatingId.value) return

  updatingId.value = member.id
  try {
    await $fetch(`/api/team/${member.id}`, {
      method: 'PATCH',
      body: { isActive: !member.isActive },
    })
    toast.success(`${member.fullName} has been ${member.isActive ? 'deactivated' : 'activated'}`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to update status')
  } finally {
    updatingId.value = null
  }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-white">Team</h2>
        <p class="text-white/40 text-sm mt-1">
          {{ members.length }} member{{ members.length !== 1 ? 's' : '' }} in your organization
        </p>
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
      <p class="text-red-300">Failed to load team data.</p>
      <button @click="refresh()" class="btn-primary mt-4 text-sm">Retry</button>
    </div>

    <!-- Team List -->
    <div v-else class="space-y-3">
      <UiGlassCard
        v-for="member in members"
        :key="member.id"
        padding="md"
        :hover="true"
      >
        <div class="flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <!-- Avatar -->
          <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0"
            :class="member.isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.06] text-white/30'"
          >
            {{ member.fullName?.charAt(0)?.toUpperCase() ?? '?' }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-white font-semibold truncate" :class="{ 'opacity-50': !member.isActive }">
                {{ member.fullName }}
              </span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold"
                :class="member.role === 'ADMIN'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'"
              >
                {{ member.role }}
              </span>
              <span
                v-if="!member.isActive"
                class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30"
              >
                Inactive
              </span>
            </div>
            <p class="text-white/40 text-sm truncate">{{ member.email }}</p>
            <p class="text-white/30 text-xs mt-0.5">Joined {{ fmtDate(member.createdAt) }}</p>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 text-center">
            <div>
              <p class="text-white font-semibold">{{ member.assignedTickets }}</p>
              <p class="text-white/30 text-[10px] uppercase tracking-wider">Assigned</p>
            </div>
            <div>
              <p class="text-emerald-400 font-semibold">{{ member.resolvedTickets }}</p>
              <p class="text-white/30 text-[10px] uppercase tracking-wider">Resolved</p>
            </div>
          </div>

          <!-- Admin Actions -->
          <div v-if="isAdmin" class="flex items-center gap-2 flex-shrink-0">
            <button
              @click="toggleRole(member)"
              class="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
              :disabled="updatingId === member.id"
              :title="member.role === 'ADMIN' ? 'Demote to Agent' : 'Promote to Admin'"
            >
              <svg v-if="updatingId === member.id" class="w-4 h-4 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  :d="member.role === 'ADMIN'
                    ? 'M19 9l-7 7-7-7'
                    : 'M5 15l7-7 7 7'"
                />
              </svg>
            </button>
            <button
              @click="toggleActive(member)"
              class="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
              :disabled="updatingId === member.id"
              :title="member.isActive ? 'Deactivate' : 'Activate'"
            >
              <svg class="w-4 h-4" :class="member.isActive ? 'text-emerald-400' : 'text-red-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  :d="member.isActive
                    ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'"
                />
              </svg>
            </button>
          </div>
        </div>
      </UiGlassCard>

      <!-- Empty state -->
      <div v-if="members.length === 0" class="glass-card p-12 text-center">
        <svg class="w-12 h-12 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p class="text-white/40">No team members found</p>
      </div>

      <!-- Info -->
      <div class="p-4 bg-indigo-500/[0.06] border border-indigo-500/20 rounded-xl flex items-start gap-3">
        <svg class="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="text-indigo-300 text-sm font-medium">Team members are added when they sign up</p>
          <p class="text-white/40 text-xs mt-1">Share your organization's signup link with teammates. They'll automatically join your org when they create an account.</p>
        </div>
      </div>
    </div>
  </div>
</template>
