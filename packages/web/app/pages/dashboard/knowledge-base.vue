<!--
  Knowledge Base Page — Manage help articles for your organization
  Route: /dashboard/knowledge-base
  Layout: dashboard

  Features:
  - List all articles with status badges, category, views count
  - Search and filter by status/category
  - Create new articles (admin only)
  - Edit / delete existing articles (admin only)
  - Markdown body editing with live preview
-->
<script setup lang="ts">
  import { useAuthStore } from '~/stores/auth'

  definePageMeta({ layout: 'dashboard' })

  const authStore = useAuthStore()
  const isAdmin = computed(() => authStore.currentUser?.role === 'ADMIN')

  // --- State ---
  type Article = {
    id: string
    title: string
    slug: string
    category: string | null
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    views: number
    authorId: string
    createdAt: string
    updatedAt: string
    body?: string
  }

  const articles = ref<Article[]>([])
  const loading = ref(true)
  const searchQuery = ref('')
  const filterStatus = ref<string>('')
  const filterCategory = ref<string>('')

  // Editor state
  const showEditor = ref(false)
  const editingArticle = ref<Article | null>(null)
  const editorForm = reactive({
    title: '',
    body: '',
    category: '',
    status: 'DRAFT' as string,
  })
  const saving = ref(false)
  const editorError = ref('')

  // --- Computed ---
  const categories = computed(() => {
    const cats = new Set<string>()
    articles.value.forEach((a) => {
      if (a.category) cats.add(a.category)
    })
    return Array.from(cats).sort()
  })

  const filteredArticles = computed(() => {
    let list = articles.value
    if (filterStatus.value) {
      list = list.filter((a) => a.status === filterStatus.value)
    }
    if (filterCategory.value) {
      list = list.filter((a) => a.category === filterCategory.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) || (a.category && a.category.toLowerCase().includes(q)),
      )
    }
    return list
  })

  // --- API ---
  async function fetchArticles() {
    loading.value = true
    try {
      const res = await $fetch<{ data: Article[] }>('/api/articles')
      articles.value = res.data
    } catch {
      /* silent */
    } finally {
      loading.value = false
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm('Are you sure you want to delete this article?')) return
    try {
      await $fetch(`/api/articles/${id}`, { method: 'DELETE' })
      articles.value = articles.value.filter((a) => a.id !== id)
    } catch {
      /* silent */
    }
  }

  function openNewArticle() {
    editingArticle.value = null
    editorForm.title = ''
    editorForm.body = ''
    editorForm.category = ''
    editorForm.status = 'DRAFT'
    editorError.value = ''
    showEditor.value = true
  }

  async function openEditArticle(article: Article) {
    // Fetch full article (with body) if not already loaded
    try {
      const res = await $fetch<{ data: Article }>(`/api/articles/${article.id}`)
      editingArticle.value = res.data
      editorForm.title = res.data.title
      editorForm.body = res.data.body || ''
      editorForm.category = res.data.category || ''
      editorForm.status = res.data.status
      editorError.value = ''
      showEditor.value = true
    } catch {
      /* silent */
    }
  }

  async function saveArticle() {
    if (!editorForm.title.trim() || !editorForm.body.trim()) {
      editorError.value = 'Title and body are required'
      return
    }
    saving.value = true
    editorError.value = ''
    try {
      const payload = {
        title: editorForm.title.trim(),
        body: editorForm.body,
        category: editorForm.category.trim() || undefined,
        status: editorForm.status,
      }

      if (editingArticle.value) {
        await $fetch(`/api/articles/${editingArticle.value.id}`, {
          method: 'PATCH',
          body: payload,
        })
      } else {
        await $fetch('/api/articles', {
          method: 'POST',
          body: payload,
        })
      }
      showEditor.value = false
      await fetchArticles()
    } catch (e: any) {
      editorError.value = e?.data?.message || 'Failed to save article'
    } finally {
      saving.value = false
    }
  }

  // --- Helpers ---
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    DRAFT: { label: 'Draft', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    PUBLISHED: { label: 'Published', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    ARCHIVED: { label: 'Archived', color: 'text-white/40', bg: 'bg-white/5' },
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

  onMounted(() => fetchArticles())

  // --- Seed Demo Articles ---
  const seedingArticles = ref(false)
  const toast = useToast()

  async function seedDemoArticles() {
    seedingArticles.value = true
    try {
      const res = await $fetch<{ success: boolean; message: string; count: number }>(
        '/api/admin/seed-kb',
        { method: 'POST' },
      )
      toast.success(res.message)
      await fetchArticles()
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Failed to seed articles')
    } finally {
      seedingArticles.value = false
    }
  }
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-white">Knowledge Base</h2>
        <p class="text-white/40 text-sm mt-1">Manage help articles for your customers and team</p>
      </div>
      <button
        v-if="isAdmin"
        @click="openNewArticle()"
        class="btn-primary text-sm flex items-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        New Article
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <!-- Search -->
      <div class="relative flex-1 min-w-[200px]">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search articles..."
          class="input-glass w-full pl-10 text-sm"
        />
      </div>
      <!-- Status filter -->
      <select v-model="filterStatus" class="input-glass text-sm min-w-[140px]">
        <option value="">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="ARCHIVED">Archived</option>
      </select>
      <!-- Category filter -->
      <select v-model="filterCategory" class="input-glass text-sm min-w-[140px]">
        <option value="">All categories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div
        class="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredArticles.length === 0" class="glass-card p-12 text-center">
      <svg
        class="w-12 h-12 text-white/20 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <p class="text-white/50 text-sm">No articles found</p>
      <div v-if="isAdmin" class="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
        <button @click="openNewArticle()" class="btn-primary text-sm">
          Create your first article
        </button>
        <button
          @click="seedDemoArticles()"
          :disabled="seedingArticles"
          class="btn-ghost text-sm flex items-center gap-1.5"
        >
          <svg
            v-if="seedingArticles"
            class="animate-spin w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {{ seedingArticles ? 'Loading...' : '📚 Load demo articles' }}
        </button>
      </div>
    </div>

    <!-- Articles grid -->
    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="article in filteredArticles"
        :key="article.id"
        class="glass-card p-5 flex flex-col gap-3 group hover:border-white/20 transition-all duration-200 cursor-pointer"
        @click="isAdmin && openEditArticle(article)"
      >
        <!-- Top row: status + category -->
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            :class="[statusConfig[article.status]?.color, statusConfig[article.status]?.bg]"
          >
            {{ statusConfig[article.status]?.label || article.status }}
          </span>
          <span
            v-if="article.category"
            class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 uppercase tracking-wider"
          >
            {{ article.category }}
          </span>
        </div>

        <!-- Title -->
        <h3
          class="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors"
        >
          {{ article.title }}
        </h3>

        <!-- Meta row -->
        <div class="flex items-center gap-4 mt-auto text-[11px] text-white/40">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {{ article.views }} views
          </span>
          <span>Updated {{ timeAgo(article.updatedAt) }}</span>
        </div>

        <!-- Admin actions -->
        <div v-if="isAdmin" class="flex gap-2 mt-1">
          <button
            class="text-xs text-white/40 hover:text-indigo-400 transition-colors"
            @click.stop="openEditArticle(article)"
          >
            Edit
          </button>
          <button
            class="text-xs text-white/40 hover:text-red-400 transition-colors"
            @click.stop="deleteArticle(article.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Article Editor Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditor" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showEditor = false" />

          <!-- Modal -->
          <div
            class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card p-6 space-y-5"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-white">
                {{ editingArticle ? 'Edit Article' : 'New Article' }}
              </h3>
              <button
                @click="showEditor = false"
                class="text-white/40 hover:text-white transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Error -->
            <div
              v-if="editorError"
              class="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
            >
              {{ editorError }}
            </div>

            <!-- Title -->
            <div>
              <label class="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider"
                >Title</label
              >
              <input
                v-model="editorForm.title"
                type="text"
                class="input-glass w-full"
                placeholder="Article title..."
              />
            </div>

            <!-- Category + Status (side by side) -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider"
                  >Category</label
                >
                <input
                  v-model="editorForm.category"
                  type="text"
                  class="input-glass w-full"
                  placeholder="e.g. Getting Started, Billing..."
                />
              </div>
              <div>
                <label
                  class="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider"
                  >Status</label
                >
                <select v-model="editorForm.status" class="input-glass w-full">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <!-- Body (Markdown) -->
            <div>
              <label class="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider"
                >Content (Markdown)</label
              >
              <textarea
                v-model="editorForm.body"
                rows="16"
                class="input-glass w-full font-mono text-sm leading-relaxed"
                placeholder="Write your article content in Markdown..."
              />
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button @click="showEditor = false" class="btn-ghost text-sm">Cancel</button>
              <button
                @click="saveArticle"
                :disabled="saving"
                class="btn-primary text-sm flex items-center gap-1.5"
              >
                <div
                  v-if="saving"
                  class="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                />
                {{ saving ? 'Saving...' : editingArticle ? 'Update Article' : 'Create Article' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
