<!--
  Customer Portal — Public self-service page
  Route: /portal
  Layout: default (no dashboard sidebar)

  Features:
  - Ticket lookup by email + org slug
  - View ticket status and last message
  - Browse published knowledge base articles
  - No authentication required
-->
<script setup lang="ts">
definePageMeta({ layout: false })

// --- State ---
const orgSlug = ref('')
const email = ref('')
const activeTab = ref<'tickets' | 'articles'>('articles')
const loading = ref(false)
const error = ref('')
const orgName = ref('')
const hasSearched = ref(false)

// Tickets
type PortalTicket = {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  lastMessage: {
    body: string
    senderType: string
    createdAt: string
  } | null
}
const tickets = ref<PortalTicket[]>([])

// Articles
type PortalArticle = {
  id: string
  title: string
  slug: string
  category: string | null
  views: number
  createdAt: string
  updatedAt: string
}
const articles = ref<PortalArticle[]>([])
const articleCategories = ref<string[]>([])
const selectedCategory = ref('')
const articleSearch = ref('')
const selectedArticle = ref<{ title: string; body: string; category: string | null; views: number } | null>(null)
const loadingArticle = ref(false)

// --- Computed ---
const filteredArticles = computed(() => {
  let list = articles.value
  if (selectedCategory.value) {
    list = list.filter(a => a.category === selectedCategory.value)
  }
  if (articleSearch.value.trim()) {
    const q = articleSearch.value.toLowerCase()
    list = list.filter(a => a.title.toLowerCase().includes(q))
  }
  return list
})

// --- API ---
async function lookupTickets() {
  if (!email.value.trim() || !orgSlug.value.trim()) {
    error.value = 'Please enter both your email and organization ID'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<{ data: { orgName: string; tickets: PortalTicket[] } }>('/api/portal/tickets', {
      query: { email: email.value.trim(), org: orgSlug.value.trim() },
    })
    orgName.value = res.data.orgName
    tickets.value = res.data.tickets
    hasSearched.value = true
    activeTab.value = 'tickets'
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not find tickets. Please check your email and organization ID.'
  } finally {
    loading.value = false
  }
}

async function fetchArticles() {
  if (!orgSlug.value.trim()) return
  loading.value = true
  try {
    const res = await $fetch<{ data: { orgName: string; articles: PortalArticle[]; categories: string[] } }>('/api/portal/articles', {
      query: { org: orgSlug.value.trim() },
    })
    orgName.value = res.data.orgName
    articles.value = res.data.articles
    articleCategories.value = res.data.categories
  } catch { /* silent */ }
  finally { loading.value = false }
}

async function viewArticle(article: PortalArticle) {
  loadingArticle.value = true
  try {
    const res = await $fetch<{ data: { title: string; body: string; category: string | null; views: number } }>(`/api/portal/articles/${article.id}`, {
      query: { org: orgSlug.value.trim() },
    })
    selectedArticle.value = {
      title: res.data.title,
      body: res.data.body,
      category: res.data.category,
      views: res.data.views,
    }
  } catch {
    selectedArticle.value = {
      title: article.title,
      body: 'Could not load article content. Please try again.',
      category: article.category,
      views: article.views,
    }
  } finally {
    loadingArticle.value = false
  }
}

function closeArticle() {
  selectedArticle.value = null
}

