import { _ as __nuxt_component_0 } from './nuxt-link-CyRG7-rc.mjs';
import { defineComponent, withAsyncContext, ref, unref, withCtx, openBlock, createBlock, createVNode, createTextVNode, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderAttr, ssrRenderSlot, ssrRenderTeleport, ssrRenderAttrs } from 'vue/server-renderer';
import { u as useToast } from './useToast-BbS4urR_.mjs';
import { _ as _export_sfc, b as useRoute } from './server.mjs';
import { u as useAuthStore } from './auth-CNfKvejC.mjs';
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
import './useSupabaseClient-DxYTVa8G.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Toast",
  __ssrInlineRender: true,
  setup(__props) {
    const { toasts } = useToast();
    const typeConfig = {
      info: {
        icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        bg: "bg-white/10 border-white/20",
        icon_color: "text-blue-400",
        title: "Info"
      },
      success: {
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        bg: "bg-green-500/10 border-green-500/20",
        icon_color: "text-green-400",
        title: "Success"
      },
      warning: {
        icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        bg: "bg-amber-500/10 border-amber-500/20",
        icon_color: "text-amber-400",
        title: "Warning"
      },
      error: {
        icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
        bg: "bg-red-500/10 border-red-500/20",
        icon_color: "text-red-400",
        title: "Error"
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none" data-v-f432c417><div${ssrRenderAttrs({
          name: "toast",
          class: "flex flex-col gap-2"
        })} data-v-f432c417>`);
        ssrRenderList(unref(toasts), (toast) => {
          _push2(`<div class="${ssrRenderClass([typeConfig[toast.type].bg, "pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl cursor-pointer select-none"])}" data-v-f432c417><svg class="${ssrRenderClass([typeConfig[toast.type].icon_color, "w-5 h-5 mt-0.5 flex-shrink-0"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-f432c417><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", typeConfig[toast.type].icon)} data-v-f432c417></path></svg><div class="flex-1 min-w-0" data-v-f432c417><p class="text-sm font-medium text-white leading-snug" data-v-f432c417>${ssrInterpolate(toast.message)}</p><p class="text-xs text-white/40 mt-0.5" data-v-f432c417>Click to dismiss</p></div></div>`);
        });
        _push2(`</div></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Toast.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-f432c417"]]), { __name: "UiToast" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const authStore = useAuthStore();
    if (!authStore.isInitialized) {
      [__temp, __restore] = withAsyncContext(() => authStore.fetchCurrentUser()), await __temp, __restore();
    }
    const isSidebarOpen = ref(false);
    const showNotifications = ref(false);
    const notifLoading = ref(false);
    const notifications = ref([]);
    const unreadCount = ref(0);
    function closeNotifications() {
      showNotifications.value = false;
    }
    function notifIcon(type) {
      switch (type) {
        case "new_ticket":
          return "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2";
        case "customer_message":
          return "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z";
        case "sla_breach":
          return "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";
        case "ai_suggestion":
          return "M13 10V3L4 14h7v7l9-11h-7z";
        default:
          return "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9";
      }
    }
    function notifColor(type) {
      switch (type) {
        case "new_ticket":
          return "text-blue-400";
        case "customer_message":
          return "text-emerald-400";
        case "sla_breach":
          return "text-red-400";
        case "ai_suggestion":
          return "text-purple-400";
        default:
          return "text-white/40";
      }
    }
    function timeAgo(dateStr) {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 6e4);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    }
    const navigation = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
        // folder icon
        exactMatch: true
        // Only active when exactly /dashboard (Solo activo en exactamente /dashboard)
      },
      {
        name: "Tickets",
        href: "/dashboard/tickets",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      },
      {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      },
      {
        name: "Team",
        href: "/dashboard/team",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      },
      {
        name: "Integrations",
        href: "/dashboard/integrations",
        icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      },
      {
        name: "Settings",
        href: "/dashboard/settings",
        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      }
    ];
    const route = useRoute();
    function isActiveRoute(href, exactMatch = false) {
      if (exactMatch) {
        return route.path === href;
      }
      return route.path.startsWith(href);
    }
    const planColors = {
      FREE: "text-white/50",
      STARTER: "text-blue-400",
      PRO: "text-indigo-400",
      ENTERPRISE: "text-amber-400"
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiToast = __nuxt_component_1;
      _push(`<!--[--><div class="flex h-screen bg-app-gradient overflow-hidden" data-v-755c3970>`);
      if (unref(isSidebarOpen)) {
        _push(`<div class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" data-v-755c3970></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<aside class="${ssrRenderClass([unref(isSidebarOpen) ? "translate-x-0" : "-translate-x-full", "fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"])}" data-v-755c3970><div class="flex flex-col h-full bg-[#0d0b24]/90 backdrop-blur-xl border-r border-white/[0.06]" data-v-755c3970><div class="flex items-center gap-3 p-6 border-b border-white/10" data-v-755c3970><div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow flex-shrink-0" data-v-755c3970><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-755c3970><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" data-v-755c3970></path></svg></div><div class="min-w-0" data-v-755c3970><p class="text-white font-semibold text-sm truncate" data-v-755c3970>${ssrInterpolate(unref(authStore).organization?.name || "Agency")}</p><p class="${ssrRenderClass([planColors[unref(authStore).plan], "text-xs"])}" data-v-755c3970>${ssrInterpolate(unref(authStore).plan)} plan </p></div></div><nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto" data-v-755c3970><!--[-->`);
      ssrRenderList(navigation, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.href,
          to: item.href,
          class: ["flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group", isActiveRoute(item.href, item.exactMatch) ? "bg-indigo-500/20 text-white shadow-glass-sm border border-indigo-500/30" : "text-white/60 hover:bg-white/5 hover:text-white"],
          onClick: ($event) => isSidebarOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg class="${ssrRenderClass([isActiveRoute(item.href, item.exactMatch) ? "text-indigo-400" : "text-white/40 group-hover:text-white/60", "w-5 h-5 flex-shrink-0 transition-colors"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-755c3970${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", item.icon)} data-v-755c3970${_scopeId}></path></svg> ${ssrInterpolate(item.name)}`);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  class: ["w-5 h-5 flex-shrink-0 transition-colors", isActiveRoute(item.href, item.exactMatch) ? "text-indigo-400" : "text-white/40 group-hover:text-white/60"],
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    "stroke-width": "2",
                    d: item.icon
                  }, null, 8, ["d"])
                ], 2)),
                createTextVNode(" " + toDisplayString(item.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><div class="p-4 border-t border-white/10" data-v-755c3970><div class="flex items-center gap-3 px-3 py-2" data-v-755c3970><div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0" data-v-755c3970>${ssrInterpolate(unref(authStore).currentUser?.fullName?.charAt(0)?.toUpperCase() || "?")}</div><div class="min-w-0 flex-1" data-v-755c3970><p class="text-white text-sm font-medium truncate" data-v-755c3970>${ssrInterpolate(unref(authStore).currentUser?.fullName || "User")}</p><p class="text-white/40 text-xs truncate" data-v-755c3970>${ssrInterpolate(unref(authStore).currentUser?.role?.toLowerCase())}</p></div><button class="text-white/30 hover:text-red-400 transition-colors" title="Sign out" data-v-755c3970><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-755c3970><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" data-v-755c3970></path></svg></button></div></div></div></aside><div class="flex-1 flex flex-col min-w-0 overflow-hidden" data-v-755c3970><header class="relative z-40 flex items-center gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-sm" data-v-755c3970><button class="lg:hidden text-white/60 hover:text-white transition-colors" data-v-755c3970><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-755c3970><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" data-v-755c3970></path></svg></button><h1 class="text-white font-semibold text-lg flex-1" data-v-755c3970>${ssrInterpolate(navigation.find((n) => isActiveRoute(n.href, n.exactMatch))?.name || "Dashboard")}</h1><div class="flex items-center gap-3" data-v-755c3970>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/dashboard/tickets/new",
        class: "hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-755c3970${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" data-v-755c3970${_scopeId}></path></svg> New Ticket `);
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
      _push(`<div class="relative" data-v-755c3970><button class="relative text-white/50 hover:text-white transition-colors" data-v-755c3970><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-755c3970><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" data-v-755c3970></path></svg>`);
      if (unref(unreadCount) > 0) {
        _push(`<span class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center" data-v-755c3970>${ssrInterpolate(unref(unreadCount) > 99 ? "99+" : unref(unreadCount))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
      if (unref(showNotifications)) {
        _push(`<div class="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[28rem] bg-[#12101f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50" data-v-755c3970><div class="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]" data-v-755c3970><h3 class="text-white font-semibold text-sm" data-v-755c3970>Notifications</h3><button class="text-white/30 hover:text-white/60 transition-colors" data-v-755c3970><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-755c3970><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-755c3970></path></svg></button></div>`);
        if (unref(notifLoading)) {
          _push(`<div class="flex items-center justify-center py-8" data-v-755c3970><div class="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" data-v-755c3970></div></div>`);
        } else if (unref(notifications).length) {
          _push(`<div class="overflow-y-auto max-h-[22rem] divide-y divide-white/[0.04]" data-v-755c3970><!--[-->`);
          ssrRenderList(unref(notifications), (n) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: n.id,
              to: n.ticketId ? `/dashboard/tickets/${n.ticketId}` : "/dashboard",
              class: "flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors block",
              onClick: closeNotifications
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="mt-0.5 flex-shrink-0" data-v-755c3970${_scopeId}><svg class="${ssrRenderClass(["w-4 h-4", notifColor(n.type)])}" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-755c3970${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", notifIcon(n.type))} data-v-755c3970${_scopeId}></path></svg></div><div class="flex-1 min-w-0" data-v-755c3970${_scopeId}><div class="flex items-center gap-2" data-v-755c3970${_scopeId}><span class="text-white/80 text-sm font-medium" data-v-755c3970${_scopeId}>${ssrInterpolate(n.title)}</span>`);
                  if (n.priority === "URGENT") {
                    _push2(`<span class="px-1.5 py-0.5 bg-red-500/20 text-red-300 text-[9px] rounded-full uppercase font-bold" data-v-755c3970${_scopeId}> Urgent </span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><p class="text-white/40 text-xs mt-0.5 truncate" data-v-755c3970${_scopeId}>${ssrInterpolate(n.description)}</p><p class="text-white/20 text-[10px] mt-1" data-v-755c3970${_scopeId}>${ssrInterpolate(timeAgo(n.createdAt))}</p></div>`);
                } else {
                  return [
                    createVNode("div", { class: "mt-0.5 flex-shrink-0" }, [
                      (openBlock(), createBlock("svg", {
                        class: ["w-4 h-4", notifColor(n.type)],
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: notifIcon(n.type)
                        }, null, 8, ["d"])
                      ], 2))
                    ]),
                    createVNode("div", { class: "flex-1 min-w-0" }, [
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        createVNode("span", { class: "text-white/80 text-sm font-medium" }, toDisplayString(n.title), 1),
                        n.priority === "URGENT" ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "px-1.5 py-0.5 bg-red-500/20 text-red-300 text-[9px] rounded-full uppercase font-bold"
                        }, " Urgent ")) : createCommentVNode("", true)
                      ]),
                      createVNode("p", { class: "text-white/40 text-xs mt-0.5 truncate" }, toDisplayString(n.description), 1),
                      createVNode("p", { class: "text-white/20 text-[10px] mt-1" }, toDisplayString(timeAgo(n.createdAt)), 1)
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="py-8 text-center" data-v-755c3970><svg class="w-8 h-8 mx-auto text-white/10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-755c3970><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" data-v-755c3970></path></svg><p class="text-white/30 text-sm" data-v-755c3970>No notifications yet</p><p class="text-white/20 text-xs mt-1" data-v-755c3970>Create tickets to see activity here</p></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showNotifications)) {
        _push(`<div class="fixed inset-0 z-30" data-v-755c3970></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></header><main class="flex-1 overflow-y-auto p-6" data-v-755c3970>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
      _push(ssrRenderComponent(_component_UiToast, null, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const dashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-755c3970"]]);

export { dashboard as default };
//# sourceMappingURL=dashboard-BIT_AJcn.mjs.map
