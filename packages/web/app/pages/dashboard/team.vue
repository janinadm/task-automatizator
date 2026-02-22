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

type InvitationItem = {
  id: string
  email: string
  role: 'ADMIN' | 'AGENT'
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  expiresAt: string
  createdAt: string
  invitedBy: { fullName: string }
}

const { data: teamData, pending, error, refresh } = await useFetch<TeamResponse>('/api/team', {
  key: 'team-data',
})

const members = computed(() => teamData.value?.data.team ?? [])
const isAdmin = computed(() => teamData.value?.data.currentUserRole === 'ADMIN')

// Invitation state
const showInviteModal = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<'ADMIN' | 'AGENT'>('AGENT')
const sendingInvite = ref(false)
const inviteLink = ref('')

const { data: invitationsData, refresh: refreshInvitations } = await useFetch<{ data: InvitationItem[] }>('/api/team/invitations', {
  key: 'team-invitations',
})

const invitations = computed(() => invitationsData.value?.data ?? [])
const pendingInvitations = computed(() => invitations.value.filter((i) => i.status === 'PENDING'))

async function sendInvite() {
  if (!inviteEmail.value.trim()) return
  sendingInvite.value = true
  inviteLink.value = ''
  try {
    const res = await $fetch<{ data: { inviteUrl: string } }>('/api/team/invitations', {
      method: 'POST',
      body: { email: inviteEmail.value, role: inviteRole.value },
    })
    inviteLink.value = res.data.inviteUrl
    toast.success(`Invitation sent to ${inviteEmail.value}`)
    inviteEmail.value = ''
    inviteRole.value = 'AGENT'
    await refreshInvitations()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to send invitation')
  } finally {
    sendingInvite.value = false
  }
}

const revokingId = ref<string | null>(null)

async function revokeInvite(id: string) {
  revokingId.value = id
  try {
    await $fetch(`/api/team/invitations/${id}`, { method: 'DELETE' })
    toast.success('Invitation revoked')
    await refreshInvitations()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to revoke invitation')
  } finally {
    revokingId.value = null
  }
}

function copyLink(text: string) {
  navigator.clipboard.writeText(text)
  toast.success('Invite link copied!')
}

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

function isExpired(d: string) {
  return new Date(d) < new Date()
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
      <div class="flex items-center gap-2">
        <button v-if="isAdmin" @click="showInviteModal = true" class="btn-primary text-sm flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Invite Member
        </button>
        <button @click="refresh(); refreshInvitations()" class="btn-ghost text-sm flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Invite Modal / Overlay -->
    <Teleport to="body">
      <div
        v-if="showInviteModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showInviteModal = false; inviteLink = ''"
      >
        <div class="w-full max-w-md bg-[#0f0f23]/95 border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-white">Invite Team Member</h3>
            <button @click="showInviteModal = false; inviteLink = ''" class="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
              <svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="sendInvite" class="space-y-4">
            <div>
              <label class="block text-sm text-white/60 mb-2 font-medium">Email address</label>
              <input
                v-model="inviteEmail"
                type="email"
                placeholder="colleague@company.com"
                class="input-glass"
                :disabled="sendingInvite"
              />
            </div>

            <div>
              <label class="block text-sm text-white/60 mb-2 font-medium">Role</label>
              <select
                v-model="inviteRole"
                class="input-glass appearance-none"
                style="background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 12px center;"
                :disabled="sendingInvite"
              >
                <option value="AGENT">Agent — Can manage tickets, respond to customers</option>
                <option value="ADMIN">Admin — Full access including settings & AI config</option>
              </select>
            </div>

            <!-- Generated invite link -->
            <div v-if="inviteLink" class="animate-fade-in p-4 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-xl">
              <p class="text-emerald-300 text-sm font-medium mb-2">Invite link generated!</p>
              <div class="flex items-center gap-2">
                <input
                  :value="inviteLink"
                  readonly
                  class="input-glass text-xs flex-1 text-white/60"
                  @focus="($event.target as HTMLInputElement)?.select()"
                />
                <button
                  type="button"
                  @click="copyLink(inviteLink)"
                  class="p-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors flex-shrink-0"
                  title="Copy link"
                >
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
              <p class="text-white/30 text-xs mt-2">Share this link with your team member. It expires in 7 days.</p>
            </div>

            <button
              type="submit"
              :disabled="sendingInvite || !inviteEmail.trim()"
              class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="sendingInvite" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ sendingInvite ? 'Sending...' : 'Send Invitation' }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-24">
      <div class="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="glass-card p-8 text-center">
      <p class="text-red-300">Failed to load team data.</p>
      <button @click="refresh()" class="btn-primary mt-4 text-sm">Retry</button>
    </div>

    <template v-else>
      <!-- Pending Invitations -->
      <div v-if="isAdmin && pendingInvitations.length > 0">
        <h3 class="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Pending Invitations ({{ pendingInvitations.length }})
        </h3>
        <div class="space-y-2">
          <div
            v-for="inv in pendingInvitations"
            :key="inv.id"
            class="flex items-center justify-between px-4 py-3 bg-amber-500/[0.04] border border-amber-500/10 rounded-xl"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-white/80 text-sm truncate">{{ inv.email }}</p>
                <p class="text-white/30 text-xs">
                  {{ inv.role }} · Invited by {{ inv.invitedBy.fullName }} ·
                  <span :class="isExpired(inv.expiresAt) ? 'text-red-400' : ''">
                    {{ isExpired(inv.expiresAt) ? 'Expired' : `Expires ${fmtDate(inv.expiresAt)}` }}
                  </span>
                </p>
              </div>
            </div>
            <button
              @click="revokeInvite(inv.id)"
              :disabled="revokingId === inv.id"
              class="p-2 rounded-lg hover:bg-white/[0.06] transition-colors flex-shrink-0"
              title="Revoke invitation"
            >
              <svg v-if="revokingId === inv.id" class="w-4 h-4 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else class="w-4 h-4 text-red-400/60 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Team Members List -->
      <div>
        <h3 class="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Members</h3>
        <div class="space-y-3">
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
        </div>
      </div>
    </template>
  </div>
</template>
