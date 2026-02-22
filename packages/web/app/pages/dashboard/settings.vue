<!--
  Settings Page — Organization configuration
  Route: /dashboard/settings
  Layout: dashboard

  Sections: Org profile, plan, SLA config.
  Only admins can edit; agents see read-only view.
-->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const toast = useToast()

type SlaConfig = {
  id: string
  priority: string
  maxResponseMinutes: number
}

type SettingsResponse = {
  data: {
    organization: {
      id: string
      name: string
      slug: string
      plan: string
      logoUrl: string | null
      createdAt: string
    }
    slaConfigs: SlaConfig[]
    memberCount: number
    ticketCount: number
    currentUserRole: 'ADMIN' | 'AGENT'
  }
}

const { data: settingsData, pending, error, refresh } = await useFetch<SettingsResponse>('/api/settings', {
  key: 'settings-data',
})

const settings = computed(() => settingsData.value?.data)
const isAdmin = computed(() => settings.value?.currentUserRole === 'ADMIN')

// Org name editing
const editingName = ref(false)
const orgName = ref('')
const savingName = ref(false)

function startEditName() {
  orgName.value = settings.value?.organization.name ?? ''
  editingName.value = true
}

async function saveName() {
  if (!orgName.value.trim()) return
  savingName.value = true
  try {
    await $fetch('/api/settings', {
      method: 'PATCH',
      body: { name: orgName.value },
    })
    toast.success('Organization name updated')
    editingName.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to update name')
  } finally {
    savingName.value = false
  }
}

// SLA config editing
const slaEditing = ref(false)
const slaValues = ref<{ priority: string; maxResponseMinutes: number }[]>([])
const savingSla = ref(false)

const defaultSla = [
  { priority: 'URGENT', maxResponseMinutes: 60, label: 'Urgent' },
  { priority: 'HIGH', maxResponseMinutes: 240, label: 'High' },
  { priority: 'MEDIUM', maxResponseMinutes: 480, label: 'Medium' },
  { priority: 'LOW', maxResponseMinutes: 1440, label: 'Low' },
]

function startEditSla() {
  slaValues.value = defaultSla.map((d) => {
    const existing = settings.value?.slaConfigs.find((c) => c.priority === d.priority)
    return {
      priority: d.priority,
      maxResponseMinutes: existing?.maxResponseMinutes ?? d.maxResponseMinutes,
    }
  })
  slaEditing.value = true
}

async function saveSla() {
  savingSla.value = true
  try {
    await $fetch('/api/settings', {
      method: 'PATCH',
      body: { slaConfigs: slaValues.value },
    })
    toast.success('SLA policies updated')
    slaEditing.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to update SLA')
  } finally {
    savingSla.value = false
  }
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })
}

const planBadgeClass: Record<string, string> = {
  FREE: 'bg-white/10 text-white/60 border-white/10',
  STARTER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  PRO: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  ENTERPRISE: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}
</script>

