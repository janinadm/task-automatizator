/**
 * Auth Store (Pinia)
 * File: stores/auth.ts
 * 
 * WHAT IS A PINIA STORE?
 * A "store" is a centralized piece of state that can be accessed from ANY component.
 * Without a store, you'd need to pass data through props from parent → child → grandchild.
 * With Pinia, any component can just call useAuthStore() and get the current user.
 * 
 * PINIA'S THREE CONCEPTS:
 * - state: the data (like component's data() but shared globally)
 * - getters: computed values derived from state (like computed() but reusable)
 * - actions: functions that modify state (like methods() but async-capable)
 * 
 * (¿QUÉ ES UN STORE DE PINIA?
 *  Un "store" es un estado centralizado que puede accederse desde CUALQUIER componente.
 *  Sin un store, necesitarías pasar datos a través de props de padre → hijo → nieto.
 *  Con Pinia, cualquier componente puede llamar useAuthStore() y obtener el usuario actual.
 *  
 *  LOS TRES CONCEPTOS DE PINIA:
 *  - state: los datos (como data() del componente pero compartido globalmente)
 *  - getters: valores calculados derivados del estado (como computed() pero reutilizable)
 *  - actions: funciones que modifican el estado (como methods() pero async-capable))
 */

import type { User, Organization } from '@ata/shared'

// defineStore(id, setup) — the Composition API style of Pinia store
// The id 'auth' uniquely identifies this store in Vue DevTools
// (defineStore(id, setup) — el estilo Composition API del store de Pinia)
// (El id 'auth' identifica únicamente este store en Vue DevTools)
export const useAuthStore = defineStore('auth', () => {
  // --- STATE (ESTADO) ---
  // These ref()s are the store's reactive data
  // (Estos ref()s son los datos reactivos del store)
  const currentUser = ref<(User & { organization: Organization }) | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // --- GETTERS (GETTERS) ---
  // computed() on a store ref creates a "getter" — a derived, read-only value
  // (computed() en un ref de store crea un "getter" — un valor derivado de solo lectura)
  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')
  const isAgent = computed(() => currentUser.value?.role === 'AGENT')
  const organization = computed(() => currentUser.value?.organization ?? null)
  const plan = computed(() => currentUser.value?.organization?.plan ?? 'FREE')

  // --- ACTIONS (ACCIONES) ---

  /**
   * Fetch the current user from our API (/api/users/me).
   * Called on app initialization to hydrate the auth state.
   * 
   * (Obtener el usuario actual de nuestra API (/api/users/me).
   *  Llamado al inicializar la app para hidratar el estado de auth.)
   */
  async function fetchCurrentUser() {
    isLoading.value = true
    try {
      const response = await $fetch<{ data: User & { organization: Organization } }>('/api/users/me')
      currentUser.value = response.data
    } catch (error: any) {
      // 401 = not logged in — that's fine on public pages
      // 404 = logged in but no Prisma record — will be handled by /confirm
      // (401 = no autenticado — está bien en páginas públicas)
      if (error?.statusCode !== 401 && error?.statusCode !== 404) {
        console.error('[authStore] Failed to fetch current user:', error)
      }
      currentUser.value = null
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  /**
   * Clear the auth state (called on logout).
   * (Limpiar el estado de auth — llamado al cerrar sesión.)
   */
  function clearUser() {
    currentUser.value = null
    isInitialized.value = false
  }

  /**
   * Log out — calls Supabase signOut and clears our store.
   * (Cerrar sesión — llama a signOut de Supabase y limpia nuestro store.)
   */
  async function logout() {
    const supabase = useSupabaseClient()
    await supabase.auth.signOut()
    clearUser()
    await navigateTo('/login')
  }

  return {
    // State (Estado)
    currentUser,
    isLoading,
    isInitialized,
    // Getters (Getters)
    isAuthenticated,
    isAdmin,
    isAgent,
    organization,
    plan,
    // Actions (Acciones)
    fetchCurrentUser,
    clearUser,
    logout,
  }
})
