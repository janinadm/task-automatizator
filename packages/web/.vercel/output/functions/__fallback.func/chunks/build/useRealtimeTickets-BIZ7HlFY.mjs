import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { u as useSupabaseClient } from './useSupabaseClient-DxYTVa8G.mjs';
import { u as useToast } from './useToast-BbS4urR_.mjs';

const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20
};
const useTicketsStore = defineStore("tickets", () => {
  const tickets = ref([]);
  const meta = ref(null);
  const currentTicket = ref(null);
  const filters = ref({
    page: 1,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const isLoadingList = ref(false);
  const isLoadingDetail = ref(false);
  const isUpdating = ref(false);
  const error = ref(null);
  const totalPages = computed(() => {
    var _a, _b;
    return (_b = (_a = meta.value) == null ? void 0 : _a.totalPages) != null ? _b : 1;
  });
  const hasNextPage = computed(() => {
    var _a, _b;
    return (_b = (_a = meta.value) == null ? void 0 : _a.hasNextPage) != null ? _b : false;
  });
  const hasPrevPage = computed(() => {
    var _a, _b;
    return (_b = (_a = meta.value) == null ? void 0 : _a.hasPrevPage) != null ? _b : false;
  });
  const currentPage = computed(() => {
    var _a;
    return (_a = filters.value.page) != null ? _a : 1;
  });
  async function fetchTickets(overrideFilters) {
    var _a, _b;
    isLoadingList.value = true;
    error.value = null;
    if (overrideFilters) {
      filters.value = { ...filters.value, ...overrideFilters };
    }
    try {
      const query = Object.entries(filters.value).filter(([, v]) => v !== void 0 && v !== null && v !== "").reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
      const response = await $fetch("/api/tickets", {
        query
      });
      tickets.value = response.data;
      meta.value = response.meta;
    } catch (e) {
      error.value = (_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) != null ? _b : "Failed to load tickets";
      tickets.value = [];
    } finally {
      isLoadingList.value = false;
    }
  }
  async function fetchTicket(id) {
    var _a, _b;
    isLoadingDetail.value = true;
    error.value = null;
    try {
      const response = await $fetch(`/api/tickets/${id}`);
      currentTicket.value = response.data;
    } catch (e) {
      error.value = (_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) != null ? _b : "Failed to load ticket";
      currentTicket.value = null;
    } finally {
      isLoadingDetail.value = false;
    }
  }
  async function updateTicket(id, data) {
    var _a, _b, _c, _d;
    isUpdating.value = true;
    error.value = null;
    const previousTicket = currentTicket.value;
    const listIndex = tickets.value.findIndex((t) => t.id === id);
    const previousListItem = listIndex >= 0 ? { ...tickets.value[listIndex] } : null;
    if (((_a = currentTicket.value) == null ? void 0 : _a.id) === id) {
      currentTicket.value = { ...currentTicket.value, ...data };
    }
    if (listIndex >= 0) {
      tickets.value[listIndex] = { ...tickets.value[listIndex], ...data };
    }
    try {
      const response = await $fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        body: data
      });
      if (((_b = currentTicket.value) == null ? void 0 : _b.id) === id) {
        currentTicket.value = { ...currentTicket.value, ...response.data };
      }
      if (listIndex >= 0) {
        tickets.value[listIndex] = { ...tickets.value[listIndex], ...response.data };
      }
      return response.data;
    } catch (e) {
      if (previousTicket) currentTicket.value = previousTicket;
      if (listIndex >= 0 && previousListItem) {
        tickets.value[listIndex] = previousListItem;
      }
      error.value = (_d = (_c = e == null ? void 0 : e.data) == null ? void 0 : _c.message) != null ? _d : "Failed to update ticket";
      throw e;
    } finally {
      isUpdating.value = false;
    }
  }
  function setFilter(key, value) {
    filters.value = { ...filters.value, [key]: value, page: 1 };
    fetchTickets();
  }
  function resetFilters() {
    filters.value = {
      page: 1,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      sortBy: "createdAt",
      sortOrder: "desc"
    };
    fetchTickets();
  }
  function goToPage(page) {
    filters.value = { ...filters.value, page };
    fetchTickets();
  }
  return {
    // State
    tickets,
    meta,
    currentTicket,
    filters,
    isLoadingList,
    isLoadingDetail,
    isUpdating,
    error,
    // Getters
    totalPages,
    hasNextPage,
    hasPrevPage,
    currentPage,
    // Actions
    fetchTickets,
    fetchTicket,
    updateTicket,
    setFilter,
    resetFilters,
    goToPage
  };
});
const useRealtimeTickets = () => {
  const supabase = useSupabaseClient();
  const ticketsStore = useTicketsStore();
  const toast = useToast();
  function subscribe(orgId) {
    const channel = supabase.channel(`org-tickets:${orgId}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "tickets",
        // Filter: only receive events for our org to avoid cross-tenant leaks
        // (Filtro: solo recibir eventos de nuestra org para evitar fugas entre tenants)
        filter: `orgId=eq.${orgId}`
      },
      async () => {
        toast.info("\u{1F3AB} New ticket received");
        await ticketsStore.fetchTickets();
      }
    ).on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "tickets",
        filter: `orgId=eq.${orgId}`
      },
      (payload) => {
        var _a;
        const updated = payload.new;
        const idx = ticketsStore.tickets.findIndex((t) => t.id === updated.id);
        if (idx >= 0) {
          const existing = ticketsStore.tickets[idx];
          if (existing) {
            Object.assign(existing, {
              status: updated.status,
              priority: updated.priority,
              assignedToId: updated.assignedToId,
              updatedAt: updated.updatedAt,
              sentiment: updated.sentiment,
              category: updated.category
            });
          }
        }
        if (((_a = ticketsStore.currentTicket) == null ? void 0 : _a.id) === updated.id) {
          ticketsStore.fetchTicket(updated.id);
        }
      }
    ).subscribe((status) => {
    });
    return channel;
  }
  return { subscribe };
};

export { useRealtimeTickets as a, useTicketsStore as u };
//# sourceMappingURL=useRealtimeTickets-BIZ7HlFY.mjs.map
