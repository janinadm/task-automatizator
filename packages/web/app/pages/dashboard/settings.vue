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
      autoAssign: boolean
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

// --- Auto-Assign Toggle ---
const togglingAutoAssign = ref(false)

async function toggleAutoAssign() {
  if (!isAdmin.value || !settings.value) return
  togglingAutoAssign.value = true
  try {
    await $fetch('/api/settings', {
      method: 'PATCH',
      body: { autoAssign: !settings.value.organization.autoAssign },
    })
    toast.success(settings.value.organization.autoAssign ? 'Auto-assign disabled' : 'Auto-assign enabled')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to toggle auto-assign')
  } finally {
    togglingAutoAssign.value = false
  }
}

async function triggerAutoAssign() {
  try {
    const res = await $fetch<{ data: { assignedCount: number } }>('/api/tickets/auto-assign', { method: 'POST' })
    toast.success(`Auto-assigned ${res.data.assignedCount} ticket(s)`)
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Auto-assign failed')
  }
}

// --- Canned Responses Management ---
const cannedResponses = ref<any[]>([])
const loadingCanned = ref(false)
const showCannedForm = ref(false)
const cannedForm = ref({ title: '', body: '', category: '', shortcut: '' })
const savingCanned = ref(false)

async function fetchCannedResponses() {
  loadingCanned.value = true
  try {
    const res = await $fetch<{ data: any[] }>('/api/canned-responses')
    cannedResponses.value = res.data
  } catch { /* ignore */ }
  finally { loadingCanned.value = false }
}

async function createCannedResponse() {
  if (!cannedForm.value.title.trim() || !cannedForm.value.body.trim()) return
  savingCanned.value = true
  try {
    await $fetch('/api/canned-responses', {
      method: 'POST',
      body: {
        title: cannedForm.value.title,
        body: cannedForm.value.body,
        category: cannedForm.value.category || undefined,
        shortcut: cannedForm.value.shortcut || undefined,
      },
    })
    toast.success('Canned response created')
    cannedForm.value = { title: '', body: '', category: '', shortcut: '' }
    showCannedForm.value = false
    await fetchCannedResponses()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to create canned response')
  } finally {
    savingCanned.value = false
  }
}

async function deleteCannedResponse(id: string) {
  try {
    await $fetch(`/api/canned-responses/${id}`, { method: 'DELETE' })
    toast.success('Canned response deleted')
    await fetchCannedResponses()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to delete')
  }
}

onMounted(() => fetchCannedResponses())
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

      <!-- Auto-Assignment -->
      <UiGlassCard padding="md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white font-semibold text-sm flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Auto-Assignment
          </h3>
          <button
            v-if="isAdmin"
            class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
            :class="settings.organization.autoAssign ? 'bg-indigo-500' : 'bg-white/10'"
            :disabled="togglingAutoAssign"
            @click="toggleAutoAssign"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
              :class="settings.organization.autoAssign ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
        <p class="text-white/30 text-xs mb-3">
          When enabled, new tickets are automatically distributed to available agents using round-robin.
        </p>
        <button
          v-if="isAdmin && settings.organization.autoAssign"
          class="btn-ghost text-xs flex items-center gap-1.5"
          @click="triggerAutoAssign"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Assign unassigned tickets now
        </button>
      </UiGlassCard>

      <!-- Canned Responses -->
      <UiGlassCard padding="md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white font-semibold text-sm flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Canned Responses
            <span class="text-white/30 text-xs font-normal">({{ cannedResponses.length }})</span>
          </h3>
          <button
            v-if="isAdmin"
            class="btn-primary text-xs flex items-center gap-1.5"
            @click="showCannedForm = !showCannedForm"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Template
          </button>
        </div>

        <p class="text-white/30 text-xs mb-4">
          Pre-written reply templates agents can insert with one click. Use <code class="text-indigo-400/60">{{ '{{ticket.customerName}}' }}</code> for dynamic values.
        </p>

        <!-- Create form -->
        <Transition name="fade">
          <div v-if="showCannedForm" class="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
            <input
              v-model="cannedForm.title"
              type="text"
              placeholder="Template title (e.g., Greeting)"
              class="input-glass w-full text-sm"
              :disabled="savingCanned"
            />
            <textarea
              v-model="cannedForm.body"
              rows="3"
              placeholder="Template body... (e.g., Hi {{ticket.customerName}}, thanks for reaching out!)"
              class="input-glass w-full text-sm resize-none"
              :disabled="savingCanned"
            />
            <div class="grid grid-cols-2 gap-3">
              <input
                v-model="cannedForm.category"
                type="text"
                placeholder="Category (optional)"
                class="input-glass text-sm"
                :disabled="savingCanned"
              />
              <input
                v-model="cannedForm.shortcut"
                type="text"
                placeholder="Shortcut (e.g., /greet)"
                class="input-glass text-sm"
                :disabled="savingCanned"
              />
            </div>
            <div class="flex items-center justify-end gap-2">
              <button @click="showCannedForm = false" class="btn-ghost text-sm">Cancel</button>
              <button
                @click="createCannedResponse"
                :disabled="savingCanned || !cannedForm.title.trim() || !cannedForm.body.trim()"
                class="btn-primary text-sm"
              >
                {{ savingCanned ? 'Creating...' : 'Create' }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- List -->
        <div v-if="loadingCanned" class="py-6 text-center">
          <div class="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
        </div>
        <div v-else-if="!cannedResponses.length" class="py-6 text-center text-white/30 text-sm">
          No canned responses yet. Create one to help agents reply faster.
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="cr in cannedResponses"
            :key="cr.id"
            class="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-white/80 text-sm font-medium">{{ cr.title }}</span>
                <span v-if="cr.shortcut" class="text-indigo-400/60 text-[10px] font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">{{ cr.shortcut }}</span>
                <span v-if="cr.category" class="text-white/30 text-[10px]">{{ cr.category }}</span>
              </div>
              <p class="text-white/40 text-xs mt-1 line-clamp-2">{{ cr.body }}</p>
              <span class="text-white/20 text-[10px] mt-1 block">Used {{ cr.usageCount }} time{{ cr.usageCount === 1 ? '' : 's' }}</span>
            </div>
            <button
              v-if="isAdmin"
              class="text-white/20 hover:text-red-400 transition-colors flex-shrink-0 p-1"
              @click="deleteCannedResponse(cr.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
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
