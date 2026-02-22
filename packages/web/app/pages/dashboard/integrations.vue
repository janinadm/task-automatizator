<!--
  Integrations Page — Channel integration management
  Route: /dashboard/integrations
  Layout: dashboard

  Allows admins to create and manage channel integrations
  (Email, WhatsApp, Slack, Webhooks) that feed tickets into the system.
-->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const toast = useToast()

type Integration = {
  id: string
  type: 'EMAIL_IMAP' | 'EMAIL_SMTP' | 'WHATSAPP' | 'SLACK' | 'WEBHOOK'
  name: string
  isActive: boolean
  webhookUrl: string | null
  lastSyncAt: string | null
  createdAt: string
  updatedAt: string
}

const { data: integrationsData, pending, error, refresh } = await useFetch<{ data: Integration[] }>('/api/integrations', {
  key: 'integrations-data',
})

const integrations = computed(() => integrationsData.value?.data ?? [])

// Create modal state
const showCreateModal = ref(false)
const newName = ref('')
const newType = ref<Integration['type']>('WEBHOOK')
const creating = ref(false)

// Config fields per type
const configFields = ref<Record<string, string>>({})

const typeOptions = [
  { value: 'EMAIL_IMAP', label: 'Email (IMAP)', description: 'Receive emails as tickets', icon: '📧' },
  { value: 'EMAIL_SMTP', label: 'Email (SMTP)', description: 'Send replies via email', icon: '📤' },
  { value: 'WHATSAPP', label: 'WhatsApp', description: 'WhatsApp Business API messages', icon: '💬' },
  { value: 'SLACK', label: 'Slack', description: 'Slack workspace messages', icon: '💼' },
  { value: 'WEBHOOK', label: 'Custom Webhook', description: 'Generic HTTP webhook integration', icon: '🔗' },
]

function getTypeInfo(type: string) {
  return typeOptions.find((t) => t.value === type) ?? { label: type, description: '', icon: '🔧' }
}

async function createIntegration() {
  if (!newName.value.trim()) return
  creating.value = true
  try {
    const res = await $fetch<{ data: Integration & { fullWebhookUrl: string } }>('/api/integrations', {
      method: 'POST',
      body: {
        type: newType.value,
        name: newName.value,
        config: configFields.value,
      },
    })
    toast.success(`Integration "${newName.value}" created`)
    showCreateModal.value = false
    newName.value = ''
    newType.value = 'WEBHOOK'
    configFields.value = {}
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to create integration')
  } finally {
    creating.value = false
  }
}

const togglingId = ref<string | null>(null)

