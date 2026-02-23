import { _ as __nuxt_component_0 } from './nuxt-link-CyRG7-rc.mjs';
import { _ as __nuxt_component_1 } from './GlassCard-C-gZz82T.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, openBlock, createBlock, createVNode, createTextVNode, withDirectives, isRef, vModelText, vModelSelect, createCommentVNode, toDisplayString, withModifiers, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { u as useTicketsStore, a as useRealtimeTickets } from './useRealtimeTickets-BIZ7HlFY.mjs';
import { u as useAuthStore } from './auth-CNfKvejC.mjs';
import { _ as _export_sfc, b as useRoute, a as useRouter } from './server.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DxYTVa8G.mjs';
import { u as useToast } from './useToast-BbS4urR_.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import 'pinia';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    var _a, _b, _c;
    const ticketsStore = useTicketsStore();
    useAuthStore();
    const route = useRoute();
    const router = useRouter();
    useRealtimeTickets();
    useSupabaseClient();
    const searchInput = ref(String((_a = route.query.search) != null ? _a : ""));
    let searchDebounce = null;
    const selectedStatus = ref(String((_b = route.query.status) != null ? _b : ""));
    const selectedPriority = ref(String((_c = route.query.priority) != null ? _c : ""));
    function onSearchInput() {
      if (searchDebounce) clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        router.replace({ query: { ...route.query, search: searchInput.value || void 0, page: void 0 } });
        ticketsStore.setFilter("search", searchInput.value || void 0);
      }, 400);
    }
    function onStatusChange() {
      router.replace({ query: { ...route.query, status: selectedStatus.value || void 0, page: void 0 } });
      ticketsStore.setFilter("status", selectedStatus.value || void 0);
    }
    function onPriorityChange() {
      router.replace({ query: { ...route.query, priority: selectedPriority.value || void 0, page: void 0 } });
      ticketsStore.setFilter("priority", selectedPriority.value || void 0);
    }
    function clearFilters() {
      searchInput.value = "";
      selectedStatus.value = "";
      selectedPriority.value = "";
      router.replace({ query: {} });
      ticketsStore.resetFilters();
    }
    function toggleSort(field) {
      const current = ticketsStore.filters.sortBy;
      const currentOrder = ticketsStore.filters.sortOrder;
      if (current === field) {
        ticketsStore.setFilter("sortOrder", currentOrder === "desc" ? "asc" : "desc");
      } else {
        ticketsStore.filters.sortBy = field;
        ticketsStore.filters.sortOrder = "desc";
        ticketsStore.fetchTickets();
      }
    }
    const statusConfig = {
      OPEN: { label: "Open", class: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
      IN_PROGRESS: { label: "In Progress", class: "bg-amber-500/20 text-amber-300 border border-amber-500/30" },
      RESOLVED: { label: "Resolved", class: "bg-green-500/20 text-green-300 border border-green-500/30" },
      CLOSED: { label: "Closed", class: "bg-white/10 text-white/50 border border-white/10" }
    };
    const priorityConfig = {
      URGENT: { label: "Urgent", dot: "bg-red-500", text: "text-red-400" },
      HIGH: { label: "High", dot: "bg-orange-400", text: "text-orange-400" },
      MEDIUM: { label: "Medium", dot: "bg-amber-400", text: "text-amber-400" },
      LOW: { label: "Low", dot: "bg-green-400", text: "text-green-400" }
    };
    const sentimentEmoji = {
      POSITIVE: "\u{1F60A}",
      NEUTRAL: "\u{1F610}",
      NEGATIVE: "\u{1F621}"
    };
    const channelIcon = {
      EMAIL: "\u2709\uFE0F",
      WHATSAPP: "\u{1F4AC}",
      WEB: "\u{1F310}",
      SLACK: "\u26A1"
    };
    function timeAgo(date) {
      const d = typeof date === "string" ? new Date(date) : date;
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 6e4);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const h = Math.floor(mins / 60);
      if (h < 24) return `${h}h ago`;
      return `${Math.floor(h / 24)}d ago`;
    }
    const hasActiveFilters = computed(
      () => !!(searchInput.value || selectedStatus.value || selectedPriority.value)
    );
    const selectedTickets = ref(/* @__PURE__ */ new Set());
    const isBulkProcessing = ref(false);
    const toast = useToast();
    const isAllSelected = computed(() => {
      if (!ticketsStore.tickets.length) return false;
      return ticketsStore.tickets.every((t) => selectedTickets.value.has(t.id));
    });
    function toggleSelectAll() {
      if (isAllSelected.value) {
        selectedTickets.value.clear();
      } else {
        ticketsStore.tickets.forEach((t) => selectedTickets.value.add(t.id));
      }
    }
    function toggleTicket(id) {
      if (selectedTickets.value.has(id)) {
        selectedTickets.value.delete(id);
      } else {
        selectedTickets.value.add(id);
      }
    }
    async function bulkAction(action, value) {
      var _a2, _b2;
      if (!selectedTickets.value.size) return;
      isBulkProcessing.value = true;
      try {
        const res = await $fetch("/api/tickets/bulk", {
          method: "POST",
          body: {
            ticketIds: Array.from(selectedTickets.value),
            action,
            value
          }
        });
        toast.success(`Updated ${res.data.updatedCount} ticket(s)`);
        selectedTickets.value.clear();
        await ticketsStore.fetchTickets();
      } catch (e) {
        toast.error((_b2 = (_a2 = e == null ? void 0 : e.data) == null ? void 0 : _a2.message) != null ? _b2 : "Bulk action failed");
      } finally {
        isBulkProcessing.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiGlassCard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5 animate-fade-in" }, _attrs))} data-v-b5a88f46><div class="flex items-center justify-between" data-v-b5a88f46><div data-v-b5a88f46><h2 class="text-2xl font-bold text-white" data-v-b5a88f46>Tickets</h2><p class="text-white/50 text-sm mt-0.5" data-v-b5a88f46>${ssrInterpolate((_b2 = (_a2 = unref(ticketsStore).meta) == null ? void 0 : _a2.total) != null ? _b2 : "...")} total tickets </p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/dashboard/tickets/new",
        class: "btn-primary flex items-center gap-2 text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b5a88f46${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" data-v-b5a88f46${_scopeId}></path></svg> New Ticket `);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                class: "w-4 h-4",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M12 4v16m8-8H4"
                })
              ])),
              createTextVNode(" New Ticket ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UiGlassCard, { padding: "sm" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-wrap items-center gap-3" data-v-b5a88f46${_scopeId}><div class="relative flex-1 min-w-[200px]" data-v-b5a88f46${_scopeId}><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b5a88f46${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-v-b5a88f46${_scopeId}></path></svg><input${ssrRenderAttr("value", unref(searchInput))} type="search" placeholder="Search tickets..." class="input-glass pl-9 text-sm" data-v-b5a88f46${_scopeId}></div><select class="input-glass select-arrow text-sm min-w-[130px] cursor-pointer appearance-none pr-10" data-v-b5a88f46${_scopeId}><option value="" data-v-b5a88f46${ssrIncludeBooleanAttr(Array.isArray(unref(selectedStatus)) ? ssrLooseContain(unref(selectedStatus), "") : ssrLooseEqual(unref(selectedStatus), "")) ? " selected" : ""}${_scopeId}>All statuses</option><option value="OPEN" data-v-b5a88f46${ssrIncludeBooleanAttr(Array.isArray(unref(selectedStatus)) ? ssrLooseContain(unref(selectedStatus), "OPEN") : ssrLooseEqual(unref(selectedStatus), "OPEN")) ? " selected" : ""}${_scopeId}>Open</option><option value="IN_PROGRESS" data-v-b5a88f46${ssrIncludeBooleanAttr(Array.isArray(unref(selectedStatus)) ? ssrLooseContain(unref(selectedStatus), "IN_PROGRESS") : ssrLooseEqual(unref(selectedStatus), "IN_PROGRESS")) ? " selected" : ""}${_scopeId}>In Progress</option><option value="RESOLVED" data-v-b5a88f46${ssrIncludeBooleanAttr(Array.isArray(unref(selectedStatus)) ? ssrLooseContain(unref(selectedStatus), "RESOLVED") : ssrLooseEqual(unref(selectedStatus), "RESOLVED")) ? " selected" : ""}${_scopeId}>Resolved</option><option value="CLOSED" data-v-b5a88f46${ssrIncludeBooleanAttr(Array.isArray(unref(selectedStatus)) ? ssrLooseContain(unref(selectedStatus), "CLOSED") : ssrLooseEqual(unref(selectedStatus), "CLOSED")) ? " selected" : ""}${_scopeId}>Closed</option></select><select class="input-glass select-arrow text-sm min-w-[130px] cursor-pointer appearance-none pr-10" data-v-b5a88f46${_scopeId}><option value="" data-v-b5a88f46${ssrIncludeBooleanAttr(Array.isArray(unref(selectedPriority)) ? ssrLooseContain(unref(selectedPriority), "") : ssrLooseEqual(unref(selectedPriority), "")) ? " selected" : ""}${_scopeId}>All priorities</option><option value="URGENT" data-v-b5a88f46${ssrIncludeBooleanAttr(Array.isArray(unref(selectedPriority)) ? ssrLooseContain(unref(selectedPriority), "URGENT") : ssrLooseEqual(unref(selectedPriority), "URGENT")) ? " selected" : ""}${_scopeId}>\u{1F534} Urgent</option><option value="HIGH" data-v-b5a88f46${ssrIncludeBooleanAttr(Array.isArray(unref(selectedPriority)) ? ssrLooseContain(unref(selectedPriority), "HIGH") : ssrLooseEqual(unref(selectedPriority), "HIGH")) ? " selected" : ""}${_scopeId}>\u{1F7E0} High</option><option value="MEDIUM" data-v-b5a88f46${ssrIncludeBooleanAttr(Array.isArray(unref(selectedPriority)) ? ssrLooseContain(unref(selectedPriority), "MEDIUM") : ssrLooseEqual(unref(selectedPriority), "MEDIUM")) ? " selected" : ""}${_scopeId}>\u{1F7E1} Medium</option><option value="LOW" data-v-b5a88f46${ssrIncludeBooleanAttr(Array.isArray(unref(selectedPriority)) ? ssrLooseContain(unref(selectedPriority), "LOW") : ssrLooseEqual(unref(selectedPriority), "LOW")) ? " selected" : ""}${_scopeId}>\u{1F7E2} Low</option></select>`);
            if (unref(hasActiveFilters)) {
              _push2(`<button class="btn-ghost text-sm flex items-center gap-1.5" data-v-b5a88f46${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b5a88f46${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-b5a88f46${_scopeId}></path></svg> Clear </button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap items-center gap-3" }, [
                createVNode("div", { class: "relative flex-1 min-w-[200px]" }, [
                  (openBlock(), createBlock("svg", {
                    class: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    })
                  ])),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => isRef(searchInput) ? searchInput.value = $event : null,
                    type: "search",
                    placeholder: "Search tickets...",
                    class: "input-glass pl-9 text-sm",
                    onInput: onSearchInput
                  }, null, 40, ["onUpdate:modelValue"]), [
                    [vModelText, unref(searchInput)]
                  ])
                ]),
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => isRef(selectedStatus) ? selectedStatus.value = $event : null,
                  class: "input-glass select-arrow text-sm min-w-[130px] cursor-pointer appearance-none pr-10",
                  onChange: onStatusChange
                }, [
                  createVNode("option", { value: "" }, "All statuses"),
                  createVNode("option", { value: "OPEN" }, "Open"),
                  createVNode("option", { value: "IN_PROGRESS" }, "In Progress"),
                  createVNode("option", { value: "RESOLVED" }, "Resolved"),
                  createVNode("option", { value: "CLOSED" }, "Closed")
                ], 40, ["onUpdate:modelValue"]), [
                  [vModelSelect, unref(selectedStatus)]
                ]),
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => isRef(selectedPriority) ? selectedPriority.value = $event : null,
                  class: "input-glass select-arrow text-sm min-w-[130px] cursor-pointer appearance-none pr-10",
                  onChange: onPriorityChange
                }, [
                  createVNode("option", { value: "" }, "All priorities"),
                  createVNode("option", { value: "URGENT" }, "\u{1F534} Urgent"),
                  createVNode("option", { value: "HIGH" }, "\u{1F7E0} High"),
                  createVNode("option", { value: "MEDIUM" }, "\u{1F7E1} Medium"),
                  createVNode("option", { value: "LOW" }, "\u{1F7E2} Low")
                ], 40, ["onUpdate:modelValue"]), [
                  [vModelSelect, unref(selectedPriority)]
                ]),
                unref(hasActiveFilters) ? (openBlock(), createBlock("button", {
                  key: 0,
                  class: "btn-ghost text-sm flex items-center gap-1.5",
                  onClick: clearFilters
                }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-3.5 h-3.5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M6 18L18 6M6 6l12 12"
                    })
                  ])),
                  createTextVNode(" Clear ")
                ])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(selectedTickets).size > 0) {
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between flex-wrap gap-3" data-v-b5a88f46${_scopeId}><div class="flex items-center gap-2" data-v-b5a88f46${_scopeId}><span class="text-white font-medium text-sm" data-v-b5a88f46${_scopeId}>${ssrInterpolate(unref(selectedTickets).size)} selected</span><button class="text-white/40 hover:text-white/60 text-xs underline transition-colors" data-v-b5a88f46${_scopeId}> Clear </button></div><div class="flex items-center gap-2 flex-wrap" data-v-b5a88f46${_scopeId}><button class="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"${ssrIncludeBooleanAttr(unref(isBulkProcessing)) ? " disabled" : ""} data-v-b5a88f46${_scopeId}> \u2699\uFE0F Mark In Progress </button><button class="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"${ssrIncludeBooleanAttr(unref(isBulkProcessing)) ? " disabled" : ""} data-v-b5a88f46${_scopeId}> \u2705 Resolve </button><button class="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"${ssrIncludeBooleanAttr(unref(isBulkProcessing)) ? " disabled" : ""} data-v-b5a88f46${_scopeId}> \u{1F512} Close </button><button class="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-400 hover:text-red-300"${ssrIncludeBooleanAttr(unref(isBulkProcessing)) ? " disabled" : ""} data-v-b5a88f46${_scopeId}> \u{1F534} Urgent </button><button class="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"${ssrIncludeBooleanAttr(unref(isBulkProcessing)) ? " disabled" : ""} data-v-b5a88f46${_scopeId}> Unassign </button></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between flex-wrap gap-3" }, [
                  createVNode("div", { class: "flex items-center gap-2" }, [
                    createVNode("span", { class: "text-white font-medium text-sm" }, toDisplayString(unref(selectedTickets).size) + " selected", 1),
                    createVNode("button", {
                      class: "text-white/40 hover:text-white/60 text-xs underline transition-colors",
                      onClick: ($event) => unref(selectedTickets).clear()
                    }, " Clear ", 8, ["onClick"])
                  ]),
                  createVNode("div", { class: "flex items-center gap-2 flex-wrap" }, [
                    createVNode("button", {
                      class: "btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5",
                      disabled: unref(isBulkProcessing),
                      onClick: ($event) => bulkAction("updateStatus", "IN_PROGRESS")
                    }, " \u2699\uFE0F Mark In Progress ", 8, ["disabled", "onClick"]),
                    createVNode("button", {
                      class: "btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5",
                      disabled: unref(isBulkProcessing),
                      onClick: ($event) => bulkAction("updateStatus", "RESOLVED")
                    }, " \u2705 Resolve ", 8, ["disabled", "onClick"]),
                    createVNode("button", {
                      class: "btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5",
                      disabled: unref(isBulkProcessing),
                      onClick: ($event) => bulkAction("updateStatus", "CLOSED")
                    }, " \u{1F512} Close ", 8, ["disabled", "onClick"]),
                    createVNode("button", {
                      class: "btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-400 hover:text-red-300",
                      disabled: unref(isBulkProcessing),
                      onClick: ($event) => bulkAction("updatePriority", "URGENT")
                    }, " \u{1F534} Urgent ", 8, ["disabled", "onClick"]),
                    createVNode("button", {
                      class: "btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5",
                      disabled: unref(isBulkProcessing),
                      onClick: ($event) => bulkAction("unassign")
                    }, " Unassign ", 8, ["disabled", "onClick"])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiGlassCard, { padding: "none" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a3, _b3, _c2, _d, _e, _f;
          if (_push2) {
            _push2(`<div class="px-5 py-3 border-b border-white/10" data-v-b5a88f46${_scopeId}><div class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center text-xs text-white/40 font-medium uppercase tracking-wider" data-v-b5a88f46${_scopeId}><label class="flex items-center cursor-pointer" data-v-b5a88f46${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(unref(isAllSelected)) ? " checked" : ""} class="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30 cursor-pointer" data-v-b5a88f46${_scopeId}></label><button class="text-left flex items-center gap-1 hover:text-white/60 transition-colors" data-v-b5a88f46${_scopeId}> Ticket `);
            if (unref(ticketsStore).filters.sortBy === "createdAt") {
              _push2(`<svg class="${ssrRenderClass([unref(ticketsStore).filters.sortOrder === "asc" ? "rotate-180" : "", "w-3 h-3"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b5a88f46${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-b5a88f46${_scopeId}></path></svg>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</button><span class="hidden md:block" data-v-b5a88f46${_scopeId}>Status</span><button class="hidden md:flex items-center gap-1 hover:text-white/60 transition-colors" data-v-b5a88f46${_scopeId}> Priority `);
            if (unref(ticketsStore).filters.sortBy === "priority") {
              _push2(`<svg class="${ssrRenderClass([unref(ticketsStore).filters.sortOrder === "asc" ? "rotate-180" : "", "w-3 h-3"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b5a88f46${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-b5a88f46${_scopeId}></path></svg>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</button><span class="hidden lg:block" data-v-b5a88f46${_scopeId}>Agent</span><button class="flex items-center gap-1 hover:text-white/60 transition-colors" data-v-b5a88f46${_scopeId}> Updated `);
            if (unref(ticketsStore).filters.sortBy === "updatedAt") {
              _push2(`<svg class="${ssrRenderClass([unref(ticketsStore).filters.sortOrder === "asc" ? "rotate-180" : "", "w-3 h-3"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b5a88f46${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-b5a88f46${_scopeId}></path></svg>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</button></div></div>`);
            if (unref(ticketsStore).isLoadingList) {
              _push2(`<div class="p-4 space-y-2" data-v-b5a88f46${_scopeId}><!--[-->`);
              ssrRenderList(8, (i) => {
                _push2(`<div class="h-14 rounded-lg bg-white/5 animate-pulse" style="${ssrRenderStyle({ animationDelay: `${i * 50}ms` })}" data-v-b5a88f46${_scopeId}></div>`);
              });
              _push2(`<!--]--></div>`);
            } else if (unref(ticketsStore).error) {
              _push2(`<div class="py-12 text-center text-red-400 text-sm" data-v-b5a88f46${_scopeId}>${ssrInterpolate(unref(ticketsStore).error)} <button class="block mx-auto mt-3 text-white/40 hover:text-white/60 transition-colors underline text-xs" data-v-b5a88f46${_scopeId}> Try again </button></div>`);
            } else if (!unref(ticketsStore).tickets.length) {
              _push2(`<div class="py-16 text-center" data-v-b5a88f46${_scopeId}><div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center" data-v-b5a88f46${_scopeId}><svg class="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b5a88f46${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" data-v-b5a88f46${_scopeId}></path></svg></div><p class="text-white/40 text-sm" data-v-b5a88f46${_scopeId}>${ssrInterpolate(unref(hasActiveFilters) ? "No tickets match your filters." : "No tickets yet.")}</p>`);
              if (unref(hasActiveFilters)) {
                _push2(`<button class="mt-3 text-indigo-400 hover:text-indigo-300 text-sm transition-colors" data-v-b5a88f46${_scopeId}> Clear filters </button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<div class="divide-y divide-white/5" data-v-b5a88f46${_scopeId}><!--[-->`);
              ssrRenderList(unref(ticketsStore).tickets, (ticket) => {
                var _a4, _b4, _c3, _d2, _e2;
                _push2(`<div class="${ssrRenderClass([{ "bg-indigo-500/5": unref(selectedTickets).has(ticket.id) }, "grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center px-5 py-4 hover:bg-white/5 transition-colors group"])}" data-v-b5a88f46${_scopeId}><label class="flex items-center cursor-pointer" data-v-b5a88f46${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(unref(selectedTickets).has(ticket.id)) ? " checked" : ""} class="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30 cursor-pointer" data-v-b5a88f46${_scopeId}></label>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/dashboard/tickets/${ticket.id}`,
                  class: "min-w-0"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    var _a5, _b5, _c4, _d3, _e3, _f2, _g, _h, _i, _j;
                    if (_push3) {
                      _push3(`<div class="flex items-center gap-2" data-v-b5a88f46${_scopeId2}>`);
                      if (ticket.isBreachingSla) {
                        _push3(`<span class="inline-flex flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="SLA Breaching" data-v-b5a88f46${_scopeId2}></span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<p class="text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors" data-v-b5a88f46${_scopeId2}>${ssrInterpolate(ticket.subject)}</p>`);
                      if (ticket.sentiment) {
                        _push3(`<span class="flex-shrink-0 text-xs"${ssrRenderAttr("title", ticket.sentiment)} data-v-b5a88f46${_scopeId2}>${ssrInterpolate(sentimentEmoji[ticket.sentiment])}</span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      if (ticket.channel) {
                        _push3(`<span class="flex-shrink-0 text-xs"${ssrRenderAttr("title", ticket.channel)} data-v-b5a88f46${_scopeId2}>${ssrInterpolate(channelIcon[ticket.channel])}</span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</div><p class="text-white/40 text-xs mt-0.5 truncate" data-v-b5a88f46${_scopeId2}>${ssrInterpolate(ticket.customerName || ticket.customerEmail || "Unknown customer")} `);
                      if (((_b5 = (_a5 = ticket._count) == null ? void 0 : _a5.messages) != null ? _b5 : 0) > 0) {
                        _push3(`<span class="ml-2" data-v-b5a88f46${_scopeId2}> \xB7 ${ssrInterpolate((_c4 = ticket._count) == null ? void 0 : _c4.messages)} msg${ssrInterpolate(((_e3 = (_d3 = ticket._count) == null ? void 0 : _d3.messages) != null ? _e3 : 0) === 1 ? "" : "s")}</span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</p>`);
                    } else {
                      return [
                        createVNode("div", { class: "flex items-center gap-2" }, [
                          ticket.isBreachingSla ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "inline-flex flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse",
                            title: "SLA Breaching"
                          })) : createCommentVNode("", true),
                          createVNode("p", { class: "text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors" }, toDisplayString(ticket.subject), 1),
                          ticket.sentiment ? (openBlock(), createBlock("span", {
                            key: 1,
                            class: "flex-shrink-0 text-xs",
                            title: ticket.sentiment
                          }, toDisplayString(sentimentEmoji[ticket.sentiment]), 9, ["title"])) : createCommentVNode("", true),
                          ticket.channel ? (openBlock(), createBlock("span", {
                            key: 2,
                            class: "flex-shrink-0 text-xs",
                            title: ticket.channel
                          }, toDisplayString(channelIcon[ticket.channel]), 9, ["title"])) : createCommentVNode("", true)
                        ]),
                        createVNode("p", { class: "text-white/40 text-xs mt-0.5 truncate" }, [
                          createTextVNode(toDisplayString(ticket.customerName || ticket.customerEmail || "Unknown customer") + " ", 1),
                          ((_g = (_f2 = ticket._count) == null ? void 0 : _f2.messages) != null ? _g : 0) > 0 ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "ml-2"
                          }, " \xB7 " + toDisplayString((_h = ticket._count) == null ? void 0 : _h.messages) + " msg" + toDisplayString(((_j = (_i = ticket._count) == null ? void 0 : _i.messages) != null ? _j : 0) === 1 ? "" : "s"), 1)) : createCommentVNode("", true)
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`<span class="${ssrRenderClass([(_a4 = statusConfig[ticket.status]) == null ? void 0 : _a4.class, "hidden md:inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"])}" data-v-b5a88f46${_scopeId}>${ssrInterpolate((_b4 = statusConfig[ticket.status]) == null ? void 0 : _b4.label)}</span><div class="hidden md:flex items-center gap-1.5" data-v-b5a88f46${_scopeId}><div class="${ssrRenderClass([(_c3 = priorityConfig[ticket.priority]) == null ? void 0 : _c3.dot, "w-2 h-2 rounded-full"])}" data-v-b5a88f46${_scopeId}></div><span class="${ssrRenderClass([(_d2 = priorityConfig[ticket.priority]) == null ? void 0 : _d2.text, "text-xs"])}" data-v-b5a88f46${_scopeId}>${ssrInterpolate((_e2 = priorityConfig[ticket.priority]) == null ? void 0 : _e2.label)}</span></div><div class="hidden lg:flex items-center justify-center w-7 h-7" data-v-b5a88f46${_scopeId}>`);
                if (ticket.assignedTo) {
                  _push2(`<div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold"${ssrRenderAttr("title", ticket.assignedTo.fullName)} data-v-b5a88f46${_scopeId}>${ssrInterpolate(ticket.assignedTo.fullName.charAt(0).toUpperCase())}</div>`);
                } else {
                  _push2(`<div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/20" data-v-b5a88f46${_scopeId}><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b5a88f46${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" data-v-b5a88f46${_scopeId}></path></svg></div>`);
                }
                _push2(`</div><span class="text-white/30 text-xs whitespace-nowrap" data-v-b5a88f46${_scopeId}>${ssrInterpolate(timeAgo(ticket.updatedAt))}</span></div>`);
              });
              _push2(`<!--]--></div>`);
            }
            if (((_b3 = (_a3 = unref(ticketsStore).meta) == null ? void 0 : _a3.totalPages) != null ? _b3 : 0) > 1) {
              _push2(`<div class="flex items-center justify-between px-5 py-3 border-t border-white/10" data-v-b5a88f46${_scopeId}><p class="text-white/40 text-xs" data-v-b5a88f46${_scopeId}> Page ${ssrInterpolate(unref(ticketsStore).currentPage)} of ${ssrInterpolate(unref(ticketsStore).totalPages)} \xB7 ${ssrInterpolate((_c2 = unref(ticketsStore).meta) == null ? void 0 : _c2.total)} tickets </p><div class="flex gap-2" data-v-b5a88f46${_scopeId}><button${ssrIncludeBooleanAttr(!unref(ticketsStore).hasPrevPage) ? " disabled" : ""} class="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30" data-v-b5a88f46${_scopeId}> \u2190 Prev </button><button${ssrIncludeBooleanAttr(!unref(ticketsStore).hasNextPage) ? " disabled" : ""} class="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30" data-v-b5a88f46${_scopeId}> Next \u2192 </button></div></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", { class: "px-5 py-3 border-b border-white/10" }, [
                createVNode("div", { class: "grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center text-xs text-white/40 font-medium uppercase tracking-wider" }, [
                  createVNode("label", {
                    class: "flex items-center cursor-pointer",
                    onClick: withModifiers(() => {
                    }, ["stop"])
                  }, [
                    createVNode("input", {
                      type: "checkbox",
                      checked: unref(isAllSelected),
                      class: "w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30 cursor-pointer",
                      onChange: toggleSelectAll
                    }, null, 40, ["checked"])
                  ], 8, ["onClick"]),
                  createVNode("button", {
                    class: "text-left flex items-center gap-1 hover:text-white/60 transition-colors",
                    onClick: ($event) => toggleSort("createdAt")
                  }, [
                    createTextVNode(" Ticket "),
                    unref(ticketsStore).filters.sortBy === "createdAt" ? (openBlock(), createBlock("svg", {
                      key: 0,
                      class: ["w-3 h-3", unref(ticketsStore).filters.sortOrder === "asc" ? "rotate-180" : ""],
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M19 9l-7 7-7-7"
                      })
                    ], 2)) : createCommentVNode("", true)
                  ], 8, ["onClick"]),
                  createVNode("span", { class: "hidden md:block" }, "Status"),
                  createVNode("button", {
                    class: "hidden md:flex items-center gap-1 hover:text-white/60 transition-colors",
                    onClick: ($event) => toggleSort("priority")
                  }, [
                    createTextVNode(" Priority "),
                    unref(ticketsStore).filters.sortBy === "priority" ? (openBlock(), createBlock("svg", {
                      key: 0,
                      class: ["w-3 h-3", unref(ticketsStore).filters.sortOrder === "asc" ? "rotate-180" : ""],
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M19 9l-7 7-7-7"
                      })
                    ], 2)) : createCommentVNode("", true)
                  ], 8, ["onClick"]),
                  createVNode("span", { class: "hidden lg:block" }, "Agent"),
                  createVNode("button", {
                    class: "flex items-center gap-1 hover:text-white/60 transition-colors",
                    onClick: ($event) => toggleSort("updatedAt")
                  }, [
                    createTextVNode(" Updated "),
                    unref(ticketsStore).filters.sortBy === "updatedAt" ? (openBlock(), createBlock("svg", {
                      key: 0,
                      class: ["w-3 h-3", unref(ticketsStore).filters.sortOrder === "asc" ? "rotate-180" : ""],
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M19 9l-7 7-7-7"
                      })
                    ], 2)) : createCommentVNode("", true)
                  ], 8, ["onClick"])
                ])
              ]),
              unref(ticketsStore).isLoadingList ? (openBlock(), createBlock("div", {
                key: 0,
                class: "p-4 space-y-2"
              }, [
                (openBlock(), createBlock(Fragment, null, renderList(8, (i) => {
                  return createVNode("div", {
                    key: i,
                    class: "h-14 rounded-lg bg-white/5 animate-pulse",
                    style: { animationDelay: `${i * 50}ms` }
                  }, null, 4);
                }), 64))
              ])) : unref(ticketsStore).error ? (openBlock(), createBlock("div", {
                key: 1,
                class: "py-12 text-center text-red-400 text-sm"
              }, [
                createTextVNode(toDisplayString(unref(ticketsStore).error) + " ", 1),
                createVNode("button", {
                  class: "block mx-auto mt-3 text-white/40 hover:text-white/60 transition-colors underline text-xs",
                  onClick: ($event) => unref(ticketsStore).fetchTickets()
                }, " Try again ", 8, ["onClick"])
              ])) : !unref(ticketsStore).tickets.length ? (openBlock(), createBlock("div", {
                key: 2,
                class: "py-16 text-center"
              }, [
                createVNode("div", { class: "w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center" }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-7 h-7 text-white/20",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    })
                  ]))
                ]),
                createVNode("p", { class: "text-white/40 text-sm" }, toDisplayString(unref(hasActiveFilters) ? "No tickets match your filters." : "No tickets yet."), 1),
                unref(hasActiveFilters) ? (openBlock(), createBlock("button", {
                  key: 0,
                  class: "mt-3 text-indigo-400 hover:text-indigo-300 text-sm transition-colors",
                  onClick: clearFilters
                }, " Clear filters ")) : createCommentVNode("", true)
              ])) : (openBlock(), createBlock("div", {
                key: 3,
                class: "divide-y divide-white/5"
              }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(ticketsStore).tickets, (ticket) => {
                  var _a4, _b4, _c3, _d2, _e2;
                  return openBlock(), createBlock("div", {
                    key: ticket.id,
                    class: ["grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center px-5 py-4 hover:bg-white/5 transition-colors group", { "bg-indigo-500/5": unref(selectedTickets).has(ticket.id) }]
                  }, [
                    createVNode("label", {
                      class: "flex items-center cursor-pointer",
                      onClick: withModifiers(() => {
                      }, ["stop"])
                    }, [
                      createVNode("input", {
                        type: "checkbox",
                        checked: unref(selectedTickets).has(ticket.id),
                        class: "w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30 cursor-pointer",
                        onChange: ($event) => toggleTicket(ticket.id)
                      }, null, 40, ["checked", "onChange"])
                    ], 8, ["onClick"]),
                    createVNode(_component_NuxtLink, {
                      to: `/dashboard/tickets/${ticket.id}`,
                      class: "min-w-0"
                    }, {
                      default: withCtx(() => {
                        var _a5, _b5, _c4, _d3, _e3;
                        return [
                          createVNode("div", { class: "flex items-center gap-2" }, [
                            ticket.isBreachingSla ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "inline-flex flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse",
                              title: "SLA Breaching"
                            })) : createCommentVNode("", true),
                            createVNode("p", { class: "text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors" }, toDisplayString(ticket.subject), 1),
                            ticket.sentiment ? (openBlock(), createBlock("span", {
                              key: 1,
                              class: "flex-shrink-0 text-xs",
                              title: ticket.sentiment
                            }, toDisplayString(sentimentEmoji[ticket.sentiment]), 9, ["title"])) : createCommentVNode("", true),
                            ticket.channel ? (openBlock(), createBlock("span", {
                              key: 2,
                              class: "flex-shrink-0 text-xs",
                              title: ticket.channel
                            }, toDisplayString(channelIcon[ticket.channel]), 9, ["title"])) : createCommentVNode("", true)
                          ]),
                          createVNode("p", { class: "text-white/40 text-xs mt-0.5 truncate" }, [
                            createTextVNode(toDisplayString(ticket.customerName || ticket.customerEmail || "Unknown customer") + " ", 1),
                            ((_b5 = (_a5 = ticket._count) == null ? void 0 : _a5.messages) != null ? _b5 : 0) > 0 ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "ml-2"
                            }, " \xB7 " + toDisplayString((_c4 = ticket._count) == null ? void 0 : _c4.messages) + " msg" + toDisplayString(((_e3 = (_d3 = ticket._count) == null ? void 0 : _d3.messages) != null ? _e3 : 0) === 1 ? "" : "s"), 1)) : createCommentVNode("", true)
                          ])
                        ];
                      }),
                      _: 2
                    }, 1032, ["to"]),
                    createVNode("span", {
                      class: ["hidden md:inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", (_a4 = statusConfig[ticket.status]) == null ? void 0 : _a4.class]
                    }, toDisplayString((_b4 = statusConfig[ticket.status]) == null ? void 0 : _b4.label), 3),
                    createVNode("div", { class: "hidden md:flex items-center gap-1.5" }, [
                      createVNode("div", {
                        class: ["w-2 h-2 rounded-full", (_c3 = priorityConfig[ticket.priority]) == null ? void 0 : _c3.dot]
                      }, null, 2),
                      createVNode("span", {
                        class: ["text-xs", (_d2 = priorityConfig[ticket.priority]) == null ? void 0 : _d2.text]
                      }, toDisplayString((_e2 = priorityConfig[ticket.priority]) == null ? void 0 : _e2.label), 3)
                    ]),
                    createVNode("div", { class: "hidden lg:flex items-center justify-center w-7 h-7" }, [
                      ticket.assignedTo ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold",
                        title: ticket.assignedTo.fullName
                      }, toDisplayString(ticket.assignedTo.fullName.charAt(0).toUpperCase()), 9, ["title"])) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/20"
                      }, [
                        (openBlock(), createBlock("svg", {
                          class: "w-3 h-3",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          })
                        ]))
                      ]))
                    ]),
                    createVNode("span", { class: "text-white/30 text-xs whitespace-nowrap" }, toDisplayString(timeAgo(ticket.updatedAt)), 1)
                  ], 2);
                }), 128))
              ])),
              ((_e = (_d = unref(ticketsStore).meta) == null ? void 0 : _d.totalPages) != null ? _e : 0) > 1 ? (openBlock(), createBlock("div", {
                key: 4,
                class: "flex items-center justify-between px-5 py-3 border-t border-white/10"
              }, [
                createVNode("p", { class: "text-white/40 text-xs" }, " Page " + toDisplayString(unref(ticketsStore).currentPage) + " of " + toDisplayString(unref(ticketsStore).totalPages) + " \xB7 " + toDisplayString((_f = unref(ticketsStore).meta) == null ? void 0 : _f.total) + " tickets ", 1),
                createVNode("div", { class: "flex gap-2" }, [
                  createVNode("button", {
                    disabled: !unref(ticketsStore).hasPrevPage,
                    class: "btn-ghost text-xs px-3 py-1.5 disabled:opacity-30",
                    onClick: ($event) => unref(ticketsStore).goToPage(unref(ticketsStore).currentPage - 1)
                  }, " \u2190 Prev ", 8, ["disabled", "onClick"]),
                  createVNode("button", {
                    disabled: !unref(ticketsStore).hasNextPage,
                    class: "btn-ghost text-xs px-3 py-1.5 disabled:opacity-30",
                    onClick: ($event) => unref(ticketsStore).goToPage(unref(ticketsStore).currentPage + 1)
                  }, " Next \u2192 ", 8, ["disabled", "onClick"])
                ])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/tickets/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b5a88f46"]]);

export { index as default };
//# sourceMappingURL=index-CDMWWIuu.mjs.map