<template>
  <div class="animate-fade-in space-y-6 max-w-3xl">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-bold text-white">Settings</h2>
      <p class="text-white/40 text-sm mt-1">Manage your organization configuration</p>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-24">
      <div class="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="glass-card p-8 text-center">
      <p class="text-red-300">Failed to load settings.</p>
      <button @click="refresh()" class="btn-primary mt-4 text-sm">Retry</button>
    </div>

    <template v-else-if="settings">
      <!-- Organization Profile -->
      <UiGlassCard padding="md">
        <h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Organization
        </h3>

        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Name</label>
            <div v-if="!editingName" class="flex items-center gap-3">
              <span class="text-white font-medium text-lg">{{ settings.organization.name }}</span>
              <button
                v-if="isAdmin"
                @click="startEditName"
                class="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                title="Edit name"
              >
                <svg class="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <div v-else class="flex items-center gap-2">
              <input
                v-model="orgName"
                type="text"
                class="input-glass flex-1"
                maxlength="100"
                :disabled="savingName"
                @keyup.enter="saveName"
              />
              <button @click="saveName" :disabled="savingName || !orgName.trim()" class="btn-primary text-sm">
                {{ savingName ? 'Saving...' : 'Save' }}
              </button>
              <button @click="editingName = false" class="btn-ghost text-sm">Cancel</button>
            </div>
          </div>

          <!-- Plan -->
          <div>
            <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Plan</label>
            <span
              class="inline-block px-3 py-1 rounded-full text-xs font-semibold border"
              :class="planBadgeClass[settings.organization.plan] ?? planBadgeClass.FREE"
            >
              {{ settings.organization.plan }}
            </span>
          </div>

          <!-- Stats row -->
          <div class="grid grid-cols-3 gap-4 pt-2 border-t border-white/[0.06]">
            <div>
              <p class="text-white font-semibold">{{ settings.memberCount }}</p>
              <p class="text-white/30 text-xs">Team Members</p>
            </div>
            <div>
              <p class="text-white font-semibold">{{ settings.ticketCount }}</p>
              <p class="text-white/30 text-xs">Total Tickets</p>
            </div>
            <div>
              <p class="text-white/50 text-sm">{{ fmtDate(settings.organization.createdAt) }}</p>
              <p class="text-white/30 text-xs">Created</p>
            </div>
          </div>
        </div>
      </UiGlassCard>

      <!-- SLA Configuration -->
      <UiGlassCard padding="md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white font-semibold text-sm flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            SLA Policies
          </h3>
          <button
            v-if="isAdmin && !slaEditing"
            @click="startEditSla"
            class="btn-ghost text-xs"
          >
            Edit
          </button>
        </div>

        <p class="text-white/30 text-xs mb-4">Maximum response time allowed per priority level.</p>

        <!-- Read-only view -->
        <div v-if="!slaEditing" class="space-y-3">
          <div
            v-for="d in defaultSla"
            :key="d.priority"
            class="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full"
                :class="{
                  'bg-red-400': d.priority === 'URGENT',
                  'bg-orange-400': d.priority === 'HIGH',
                  'bg-amber-400': d.priority === 'MEDIUM',
                  'bg-emerald-400': d.priority === 'LOW',
                }"
              />
              <span class="text-white/70 text-sm">{{ d.label }}</span>
            </div>
            <span class="text-white/50 text-sm font-mono">
              {{ formatMinutes(settings.slaConfigs.find((c) => c.priority === d.priority)?.maxResponseMinutes ?? d.maxResponseMinutes) }}
            </span>
          </div>
        </div>

        <!-- Edit view -->
        <div v-else class="space-y-3">
          <div
            v-for="(sla, i) in slaValues"
            :key="sla.priority"
            class="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full"
                :class="{
                  'bg-red-400': sla.priority === 'URGENT',
                  'bg-orange-400': sla.priority === 'HIGH',
                  'bg-amber-400': sla.priority === 'MEDIUM',
                  'bg-emerald-400': sla.priority === 'LOW',
                }"
              />
              <span class="text-white/70 text-sm">{{ defaultSla[i]?.label }}</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="sla.maxResponseMinutes"
                type="number"
                min="1"
                max="10080"
                class="input-glass w-24 text-right text-sm"
                :disabled="savingSla"
              />
              <span class="text-white/30 text-xs w-8">min</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button @click="slaEditing = false" class="btn-ghost text-sm">Cancel</button>
            <button @click="saveSla" :disabled="savingSla" class="btn-primary text-sm">
              {{ savingSla ? 'Saving...' : 'Save SLA' }}
            </button>
          </div>
        </div>
      </UiGlassCard>

      <!-- Danger Zone -->
      <UiGlassCard padding="md">
        <h3 class="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Danger Zone
        </h3>
        <p class="text-white/30 text-xs mb-4">Irreversible actions. Contact support for account deletion.</p>
        <button disabled class="btn-danger text-sm opacity-50 cursor-not-allowed">
          Delete Organization
        </button>
      </UiGlassCard>
    </template>
  </div>
</template>
