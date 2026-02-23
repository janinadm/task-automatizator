import { ref, computed } from 'vue';
import { n as navigateTo } from './server.mjs';
import { defineStore } from 'pinia';
import { u as useSupabaseClient } from './useSupabaseClient-DxYTVa8G.mjs';

const useAuthStore = defineStore("auth", () => {
  const currentUser = ref(null);
  const isLoading = ref(false);
  const isInitialized = ref(false);
  const isAuthenticated = computed(() => !!currentUser.value);
  const isAdmin = computed(() => currentUser.value?.role === "ADMIN");
  const isAgent = computed(() => currentUser.value?.role === "AGENT");
  const organization = computed(() => currentUser.value?.organization ?? null);
  const plan = computed(() => currentUser.value?.organization?.plan ?? "FREE");
  async function fetchCurrentUser() {
    isLoading.value = true;
    try {
      const response = await $fetch("/api/users/me");
      currentUser.value = response.data;
    } catch (error) {
      if (error?.statusCode !== 401 && error?.statusCode !== 404) {
        console.error("[authStore] Failed to fetch current user:", error);
      }
      currentUser.value = null;
    } finally {
      isLoading.value = false;
      isInitialized.value = true;
    }
  }
  function clearUser() {
    currentUser.value = null;
    isInitialized.value = false;
  }
  async function logout() {
    const supabase = useSupabaseClient();
    await supabase.auth.signOut();
    clearUser();
    await navigateTo("/login");
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
    logout
  };
});

export { useAuthStore as u };
//# sourceMappingURL=auth-CNfKvejC.mjs.map