// --- Helpers ---
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  OPEN: { label: 'Open', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  CLOSED: { label: 'Closed', color: 'text-white/40', bg: 'bg-white/5' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  URGENT: { label: 'Urgent', color: 'text-red-400' },
  HIGH: { label: 'High', color: 'text-orange-400' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400' },
  LOW: { label: 'Low', color: 'text-emerald-400' },
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

// Auto-fetch articles when org slug changes
watch(orgSlug, (val) => {
  if (val.trim().length >= 2) {
    fetchArticles()
  }
})

// Read org slug from URL query param on mount
const route = useRoute()
onMounted(() => {
  const queryOrg = route.query.org as string | undefined
  if (queryOrg) {
    orgSlug.value = queryOrg
    fetchArticles()
  }
})
</script>

<template>
  <div class="min-h-screen bg-app-gradient">
    <!-- Header -->
    <header class="border-b border-white/10 bg-[#0d0b24]/80 backdrop-blur-xl">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
        <img src="/logo.svg" alt="AuraDesk" class="w-8 h-8" />
        <h1 class="text-white font-bold text-lg">
          <span v-if="orgName">{{ orgName }}</span>
          <span v-else>AuraDesk</span>
          <span class="text-white/40 font-normal"> — Customer Portal</span>
        </h1>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <!-- Lookup Form -->
      <div class="glass-card p-6 space-y-4">
        <h2 class="text-white font-semibold text-lg">Find your tickets & help articles</h2>
        <p class="text-white/50 text-sm">Enter your organization's ID and email to look up your support tickets, or browse the knowledge base.</p>

        <div class="flex flex-wrap gap-3">
          <input
            v-model="orgSlug"
            type="text"
            placeholder="Organization ID (e.g. acme-corp)"
            class="input-glass flex-1 min-w-[200px] text-sm"
          />
          <input
            v-model="email"
            type="email"
            placeholder="Your email address"
            class="input-glass flex-1 min-w-[200px] text-sm"
          />
          <button
            @click="lookupTickets"
            :disabled="loading"
            class="btn-primary text-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <div v-if="loading" class="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Look up tickets
          </button>
        </div>

        <div v-if="error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {{ error }}
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          @click="activeTab = 'articles'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="activeTab === 'articles'
            ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
            : 'text-white/50 hover:text-white hover:bg-white/5'"
        >
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Help Articles
          </span>
        </button>
        <button
          @click="activeTab = 'tickets'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="activeTab === 'tickets'
            ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
            : 'text-white/50 hover:text-white hover:bg-white/5'"
        >
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Tickets
            <span v-if="tickets.length > 0" class="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
              {{ tickets.length }}
            </span>
          </span>
        </button>
      </div>

      <!-- Articles Tab -->
      <div v-if="activeTab === 'articles'" class="space-y-4">
        <template v-if="articles.length > 0">
          <!-- Article filters -->
          <div class="flex flex-wrap gap-3">
            <div class="relative flex-1 min-w-[200px]">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="articleSearch"
                type="text"
                placeholder="Search articles..."
                class="input-glass w-full pl-10 text-sm"
              />
            </div>
            <select v-if="articleCategories.length > 0" v-model="selectedCategory" class="input-glass text-sm min-w-[140px]">
              <option value="">All categories</option>
              <option v-for="cat in articleCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Article cards -->
          <div class="grid gap-3 md:grid-cols-2">
            <div
              v-for="article in filteredArticles"
              :key="article.id"
              class="glass-card p-4 hover:border-white/20 transition-all duration-200 cursor-pointer group"
              @click="viewArticle(article)"
            >
              <div class="flex items-start gap-3">
                <div class="p-2 rounded-lg bg-indigo-500/10 flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-medium text-sm group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {{ article.title }}
                  </h3>
                  <div class="flex items-center gap-3 mt-1.5 text-[11px] text-white/40">
                    <span v-if="article.category" class="px-1.5 py-0.5 rounded bg-white/5 text-white/50">{{ article.category }}</span>
                    <span>{{ article.views }} views</span>
                  </div>
                </div>
                <svg class="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="glass-card p-8 text-center">
          <svg class="w-10 h-10 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p class="text-white/40 text-sm">Enter an organization ID above to browse help articles</p>
        </div>
      </div>

      <!-- Tickets Tab -->
      <div v-if="activeTab === 'tickets'" class="space-y-3">
        <!-- No tickets found -->
        <div v-if="hasSearched && tickets.length === 0" class="glass-card p-8 text-center">
          <svg class="w-10 h-10 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-white/40 text-sm">No tickets found for this email address</p>
        </div>

        <!-- Not searched yet -->
        <div v-else-if="!hasSearched" class="glass-card p-8 text-center">
          <p class="text-white/40 text-sm">Enter your email and click "Look up tickets" to see your support requests</p>
        </div>

        <!-- Ticket list -->
        <div v-else class="space-y-3">
          <div
            v-for="ticket in tickets"
            :key="ticket.id"
            class="glass-card p-4 space-y-2"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-white font-medium text-sm line-clamp-1">{{ ticket.subject }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                    :class="[statusConfig[ticket.status]?.color, statusConfig[ticket.status]?.bg]"
                  >
                    {{ statusConfig[ticket.status]?.label || ticket.status }}
                  </span>
                  <span class="text-[10px] uppercase font-semibold" :class="priorityConfig[ticket.priority]?.color">
                    {{ priorityConfig[ticket.priority]?.label || ticket.priority }}
                  </span>
                </div>
              </div>
              <span class="text-[11px] text-white/30 whitespace-nowrap">{{ timeAgo(ticket.updatedAt) }}</span>
            </div>

            <!-- Last message preview -->
            <div v-if="ticket.lastMessage" class="pl-3 border-l-2 border-white/10">
              <p class="text-white/50 text-xs line-clamp-2">{{ ticket.lastMessage.body }}</p>
              <p class="text-white/30 text-[10px] mt-0.5">
                {{ ticket.lastMessage.senderType === 'AGENT' ? 'Agent reply' : 'Your message' }}
                · {{ timeAgo(ticket.lastMessage.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Article Viewer Modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="selectedArticle" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeArticle" />
            <div class="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto glass-card p-6 space-y-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-lg font-bold text-white">{{ selectedArticle.title }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span v-if="selectedArticle.category" class="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-medium uppercase">
                      {{ selectedArticle.category }}
                    </span>
                    <span class="text-white/30 text-xs">{{ selectedArticle.views }} views</span>
                  </div>
                </div>
                <button @click="closeArticle" class="text-white/40 hover:text-white transition-colors flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {{ selectedArticle.body }}
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/10 py-6 text-center">
      <p class="text-white/30 text-xs">Powered by AuraDesk · © 2026 Janina Dorobantu</p>
    </footer>
  </div>
</template>