async function toggleActive(integration: Integration) {
  togglingId.value = integration.id
  try {
    await $fetch(`/api/integrations/${integration.id}`, {
      method: 'PATCH',
      body: { isActive: !integration.isActive },
    })
    toast.success(`${integration.name} ${integration.isActive ? 'disabled' : 'enabled'}`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to update integration')
  } finally {
    togglingId.value = null
  }
}

const deletingId = ref<string | null>(null)

async function deleteIntegration(integration: Integration) {
  if (!confirm(`Delete "${integration.name}"? This cannot be undone.`)) return
  deletingId.value = integration.id
  try {
    await $fetch(`/api/integrations/${integration.id}`, { method: 'DELETE' })
    toast.success(`${integration.name} deleted`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Failed to delete integration')
  } finally {
    deletingId.value = null
  }
}

function copyWebhookUrl(url: string) {
  const fullUrl = `${window.location.origin}${url}`
  navigator.clipboard.writeText(fullUrl)
  toast.success('Webhook URL copied!')
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-white">Integrations</h2>
        <p class="text-white/40 text-sm mt-1">
          Connect external channels to receive and respond to tickets
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="showCreateModal = true" class="btn-primary text-sm flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Integration
        </button>
        <button @click="refresh()" class="btn-ghost text-sm flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showCreateModal = false"
      >
        <div class="w-full max-w-lg bg-[#0f0f23]/95 border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-white">New Integration</h3>
            <button @click="showCreateModal = false" class="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
              <svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="createIntegration" class="space-y-5">
            <!-- Type selection -->
            <div>
              <label class="block text-sm text-white/60 mb-3 font-medium">Channel type</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="opt in typeOptions"
                  :key="opt.value"
                  type="button"
                  @click="newType = opt.value as any"
                  class="p-3 rounded-xl border text-left transition-all duration-200"
                  :class="newType === opt.value
                    ? 'border-indigo-500/40 bg-indigo-500/[0.08]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'"
                >
                  <span class="text-lg">{{ opt.icon }}</span>
                  <p class="text-white text-sm font-medium mt-1">{{ opt.label }}</p>
                  <p class="text-white/30 text-xs mt-0.5">{{ opt.description }}</p>
                </button>
              </div>
            </div>

            <!-- Name -->
            <div>
              <label class="block text-sm text-white/60 mb-2 font-medium">Display name</label>
              <input
                v-model="newName"
                type="text"
                placeholder="e.g. Support Email, Sales WhatsApp"
                class="input-glass"
                :disabled="creating"
              />
            </div>

            <!-- Type-specific config hint -->
            <div class="p-4 bg-indigo-500/[0.06] border border-indigo-500/15 rounded-xl">
              <p class="text-indigo-300 text-sm font-medium mb-1">How it works</p>
              <p class="text-white/40 text-xs leading-relaxed">
                <template v-if="newType === 'WEBHOOK'">
                  A unique webhook URL will be generated. Send POST requests to this URL with a JSON body
                  containing <code class="text-white/60">subject</code>, <code class="text-white/60">body</code>,
                  <code class="text-white/60">senderName</code>, and <code class="text-white/60">senderEmail</code>
                  to automatically create tickets.
                </template>
                <template v-else-if="newType === 'EMAIL_IMAP' || newType === 'EMAIL_SMTP'">
                  Configure your email service to forward incoming messages to the generated webhook URL,
                  or set up IMAP polling credentials in the config section after creation.
                </template>
                <template v-else-if="newType === 'WHATSAPP'">
                  Configure the WhatsApp Business API webhook to point to the generated URL.
                  Incoming messages will automatically create tickets.
                </template>
                <template v-else-if="newType === 'SLACK'">
                  Set up a Slack app with Events API and point the webhook URL to the generated endpoint.
                  Channel messages will be converted to tickets.
                </template>
              </p>
            </div>

            <button
              type="submit"
              :disabled="creating || !newName.trim()"
              class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="creating" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ creating ? 'Creating...' : 'Create Integration' }}
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
      <p class="text-red-300">Failed to load integrations.</p>
      <button @click="refresh()" class="btn-primary mt-4 text-sm">Retry</button>
    </div>

    <!-- Integrations List -->
    <template v-else>
      <div v-if="integrations.length === 0" class="glass-card p-16 text-center">
        <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
          <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 class="text-white font-semibold text-lg mb-2">No integrations yet</h3>
        <p class="text-white/40 text-sm mb-6 max-w-md mx-auto">
          Connect external channels like Email, WhatsApp, or Slack to automatically receive customer messages as tickets.
        </p>
        <button @click="showCreateModal = true" class="btn-primary text-sm inline-flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add your first integration
        </button>
      </div>

      <div v-else class="space-y-3">
        <UiGlassCard
          v-for="integration in integrations"
          :key="integration.id"
          padding="md"
          :hover="true"
        >
          <div class="flex items-start gap-4 flex-wrap sm:flex-nowrap">
            <!-- Type icon -->
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              :class="integration.isActive ? 'bg-indigo-500/15' : 'bg-white/[0.04]'"
            >
              {{ getTypeInfo(integration.type).icon }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-white font-semibold" :class="{ 'opacity-50': !integration.isActive }">
                  {{ integration.name }}
                </span>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border"
                  :class="integration.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/[0.06] text-white/40 border-white/10'"
                >
                  {{ integration.isActive ? 'Active' : 'Disabled' }}
                </span>
              </div>
              <p class="text-white/40 text-sm mt-0.5">{{ getTypeInfo(integration.type).label }}</p>

              <!-- Webhook URL -->
              <div v-if="integration.webhookUrl" class="mt-2 flex items-center gap-2">
                <code class="text-xs text-white/30 bg-white/[0.04] px-2 py-1 rounded-lg truncate max-w-xs">
                  {{ integration.webhookUrl }}
                </code>
                <button
                  @click="copyWebhookUrl(integration.webhookUrl!)"
                  class="p-1 rounded hover:bg-white/[0.06] transition-colors flex-shrink-0"
                  title="Copy full URL"
                >
                  <svg class="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>

              <!-- Meta -->
              <div class="flex items-center gap-3 mt-2 text-xs text-white/30">
                <span>Created {{ fmtDate(integration.createdAt) }}</span>
                <span v-if="integration.lastSyncAt">
                  · Last activity {{ fmtRelative(integration.lastSyncAt) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                @click="toggleActive(integration)"
                class="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                :disabled="togglingId === integration.id"
                :title="integration.isActive ? 'Disable' : 'Enable'"
              >
                <svg v-if="togglingId === integration.id" class="w-4 h-4 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg v-else class="w-4 h-4" :class="integration.isActive ? 'text-emerald-400' : 'text-white/30'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    :d="integration.isActive
                      ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'"
                  />
                </svg>
              </button>
              <button
                @click="deleteIntegration(integration)"
                class="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
                :disabled="deletingId === integration.id"
                title="Delete integration"
              >
                <svg v-if="deletingId === integration.id" class="w-4 h-4 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg v-else class="w-4 h-4 text-red-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </UiGlassCard>
      </div>

      <!-- Available channels info -->
      <UiGlassCard padding="md">
        <h3 class="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Supported Channels
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="opt in typeOptions"
            :key="opt.value"
            class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">{{ opt.icon }}</span>
              <span class="text-white/70 text-sm font-medium">{{ opt.label }}</span>
            </div>
            <p class="text-white/30 text-xs">{{ opt.description }}</p>
          </div>
        </div>
      </UiGlassCard>
    </template>
  </div>
</template>
