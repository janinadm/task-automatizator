import { _ as __nuxt_component_0 } from './nuxt-link-CyRG7-rc.mjs';
import { _ as __nuxt_component_1 } from './GlassCard-C-gZz82T.mjs';
import { defineComponent, computed, watch, ref, mergeProps, withCtx, openBlock, createBlock, createVNode, unref, createTextVNode, toDisplayString, createCommentVNode, Fragment, renderList, withDirectives, withKeys, withModifiers, isRef, vModelText, Transition, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useTicketsStore, a as useRealtimeTickets } from './useRealtimeTickets-BIZ7HlFY.mjs';
import { u as useAuthStore } from './auth-CNfKvejC.mjs';
import { b as useRoute } from './server.mjs';
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

const useRealtimeMessages = () => {
  const supabase = useSupabaseClient();
  const ticketsStore = useTicketsStore();
  const toast = useToast();
  function subscribe(ticketId) {
    const channel = supabase.channel(`ticket-messages:${ticketId}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ticket_messages",
        // Filter by the specific ticket's ID column
        // (Filtrar por la columna ID del ticket específico)
        filter: `ticketId=eq.${ticketId}`
      },
      async (payload) => {
        var _a, _b, _c;
        const newMsgId = (_a = payload.new) == null ? void 0 : _a.id;
        const alreadyInStore = (_c = (_b = ticketsStore.currentTicket) == null ? void 0 : _b.messages) == null ? void 0 : _c.some(
          (m) => m.id === newMsgId
        );
        if (!alreadyInStore) {
          await ticketsStore.fetchTicket(ticketId);
          toast.info("\u{1F4AC} New message in this ticket");
        }
      }
    ).subscribe((status) => {
    });
    return channel;
  }
  return { subscribe };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const ticketsStore = useTicketsStore();
    useAuthStore();
    const ticketId = computed(() => String(route.params.id));
    const { subscribe: subscribeMessages } = useRealtimeMessages();
    useRealtimeTickets();
    const supabase = useSupabaseClient();
    let msgChannel = null;
    watch(ticketId, async (newId) => {
      if (msgChannel) {
        supabase.removeChannel(msgChannel);
        msgChannel = null;
      }
      await ticketsStore.fetchTicket(newId);
      msgChannel = subscribeMessages(newId);
    });
    const ticket = computed(() => ticketsStore.currentTicket);
    const showCannedPicker = ref(false);
    const cannedResponses = ref([]);
    const cannedSearch = ref("");
    const filteredCanned = computed(() => {
      const q = cannedSearch.value.toLowerCase();
      if (!q) return cannedResponses.value;
      return cannedResponses.value.filter(
        (r) => {
          var _a, _b;
          return r.title.toLowerCase().includes(q) || ((_a = r.shortcut) == null ? void 0 : _a.toLowerCase().includes(q)) || ((_b = r.category) == null ? void 0 : _b.toLowerCase().includes(q));
        }
      );
    });
    function useCannedResponse(response) {
      var _a, _b;
      let body = response.body;
      if (ticket.value) {
        body = body.replace(/\{\{ticket\.customerName\}\}/g, (_a = ticket.value.customerName) != null ? _a : "Customer");
        body = body.replace(/\{\{ticket\.subject\}\}/g, (_b = ticket.value.subject) != null ? _b : "");
      }
      replyText.value = body;
      showCannedPicker.value = false;
      cannedSearch.value = "";
      $fetch(`/api/canned-responses/${response.id}/use`, { method: "POST" }).catch(() => {
      });
    }
    const slaData = ref(null);
    ref(null);
    const slaElapsed = ref(0);
    const slaCountdown = computed(() => {
      if (!slaData.value || slaData.value.maxResponseMinutes === null) return null;
      if (slaData.value.firstResponseAt) return { responded: true };
      const remaining = slaData.value.maxResponseMinutes - slaElapsed.value;
      const absRemaining = Math.abs(remaining);
      const hours = Math.floor(absRemaining / 60);
      const mins = absRemaining % 60;
      return {
        responded: false,
        remaining,
        display: remaining < 0 ? `-${hours}h ${mins}m overdue` : `${hours}h ${mins}m remaining`,
        severity: slaData.value.breachSeverity
      };
    });
    const isUpdatingStatus = ref(false);
    async function updateStatus(newStatus) {
      var _a;
      if (((_a = ticket.value) == null ? void 0 : _a.status) === newStatus) return;
      isUpdatingStatus.value = true;
      try {
        await ticketsStore.updateTicket(ticketId.value, { status: newStatus });
      } finally {
        isUpdatingStatus.value = false;
      }
    }
    const replyText = ref("");
    const isSendingReply = ref(false);
    async function sendReply() {
      if (!replyText.value.trim()) return;
      isSendingReply.value = true;
      try {
        await $fetch(`/api/tickets/${ticketId.value}/messages`, {
          method: "POST",
          body: { body: replyText.value, senderType: "AGENT" }
        });
        replyText.value = "";
      } catch (e) {
        console.error("Failed to send reply:", e);
      } finally {
        isSendingReply.value = false;
      }
    }
    const statusOptions = [
      { value: "OPEN", label: "\u{1F4EC} Open", class: "text-blue-400" },
      { value: "IN_PROGRESS", label: "\u2699\uFE0F In Progress", class: "text-amber-400" },
      { value: "RESOLVED", label: "\u2705 Resolved", class: "text-green-400" },
      { value: "CLOSED", label: "\u{1F512} Closed", class: "text-white/40" }
    ];
    const priorityConfig = {
      URGENT: { label: "Urgent", dot: "bg-red-500", text: "text-red-400" },
      HIGH: { label: "High", dot: "bg-orange-400", text: "text-orange-400" },
      MEDIUM: { label: "Medium", dot: "bg-amber-400", text: "text-amber-400" },
      LOW: { label: "Low", dot: "bg-green-400", text: "text-green-400" }
    };
    const sentimentConfig = {
      POSITIVE: { emoji: "\u{1F60A}", text: "text-green-400" },
      NEUTRAL: { emoji: "\u{1F610}", text: "text-white/60" },
      NEGATIVE: { emoji: "\u{1F621}", text: "text-red-400" }
    };
    function formatDate(date) {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    }
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
    const isAnalyzing = ref(false);
    const analysisError = ref(null);
    const toast = useToast();
    async function analyzeWithAI() {
      var _a, _b;
      if (!ticketId.value) return;
      isAnalyzing.value = true;
      analysisError.value = null;
      try {
        await $fetch(`/api/tickets/${ticketId.value}/analyze`, { method: "POST" });
        await ticketsStore.fetchTicket(ticketId.value);
        toast.success("AI analysis complete");
      } catch (e) {
        analysisError.value = (_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) != null ? _b : "AI analysis failed";
        toast.error(analysisError.value);
      } finally {
        isAnalyzing.value = false;
      }
    }
    const slaStatus = computed(() => {
      if (!ticket.value) return null;
      if (ticket.value.isBreachingSla) {
        return { label: "Breached", class: "text-red-400", bgClass: "bg-red-500/10 border-red-500/20" };
      }
      if (ticket.value.priority === "URGENT" && ["OPEN", "IN_PROGRESS"].includes(ticket.value.status)) {
        return { label: "At risk", class: "text-amber-400", bgClass: "bg-amber-500/10 border-amber-500/20" };
      }
      return null;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiGlassCard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in" }, _attrs))}><div class="flex items-center gap-3 mb-5">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/dashboard/tickets",
        class: "text-white/40 hover:text-white/70 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"${_scopeId}></path></svg>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                class: "w-5 h-5",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M15 19l-7-7 7-7"
                })
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h2 class="text-lg font-semibold text-white truncate">${ssrInterpolate(unref(ticketsStore).isLoadingDetail ? "Loading ticket..." : (_b = (_a = unref(ticket)) == null ? void 0 : _a.subject) != null ? _b : "Ticket not found")}</h2></div>`);
      if (unref(ticketsStore).isLoadingDetail) {
        _push(`<div class="grid lg:grid-cols-3 gap-5"><div class="lg:col-span-2 space-y-3"><!--[-->`);
        ssrRenderList(4, (i) => {
          _push(`<div class="h-20 rounded-xl bg-white/5 animate-pulse"></div>`);
        });
        _push(`<!--]--></div><div class="space-y-4"><div class="h-40 rounded-xl bg-white/5 animate-pulse"></div><div class="h-32 rounded-xl bg-white/5 animate-pulse"></div></div></div>`);
      } else if (!unref(ticket)) {
        _push(`<div class="py-16 text-center"><p class="text-white/40">Ticket not found or you don&#39;t have access.</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/dashboard/tickets",
          class: "block mt-3 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u2190 Back to tickets `);
            } else {
              return [
                createTextVNode(" \u2190 Back to tickets ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="grid lg:grid-cols-3 gap-5"><div class="lg:col-span-2 flex flex-col gap-4">`);
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "none" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d, _e, _f;
            if (_push2) {
              _push2(`<div class="px-5 py-4 border-b border-white/10 flex items-center justify-between"${_scopeId}><h3 class="text-white font-semibold text-sm"${_scopeId}>Conversation</h3><span class="text-white/40 text-xs"${_scopeId}>${ssrInterpolate((_b2 = (_a2 = unref(ticket).messages) == null ? void 0 : _a2.length) != null ? _b2 : 0)} messages</span></div><div class="divide-y divide-white/5 max-h-[512px] overflow-y-auto"${_scopeId}>`);
              if (!((_c2 = unref(ticket).messages) == null ? void 0 : _c2.length)) {
                _push2(`<div class="py-10 text-center text-white/30 text-sm"${_scopeId}> No messages yet \u2014 the conversation starts here. </div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--[-->`);
              ssrRenderList(unref(ticket).messages, (msg) => {
                var _a3, _b3, _c3, _d2, _e2, _f2;
                _push2(`<div class="${ssrRenderClass([{
                  "bg-indigo-500/5": msg.senderType === "AGENT",
                  "bg-purple-500/5": msg.senderType === "AI"
                }, "px-5 py-4"])}"${_scopeId}><div class="flex items-start gap-3"${_scopeId}><div class="${ssrRenderClass([{
                  "bg-gradient-to-br from-indigo-400 to-purple-500 text-white": msg.senderType === "AGENT",
                  "bg-gradient-to-br from-purple-500 to-pink-500 text-white": msg.senderType === "AI",
                  "bg-white/10 text-white/60": msg.senderType === "CUSTOMER"
                }, "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"])}"${_scopeId}>`);
                if (msg.senderType === "AI") {
                  _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"${_scopeId}></path></svg>`);
                } else {
                  _push2(`<span${_scopeId}>${ssrInterpolate(((_b3 = (_a3 = msg.sender) == null ? void 0 : _a3.fullName) != null ? _b3 : "C").charAt(0).toUpperCase())}</span>`);
                }
                _push2(`</div><div class="flex-1 min-w-0"${_scopeId}><div class="flex items-center gap-2 mb-1"${_scopeId}><span class="text-white text-sm font-medium"${_scopeId}>${ssrInterpolate(msg.senderType === "AI" ? "\u26A1 AI Assistant" : (_d2 = (_c3 = msg.sender) == null ? void 0 : _c3.fullName) != null ? _d2 : "Customer")}</span>`);
                if (msg.senderType !== "CUSTOMER") {
                  _push2(`<span class="${ssrRenderClass([msg.senderType === "AI" ? "bg-purple-500/20 text-purple-300" : "bg-indigo-500/20 text-indigo-300", "text-xs px-1.5 py-0.5 rounded-full"])}"${_scopeId}>${ssrInterpolate(msg.senderType === "AI" ? "AI" : (_f2 = (_e2 = msg.sender) == null ? void 0 : _e2.role) == null ? void 0 : _f2.toLowerCase())}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<span class="text-white/30 text-xs ml-auto"${_scopeId}>${ssrInterpolate(timeAgo(msg.createdAt))}</span></div><p class="text-white/80 text-sm leading-relaxed whitespace-pre-wrap"${_scopeId}>${ssrInterpolate(msg.body)}</p></div></div></div>`);
              });
              _push2(`<!--]--></div><div class="px-5 py-4 border-t border-white/10"${_scopeId}><textarea rows="3" placeholder="Type your reply... (press Shift+Enter for new line)" class="input-glass w-full resize-none text-sm"${_scopeId}>${ssrInterpolate(unref(replyText))}</textarea><div class="flex items-center justify-between mt-3"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><p class="text-white/30 text-xs"${_scopeId}>Enter to send \xB7 Shift+Enter for new line</p><div class="relative"${_scopeId}><button class="text-white/40 hover:text-indigo-400 transition-colors text-xs flex items-center gap-1 border border-white/10 rounded-lg px-2 py-1 hover:border-indigo-500/30 hover:bg-indigo-500/5"${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"${_scopeId}></path></svg> Templates </button>`);
              if (unref(showCannedPicker)) {
                _push2(`<div class="absolute left-0 bottom-full mb-2 w-80 max-h-72 bg-[#12101f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"${_scopeId}><div class="px-3 py-2 border-b border-white/[0.06]"${_scopeId}><input${ssrRenderAttr("value", unref(cannedSearch))} type="text" placeholder="Search templates..." class="input-glass w-full text-xs py-1.5"${_scopeId}></div><div class="overflow-y-auto max-h-52 divide-y divide-white/[0.04]"${_scopeId}><!--[-->`);
                ssrRenderList(unref(filteredCanned), (cr) => {
                  _push2(`<button class="w-full text-left px-3 py-2.5 hover:bg-white/[0.04] transition-colors"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><span class="text-white/80 text-sm font-medium truncate"${_scopeId}>${ssrInterpolate(cr.title)}</span>`);
                  if (cr.shortcut) {
                    _push2(`<span class="text-indigo-400/60 text-[10px] font-mono"${_scopeId}>${ssrInterpolate(cr.shortcut)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><p class="text-white/30 text-xs mt-0.5 truncate"${_scopeId}>${ssrInterpolate(cr.body)}</p>`);
                  if (cr.category) {
                    _push2(`<span class="text-white/20 text-[10px] mt-0.5 block"${_scopeId}>${ssrInterpolate(cr.category)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</button>`);
                });
                _push2(`<!--]-->`);
                if (!unref(filteredCanned).length) {
                  _push2(`<div class="py-4 text-center text-white/30 text-xs"${_scopeId}> No templates found </div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div><button class="btn-primary text-sm flex items-center gap-2"${ssrIncludeBooleanAttr(!unref(replyText).trim() || unref(isSendingReply)) ? " disabled" : ""}${_scopeId}>`);
              if (unref(isSendingReply)) {
                _push2(`<svg class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"${_scopeId}></path></svg>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(` ${ssrInterpolate(unref(isSendingReply) ? "Sending..." : "Send Reply")}</button></div></div>`);
            } else {
              return [
                createVNode("div", { class: "px-5 py-4 border-b border-white/10 flex items-center justify-between" }, [
                  createVNode("h3", { class: "text-white font-semibold text-sm" }, "Conversation"),
                  createVNode("span", { class: "text-white/40 text-xs" }, toDisplayString((_e = (_d = unref(ticket).messages) == null ? void 0 : _d.length) != null ? _e : 0) + " messages", 1)
                ]),
                createVNode("div", { class: "divide-y divide-white/5 max-h-[512px] overflow-y-auto" }, [
                  !((_f = unref(ticket).messages) == null ? void 0 : _f.length) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "py-10 text-center text-white/30 text-sm"
                  }, " No messages yet \u2014 the conversation starts here. ")) : createCommentVNode("", true),
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(ticket).messages, (msg) => {
                    var _a3, _b3, _c3, _d2, _e2, _f2;
                    return openBlock(), createBlock("div", {
                      key: msg.id,
                      class: ["px-5 py-4", {
                        "bg-indigo-500/5": msg.senderType === "AGENT",
                        "bg-purple-500/5": msg.senderType === "AI"
                      }]
                    }, [
                      createVNode("div", { class: "flex items-start gap-3" }, [
                        createVNode("div", {
                          class: ["w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5", {
                            "bg-gradient-to-br from-indigo-400 to-purple-500 text-white": msg.senderType === "AGENT",
                            "bg-gradient-to-br from-purple-500 to-pink-500 text-white": msg.senderType === "AI",
                            "bg-white/10 text-white/60": msg.senderType === "CUSTOMER"
                          }]
                        }, [
                          msg.senderType === "AI" ? (openBlock(), createBlock("svg", {
                            key: 0,
                            class: "w-4 h-4",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M13 10V3L4 14h7v7l9-11h-7z"
                            })
                          ])) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(((_b3 = (_a3 = msg.sender) == null ? void 0 : _a3.fullName) != null ? _b3 : "C").charAt(0).toUpperCase()), 1))
                        ], 2),
                        createVNode("div", { class: "flex-1 min-w-0" }, [
                          createVNode("div", { class: "flex items-center gap-2 mb-1" }, [
                            createVNode("span", { class: "text-white text-sm font-medium" }, toDisplayString(msg.senderType === "AI" ? "\u26A1 AI Assistant" : (_d2 = (_c3 = msg.sender) == null ? void 0 : _c3.fullName) != null ? _d2 : "Customer"), 1),
                            msg.senderType !== "CUSTOMER" ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: ["text-xs px-1.5 py-0.5 rounded-full", msg.senderType === "AI" ? "bg-purple-500/20 text-purple-300" : "bg-indigo-500/20 text-indigo-300"]
                            }, toDisplayString(msg.senderType === "AI" ? "AI" : (_f2 = (_e2 = msg.sender) == null ? void 0 : _e2.role) == null ? void 0 : _f2.toLowerCase()), 3)) : createCommentVNode("", true),
                            createVNode("span", { class: "text-white/30 text-xs ml-auto" }, toDisplayString(timeAgo(msg.createdAt)), 1)
                          ]),
                          createVNode("p", { class: "text-white/80 text-sm leading-relaxed whitespace-pre-wrap" }, toDisplayString(msg.body), 1)
                        ])
                      ])
                    ], 2);
                  }), 128))
                ]),
                createVNode("div", { class: "px-5 py-4 border-t border-white/10" }, [
                  withDirectives(createVNode("textarea", {
                    "onUpdate:modelValue": ($event) => isRef(replyText) ? replyText.value = $event : null,
                    rows: "3",
                    placeholder: "Type your reply... (press Shift+Enter for new line)",
                    class: "input-glass w-full resize-none text-sm",
                    onKeydown: withKeys(withModifiers(sendReply, ["exact", "prevent"]), ["enter"])
                  }, null, 40, ["onUpdate:modelValue", "onKeydown"]), [
                    [vModelText, unref(replyText)]
                  ]),
                  createVNode("div", { class: "flex items-center justify-between mt-3" }, [
                    createVNode("div", { class: "flex items-center gap-2" }, [
                      createVNode("p", { class: "text-white/30 text-xs" }, "Enter to send \xB7 Shift+Enter for new line"),
                      createVNode("div", { class: "relative" }, [
                        createVNode("button", {
                          class: "text-white/40 hover:text-indigo-400 transition-colors text-xs flex items-center gap-1 border border-white/10 rounded-lg px-2 py-1 hover:border-indigo-500/30 hover:bg-indigo-500/5",
                          onClick: ($event) => showCannedPicker.value = !unref(showCannedPicker)
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
                              d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            })
                          ])),
                          createTextVNode(" Templates ")
                        ], 8, ["onClick"]),
                        createVNode(Transition, { name: "fade" }, {
                          default: withCtx(() => [
                            unref(showCannedPicker) ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "absolute left-0 bottom-full mb-2 w-80 max-h-72 bg-[#12101f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                            }, [
                              createVNode("div", { class: "px-3 py-2 border-b border-white/[0.06]" }, [
                                withDirectives(createVNode("input", {
                                  "onUpdate:modelValue": ($event) => isRef(cannedSearch) ? cannedSearch.value = $event : null,
                                  type: "text",
                                  placeholder: "Search templates...",
                                  class: "input-glass w-full text-xs py-1.5"
                                }, null, 8, ["onUpdate:modelValue"]), [
                                  [vModelText, unref(cannedSearch)]
                                ])
                              ]),
                              createVNode("div", { class: "overflow-y-auto max-h-52 divide-y divide-white/[0.04]" }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredCanned), (cr) => {
                                  return openBlock(), createBlock("button", {
                                    key: cr.id,
                                    class: "w-full text-left px-3 py-2.5 hover:bg-white/[0.04] transition-colors",
                                    onClick: ($event) => useCannedResponse(cr)
                                  }, [
                                    createVNode("div", { class: "flex items-center gap-2" }, [
                                      createVNode("span", { class: "text-white/80 text-sm font-medium truncate" }, toDisplayString(cr.title), 1),
                                      cr.shortcut ? (openBlock(), createBlock("span", {
                                        key: 0,
                                        class: "text-indigo-400/60 text-[10px] font-mono"
                                      }, toDisplayString(cr.shortcut), 1)) : createCommentVNode("", true)
                                    ]),
                                    createVNode("p", { class: "text-white/30 text-xs mt-0.5 truncate" }, toDisplayString(cr.body), 1),
                                    cr.category ? (openBlock(), createBlock("span", {
                                      key: 0,
                                      class: "text-white/20 text-[10px] mt-0.5 block"
                                    }, toDisplayString(cr.category), 1)) : createCommentVNode("", true)
                                  ], 8, ["onClick"]);
                                }), 128)),
                                !unref(filteredCanned).length ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "py-4 text-center text-white/30 text-xs"
                                }, " No templates found ")) : createCommentVNode("", true)
                              ])
                            ])) : createCommentVNode("", true)
                          ]),
                          _: 1
                        })
                      ])
                    ]),
                    createVNode("button", {
                      class: "btn-primary text-sm flex items-center gap-2",
                      disabled: !unref(replyText).trim() || unref(isSendingReply),
                      onClick: sendReply
                    }, [
                      unref(isSendingReply) ? (openBlock(), createBlock("svg", {
                        key: 0,
                        class: "animate-spin w-3.5 h-3.5",
                        fill: "none",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("circle", {
                          class: "opacity-25",
                          cx: "12",
                          cy: "12",
                          r: "10",
                          stroke: "currentColor",
                          "stroke-width": "4"
                        }),
                        createVNode("path", {
                          class: "opacity-75",
                          fill: "currentColor",
                          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        })
                      ])) : createCommentVNode("", true),
                      createTextVNode(" " + toDisplayString(unref(isSendingReply) ? "Sending..." : "Send Reply"), 1)
                    ], 8, ["disabled"])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        if ((_c = unref(ticket).aiSuggestions) == null ? void 0 : _c.length) {
          _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"${_scopeId}></path></svg> AI Suggested Replies </h3><div class="space-y-3"${_scopeId}><!--[-->`);
                ssrRenderList(unref(ticket).aiSuggestions, (suggestion) => {
                  _push2(`<div class="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"${_scopeId}><div class="flex items-start justify-between gap-2 mb-2"${_scopeId}><p class="text-white/80 text-sm leading-relaxed"${_scopeId}>${ssrInterpolate(suggestion.suggestedReply)}</p><button class="flex-shrink-0 text-purple-400 hover:text-purple-300 transition-colors text-xs border border-purple-500/30 rounded-lg px-2 py-1 hover:bg-purple-500/10"${_scopeId}> Use </button></div><div class="flex items-center gap-3 text-xs text-white/30"${_scopeId}>`);
                  if (suggestion.confidence != null) {
                    _push2(`<span${_scopeId}> Confidence: ${ssrInterpolate(Math.round(suggestion.confidence * 100))}% </span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (suggestion.category) {
                    _push2(`<span${_scopeId}>Category: ${ssrInterpolate(suggestion.category)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                return [
                  createVNode("h3", { class: "text-white font-semibold text-sm mb-4 flex items-center gap-2" }, [
                    (openBlock(), createBlock("svg", {
                      class: "w-4 h-4 text-purple-400",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M13 10V3L4 14h7v7l9-11h-7z"
                      })
                    ])),
                    createTextVNode(" AI Suggested Replies ")
                  ]),
                  createVNode("div", { class: "space-y-3" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(ticket).aiSuggestions, (suggestion) => {
                      return openBlock(), createBlock("div", {
                        key: suggestion.id,
                        class: "p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
                      }, [
                        createVNode("div", { class: "flex items-start justify-between gap-2 mb-2" }, [
                          createVNode("p", { class: "text-white/80 text-sm leading-relaxed" }, toDisplayString(suggestion.suggestedReply), 1),
                          createVNode("button", {
                            class: "flex-shrink-0 text-purple-400 hover:text-purple-300 transition-colors text-xs border border-purple-500/30 rounded-lg px-2 py-1 hover:bg-purple-500/10",
                            onClick: ($event) => {
                              var _a2;
                              return replyText.value = (_a2 = suggestion.suggestedReply) != null ? _a2 : "";
                            }
                          }, " Use ", 8, ["onClick"])
                        ]),
                        createVNode("div", { class: "flex items-center gap-3 text-xs text-white/30" }, [
                          suggestion.confidence != null ? (openBlock(), createBlock("span", { key: 0 }, " Confidence: " + toDisplayString(Math.round(suggestion.confidence * 100)) + "% ", 1)) : createCommentVNode("", true),
                          suggestion.category ? (openBlock(), createBlock("span", { key: 1 }, "Category: " + toDisplayString(suggestion.category), 1)) : createCommentVNode("", true)
                        ])
                      ]);
                    }), 128))
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-4">`);
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-3"${_scopeId}>Status</h3><div class="space-y-1.5"${_scopeId}><!--[-->`);
              ssrRenderList(statusOptions, (opt) => {
                _push2(`<button class="${ssrRenderClass([unref(ticket).status === opt.value ? "bg-white/10 text-white font-medium border border-white/20" : "text-white/50 hover:bg-white/5 hover:text-white/80", "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200"])}"${ssrIncludeBooleanAttr(unref(isUpdatingStatus)) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(opt.label)} `);
                if (unref(ticket).status === opt.value && unref(isUpdatingStatus)) {
                  _push2(`<span class="float-right"${_scopeId}><svg class="animate-spin w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"${_scopeId}></path></svg></span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</button>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("h3", { class: "text-white/60 text-xs font-medium uppercase tracking-wider mb-3" }, "Status"),
                createVNode("div", { class: "space-y-1.5" }, [
                  (openBlock(), createBlock(Fragment, null, renderList(statusOptions, (opt) => {
                    return createVNode("button", {
                      key: opt.value,
                      class: ["w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200", unref(ticket).status === opt.value ? "bg-white/10 text-white font-medium border border-white/20" : "text-white/50 hover:bg-white/5 hover:text-white/80"],
                      disabled: unref(isUpdatingStatus),
                      onClick: ($event) => updateStatus(opt.value)
                    }, [
                      createTextVNode(toDisplayString(opt.label) + " ", 1),
                      unref(ticket).status === opt.value && unref(isUpdatingStatus) ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "float-right"
                      }, [
                        (openBlock(), createBlock("svg", {
                          class: "animate-spin w-3.5 h-3.5 inline",
                          fill: "none",
                          viewBox: "0 0 24 24"
                        }, [
                          createVNode("circle", {
                            class: "opacity-25",
                            cx: "12",
                            cy: "12",
                            r: "10",
                            stroke: "currentColor",
                            "stroke-width": "4"
                          }),
                          createVNode("path", {
                            class: "opacity-75",
                            fill: "currentColor",
                            d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          })
                        ]))
                      ])) : createCommentVNode("", true)
                    ], 10, ["disabled", "onClick"]);
                  }), 64))
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
            if (_push2) {
              _push2(`<h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-3"${_scopeId}>Details</h3><dl class="space-y-3"${_scopeId}><div class="flex items-center justify-between"${_scopeId}><dt class="text-white/40 text-xs"${_scopeId}>Priority</dt><dd class="flex items-center gap-1.5"${_scopeId}><div class="${ssrRenderClass([(_a2 = priorityConfig[unref(ticket).priority]) == null ? void 0 : _a2.dot, "w-2 h-2 rounded-full"])}"${_scopeId}></div><span class="${ssrRenderClass([(_b2 = priorityConfig[unref(ticket).priority]) == null ? void 0 : _b2.text, "text-sm"])}"${_scopeId}>${ssrInterpolate((_c2 = priorityConfig[unref(ticket).priority]) == null ? void 0 : _c2.label)}</span></dd></div>`);
              if (unref(ticket).sentiment) {
                _push2(`<div class="flex items-center justify-between"${_scopeId}><dt class="text-white/40 text-xs"${_scopeId}>Sentiment</dt><dd class="${ssrRenderClass([(_d = sentimentConfig[unref(ticket).sentiment]) == null ? void 0 : _d.text, "flex items-center gap-1.5 text-sm"])}"${_scopeId}>${ssrInterpolate((_e = sentimentConfig[unref(ticket).sentiment]) == null ? void 0 : _e.emoji)} ${ssrInterpolate((_f = unref(ticket).sentiment) == null ? void 0 : _f.toLowerCase())}</dd></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="flex items-center justify-between"${_scopeId}><dt class="text-white/40 text-xs"${_scopeId}>Channel</dt><dd class="text-white/70 text-sm"${_scopeId}>${ssrInterpolate((_g = unref(ticket).channel) == null ? void 0 : _g.toLowerCase())}</dd></div>`);
              if (unref(ticket).category) {
                _push2(`<div class="flex items-center justify-between"${_scopeId}><dt class="text-white/40 text-xs"${_scopeId}>Category</dt><dd class="text-white/70 text-sm"${_scopeId}>${ssrInterpolate(unref(ticket).category)}</dd></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(ticket).language) {
                _push2(`<div class="flex items-center justify-between"${_scopeId}><dt class="text-white/40 text-xs"${_scopeId}>Language</dt><dd class="text-white/70 text-sm uppercase"${_scopeId}>${ssrInterpolate(unref(ticket).language)}</dd></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(slaCountdown)) {
                _push2(`<div class="flex items-center justify-between"${_scopeId}><dt class="text-white/40 text-xs"${_scopeId}>SLA</dt><dd${_scopeId}>`);
                if (unref(slaCountdown).responded) {
                  _push2(`<span class="px-2 py-0.5 rounded-full text-xs border bg-green-500/10 border-green-500/20 text-green-400"${_scopeId}> \u2713 Responded </span>`);
                } else {
                  _push2(`<span class="${ssrRenderClass([{
                    "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse": unref(slaCountdown).severity === "breached" || unref(slaCountdown).severity === "critical",
                    "bg-amber-500/10 border-amber-500/20 text-amber-400": unref(slaCountdown).severity === "warning",
                    "bg-green-500/10 border-green-500/20 text-green-400": unref(slaCountdown).severity === "none"
                  }, "px-2 py-0.5 rounded-full text-xs border font-mono"])}"${_scopeId}>${ssrInterpolate(unref(slaCountdown).display)}</span>`);
                }
                _push2(`</dd></div>`);
              } else if (unref(slaStatus)) {
                _push2(`<div class="flex items-center justify-between"${_scopeId}><dt class="text-white/40 text-xs"${_scopeId}>SLA</dt><dd${_scopeId}><span class="${ssrRenderClass([unref(slaStatus).bgClass + " " + unref(slaStatus).class, "px-2 py-0.5 rounded-full text-xs border"])}"${_scopeId}>${ssrInterpolate(unref(slaStatus).label)}</span></dd></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="flex items-center justify-between"${_scopeId}><dt class="text-white/40 text-xs"${_scopeId}>Created</dt><dd class="text-white/60 text-xs"${_scopeId}>${ssrInterpolate(formatDate(unref(ticket).createdAt))}</dd></div>`);
              if (unref(ticket).resolvedAt) {
                _push2(`<div class="flex items-center justify-between"${_scopeId}><dt class="text-white/40 text-xs"${_scopeId}>Resolved</dt><dd class="text-white/60 text-xs"${_scopeId}>${ssrInterpolate(formatDate(unref(ticket).resolvedAt))}</dd></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</dl>`);
            } else {
              return [
                createVNode("h3", { class: "text-white/60 text-xs font-medium uppercase tracking-wider mb-3" }, "Details"),
                createVNode("dl", { class: "space-y-3" }, [
                  createVNode("div", { class: "flex items-center justify-between" }, [
                    createVNode("dt", { class: "text-white/40 text-xs" }, "Priority"),
                    createVNode("dd", { class: "flex items-center gap-1.5" }, [
                      createVNode("div", {
                        class: ["w-2 h-2 rounded-full", (_h = priorityConfig[unref(ticket).priority]) == null ? void 0 : _h.dot]
                      }, null, 2),
                      createVNode("span", {
                        class: ["text-sm", (_i = priorityConfig[unref(ticket).priority]) == null ? void 0 : _i.text]
                      }, toDisplayString((_j = priorityConfig[unref(ticket).priority]) == null ? void 0 : _j.label), 3)
                    ])
                  ]),
                  unref(ticket).sentiment ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "flex items-center justify-between"
                  }, [
                    createVNode("dt", { class: "text-white/40 text-xs" }, "Sentiment"),
                    createVNode("dd", {
                      class: ["flex items-center gap-1.5 text-sm", (_k = sentimentConfig[unref(ticket).sentiment]) == null ? void 0 : _k.text]
                    }, toDisplayString((_l = sentimentConfig[unref(ticket).sentiment]) == null ? void 0 : _l.emoji) + " " + toDisplayString((_m = unref(ticket).sentiment) == null ? void 0 : _m.toLowerCase()), 3)
                  ])) : createCommentVNode("", true),
                  createVNode("div", { class: "flex items-center justify-between" }, [
                    createVNode("dt", { class: "text-white/40 text-xs" }, "Channel"),
                    createVNode("dd", { class: "text-white/70 text-sm" }, toDisplayString((_n = unref(ticket).channel) == null ? void 0 : _n.toLowerCase()), 1)
                  ]),
                  unref(ticket).category ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "flex items-center justify-between"
                  }, [
                    createVNode("dt", { class: "text-white/40 text-xs" }, "Category"),
                    createVNode("dd", { class: "text-white/70 text-sm" }, toDisplayString(unref(ticket).category), 1)
                  ])) : createCommentVNode("", true),
                  unref(ticket).language ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "flex items-center justify-between"
                  }, [
                    createVNode("dt", { class: "text-white/40 text-xs" }, "Language"),
                    createVNode("dd", { class: "text-white/70 text-sm uppercase" }, toDisplayString(unref(ticket).language), 1)
                  ])) : createCommentVNode("", true),
                  unref(slaCountdown) ? (openBlock(), createBlock("div", {
                    key: 3,
                    class: "flex items-center justify-between"
                  }, [
                    createVNode("dt", { class: "text-white/40 text-xs" }, "SLA"),
                    createVNode("dd", null, [
                      unref(slaCountdown).responded ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "px-2 py-0.5 rounded-full text-xs border bg-green-500/10 border-green-500/20 text-green-400"
                      }, " \u2713 Responded ")) : (openBlock(), createBlock("span", {
                        key: 1,
                        class: ["px-2 py-0.5 rounded-full text-xs border font-mono", {
                          "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse": unref(slaCountdown).severity === "breached" || unref(slaCountdown).severity === "critical",
                          "bg-amber-500/10 border-amber-500/20 text-amber-400": unref(slaCountdown).severity === "warning",
                          "bg-green-500/10 border-green-500/20 text-green-400": unref(slaCountdown).severity === "none"
                        }]
                      }, toDisplayString(unref(slaCountdown).display), 3))
                    ])
                  ])) : unref(slaStatus) ? (openBlock(), createBlock("div", {
                    key: 4,
                    class: "flex items-center justify-between"
                  }, [
                    createVNode("dt", { class: "text-white/40 text-xs" }, "SLA"),
                    createVNode("dd", null, [
                      createVNode("span", {
                        class: ["px-2 py-0.5 rounded-full text-xs border", unref(slaStatus).bgClass + " " + unref(slaStatus).class]
                      }, toDisplayString(unref(slaStatus).label), 3)
                    ])
                  ])) : createCommentVNode("", true),
                  createVNode("div", { class: "flex items-center justify-between" }, [
                    createVNode("dt", { class: "text-white/40 text-xs" }, "Created"),
                    createVNode("dd", { class: "text-white/60 text-xs" }, toDisplayString(formatDate(unref(ticket).createdAt)), 1)
                  ]),
                  unref(ticket).resolvedAt ? (openBlock(), createBlock("div", {
                    key: 5,
                    class: "flex items-center justify-between"
                  }, [
                    createVNode("dt", { class: "text-white/40 text-xs" }, "Resolved"),
                    createVNode("dd", { class: "text-white/60 text-xs" }, toDisplayString(formatDate(unref(ticket).resolvedAt)), 1)
                  ])) : createCommentVNode("", true)
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-3"${_scopeId}>Assigned Agent</h3>`);
              if (unref(ticket).assignedTo) {
                _push2(`<div class="flex items-center gap-3"${_scopeId}><div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold"${_scopeId}>${ssrInterpolate(unref(ticket).assignedTo.fullName.charAt(0).toUpperCase())}</div><div${_scopeId}><p class="text-white text-sm font-medium"${_scopeId}>${ssrInterpolate(unref(ticket).assignedTo.fullName)}</p><p class="text-white/40 text-xs"${_scopeId}>Agent</p></div></div>`);
              } else {
                _push2(`<div class="text-white/40 text-sm text-center py-3"${_scopeId}> Unassigned </div>`);
              }
            } else {
              return [
                createVNode("h3", { class: "text-white/60 text-xs font-medium uppercase tracking-wider mb-3" }, "Assigned Agent"),
                unref(ticket).assignedTo ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "flex items-center gap-3"
                }, [
                  createVNode("div", { class: "w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold" }, toDisplayString(unref(ticket).assignedTo.fullName.charAt(0).toUpperCase()), 1),
                  createVNode("div", null, [
                    createVNode("p", { class: "text-white text-sm font-medium" }, toDisplayString(unref(ticket).assignedTo.fullName), 1),
                    createVNode("p", { class: "text-white/40 text-xs" }, "Agent")
                  ])
                ])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "text-white/40 text-sm text-center py-3"
                }, " Unassigned "))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5"${_scopeId}><svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"${_scopeId}></path></svg> AI Analysis </h3><button class="w-full btn-primary text-sm flex items-center justify-center gap-2"${ssrIncludeBooleanAttr(unref(isAnalyzing)) ? " disabled" : ""}${_scopeId}>`);
              if (unref(isAnalyzing)) {
                _push2(`<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"${_scopeId}></path></svg>`);
              } else {
                _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"${_scopeId}></path></svg>`);
              }
              _push2(` ${ssrInterpolate(unref(isAnalyzing) ? "Analyzing..." : "Analyze with AI")}</button>`);
              if (unref(analysisError)) {
                _push2(`<p class="text-red-400 text-xs mt-2 text-center"${_scopeId}>${ssrInterpolate(unref(analysisError))}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<p class="text-white/30 text-xs mt-2 text-center"${_scopeId}> Detects sentiment, priority, category &amp; suggests a reply </p>`);
            } else {
              return [
                createVNode("h3", { class: "text-white/60 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5" }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-3.5 h-3.5 text-purple-400",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M13 10V3L4 14h7v7l9-11h-7z"
                    })
                  ])),
                  createTextVNode(" AI Analysis ")
                ]),
                createVNode("button", {
                  class: "w-full btn-primary text-sm flex items-center justify-center gap-2",
                  disabled: unref(isAnalyzing),
                  onClick: analyzeWithAI
                }, [
                  unref(isAnalyzing) ? (openBlock(), createBlock("svg", {
                    key: 0,
                    class: "animate-spin w-4 h-4",
                    fill: "none",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("circle", {
                      class: "opacity-25",
                      cx: "12",
                      cy: "12",
                      r: "10",
                      stroke: "currentColor",
                      "stroke-width": "4"
                    }),
                    createVNode("path", {
                      class: "opacity-75",
                      fill: "currentColor",
                      d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    })
                  ])) : (openBlock(), createBlock("svg", {
                    key: 1,
                    class: "w-4 h-4",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M13 10V3L4 14h7v7l9-11h-7z"
                    })
                  ])),
                  createTextVNode(" " + toDisplayString(unref(isAnalyzing) ? "Analyzing..." : "Analyze with AI"), 1)
                ], 8, ["disabled"]),
                unref(analysisError) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-red-400 text-xs mt-2 text-center"
                }, toDisplayString(unref(analysisError)), 1)) : createCommentVNode("", true),
                createVNode("p", { class: "text-white/30 text-xs mt-2 text-center" }, " Detects sentiment, priority, category & suggests a reply ")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(ticket).summary) {
          _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5"${_scopeId}><svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"${_scopeId}></path></svg> AI Summary </h3><p class="text-white/70 text-sm leading-relaxed"${_scopeId}>${ssrInterpolate(unref(ticket).summary)}</p>`);
              } else {
                return [
                  createVNode("h3", { class: "text-white/60 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5" }, [
                    (openBlock(), createBlock("svg", {
                      class: "w-3.5 h-3.5 text-purple-400",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M13 10V3L4 14h7v7l9-11h-7z"
                      })
                    ])),
                    createTextVNode(" AI Summary ")
                  ]),
                  createVNode("p", { class: "text-white/70 text-sm leading-relaxed" }, toDisplayString(unref(ticket).summary), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/tickets/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BKiWE54g.mjs.map
