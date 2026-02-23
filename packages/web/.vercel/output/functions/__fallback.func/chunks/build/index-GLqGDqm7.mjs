import { _ as __nuxt_component_0 } from './nuxt-link-CyRG7-rc.mjs';
import { _ as __nuxt_component_1 } from './GlassCard-C-gZz82T.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, toDisplayString, createTextVNode, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderStyle, ssrRenderComponent, ssrRenderAttr } from 'vue/server-renderer';
import { u as useAuthStore } from './auth-CNfKvejC.mjs';
import { u as useFetch } from './fetch-DpJJTBVE.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import './server.mjs';
import 'pinia';
import 'vue-router';
import './useSupabaseClient-DxYTVa8G.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const authStore = useAuthStore();
    const { data: stats, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/dashboard/stats",
      {
        key: "dashboard-stats"
      },
      "$530-I7_Fik"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const greeting = computed(() => {
      const h = (/* @__PURE__ */ new Date()).getHours();
      if (h < 12) return "Good morning";
      if (h < 17) return "Good afternoon";
      return "Good evening";
    });
    const kpis = computed(() => {
      const s = stats.value?.data;
      return [
        {
          label: "Open Tickets",
          value: s?.openTickets ?? "—",
          icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
          color: "bg-blue-500/[0.08] border-blue-500/20 hover:border-blue-400/40",
          iconColor: "text-blue-400",
          link: "/dashboard/tickets?status=OPEN"
        },
        {
          label: "Resolved Today",
          value: s?.resolvedToday ?? "—",
          icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
          color: "bg-emerald-500/[0.08] border-emerald-500/20 hover:border-emerald-400/40",
          iconColor: "text-emerald-400",
          link: "/dashboard/tickets?status=RESOLVED"
        },
        {
          label: "SLA Breaching",
          value: s?.slaBreaching ?? "—",
          icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
          color: (s?.slaBreaching ?? 0) > 0 ? "bg-red-500/[0.1] border-red-500/30 hover:border-red-400/50" : "bg-white/[0.03] border-white/[0.06] hover:border-white/10",
          iconColor: (s?.slaBreaching ?? 0) > 0 ? "text-red-400" : "text-white/40",
          link: "/dashboard/tickets"
        },
        {
          label: "AI Suggestions",
          value: s?.aiSuggestionsGenerated ?? "—",
          icon: "M13 10V3L4 14h7v7l9-11h-7z",
          color: "bg-purple-500/[0.08] border-purple-500/20 hover:border-purple-400/40",
          iconColor: "text-purple-400",
          link: "/dashboard/analytics"
        }
      ];
    });
    const sentimentTotal = computed(() => {
      const s = stats.value?.data?.sentiment;
      return s ? s.positive + s.neutral + s.negative || 1 : 1;
    });
    const statusConfig = {
      OPEN: { label: "Open", class: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
      IN_PROGRESS: { label: "In Progress", class: "bg-amber-500/20 text-amber-300 border border-amber-500/30" },
      RESOLVED: { label: "Resolved", class: "bg-green-500/20 text-green-300 border border-green-500/30" },
      CLOSED: { label: "Closed", class: "bg-white/10 text-white/50 border border-white/10" }
    };
    const priorityConfig = {
      URGENT: { label: "Urgent", dot: "bg-red-500" },
      HIGH: { label: "High", dot: "bg-orange-400" },
      MEDIUM: { label: "Medium", dot: "bg-amber-400" },
      LOW: { label: "Low", dot: "bg-green-400" }
    };
    function timeAgo(date) {
      const d = typeof date === "string" ? new Date(date) : date;
      const diff = Date.now() - d.getTime();
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 1) return "just now";
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiGlassCard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 animate-fade-in" }, _attrs))}><div class="flex items-start justify-between"><div><h2 class="text-2xl font-bold text-white">${ssrInterpolate(unref(greeting))}, ${ssrInterpolate(unref(authStore).currentUser?.fullName?.split(" ")[0] || "there")} 👋 </h2><p class="text-white/50 mt-1 text-sm">Here&#39;s what&#39;s happening with your tickets today.</p></div><button class="flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all text-sm"><svg class="${ssrRenderClass([{ "animate-spin": unref(pending) }, "w-4 h-4"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Refresh </button></div>`);
      if (unref(error)) {
        _push(`<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm"> Could not load dashboard data. Check your connection and try refreshing. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">`);
      if (unref(pending)) {
        _push(`<!--[-->`);
        ssrRenderList(4, (i) => {
          _push(`<div class="h-28 rounded-2xl bg-white/5 animate-pulse" style="${ssrRenderStyle({ animationDelay: `${i * 80}ms` })}"></div>`);
        });
        _push(`<!--]-->`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(unref(kpis), (kpi) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: kpi.label,
            to: kpi.link,
            class: ["relative overflow-hidden p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-glow", kpi.color]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-start justify-between mb-4"${_scopeId}><svg class="${ssrRenderClass([kpi.iconColor, "w-6 h-6"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", kpi.icon)}${_scopeId}></path></svg></div><p class="text-3xl font-bold text-white mb-1 tabular-nums"${_scopeId}>${ssrInterpolate(kpi.value)}</p><p class="text-sm text-white/60"${_scopeId}>${ssrInterpolate(kpi.label)}</p>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-start justify-between mb-4" }, [
                    (openBlock(), createBlock("svg", {
                      class: ["w-6 h-6", kpi.iconColor],
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: kpi.icon
                      }, null, 8, ["d"])
                    ], 2))
                  ]),
                  createVNode("p", { class: "text-3xl font-bold text-white mb-1 tabular-nums" }, toDisplayString(kpi.value), 1),
                  createVNode("p", { class: "text-sm text-white/60" }, toDisplayString(kpi.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]-->`);
      }
      _push(`</div><div class="grid grid-cols-1 xl:grid-cols-3 gap-6">`);
      _push(ssrRenderComponent(_component_UiGlassCard, {
        padding: "none",
        class: "xl:col-span-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center justify-between px-5 py-4 border-b border-white/10"${_scopeId}><h3 class="text-white font-semibold text-sm"${_scopeId}>Recent Tickets</h3>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/dashboard/tickets",
              class: "text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` View all → `);
                } else {
                  return [
                    createTextVNode(" View all → ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (unref(pending)) {
              _push2(`<div class="p-4 space-y-3"${_scopeId}><!--[-->`);
              ssrRenderList(5, (i) => {
                _push2(`<div class="h-12 rounded-lg bg-white/5 animate-pulse" style="${ssrRenderStyle({ animationDelay: `${i * 60}ms` })}"${_scopeId}></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<!--[-->`);
              if (!unref(stats)?.data?.recentTickets?.length) {
                _push2(`<div class="py-12 text-center text-white/30 text-sm"${_scopeId}> No tickets yet — they&#39;ll appear here once created. </div>`);
              } else {
                _push2(`<div class="divide-y divide-white/5"${_scopeId}><!--[-->`);
                ssrRenderList(unref(stats)?.data?.recentTickets, (ticket) => {
                  _push2(ssrRenderComponent(_component_NuxtLink, {
                    key: ticket.id,
                    to: `/dashboard/tickets/${ticket.id}`,
                    class: "flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors group"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`<div class="${ssrRenderClass([priorityConfig[ticket.priority]?.dot ?? "bg-white/20", "w-2 h-2 rounded-full flex-shrink-0"])}"${_scopeId2}></div><div class="flex-1 min-w-0"${_scopeId2}><p class="text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors"${_scopeId2}>${ssrInterpolate(ticket.subject)}</p>`);
                        if (ticket.category) {
                          _push3(`<p class="text-white/40 text-xs"${_scopeId2}>${ssrInterpolate(ticket.category)}</p>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</div><span class="${ssrRenderClass([statusConfig[ticket.status]?.class, "flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"])}"${_scopeId2}>${ssrInterpolate(statusConfig[ticket.status]?.label)}</span>`);
                        if (ticket.isBreachingSla) {
                          _push3(`<span class="flex-shrink-0 text-red-400" title="SLA Breaching"${_scopeId2}><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"${_scopeId2}></path></svg></span>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`<span class="flex-shrink-0 text-white/30 text-xs"${_scopeId2}>${ssrInterpolate(timeAgo(ticket.createdAt))}</span>`);
                      } else {
                        return [
                          createVNode("div", {
                            class: ["w-2 h-2 rounded-full flex-shrink-0", priorityConfig[ticket.priority]?.dot ?? "bg-white/20"]
                          }, null, 2),
                          createVNode("div", { class: "flex-1 min-w-0" }, [
                            createVNode("p", { class: "text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors" }, toDisplayString(ticket.subject), 1),
                            ticket.category ? (openBlock(), createBlock("p", {
                              key: 0,
                              class: "text-white/40 text-xs"
                            }, toDisplayString(ticket.category), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("span", {
                            class: ["flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[ticket.status]?.class]
                          }, toDisplayString(statusConfig[ticket.status]?.label), 3),
                          ticket.isBreachingSla ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "flex-shrink-0 text-red-400",
                            title: "SLA Breaching"
                          }, [
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
                                d: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              })
                            ]))
                          ])) : createCommentVNode("", true),
                          createVNode("span", { class: "flex-shrink-0 text-white/30 text-xs" }, toDisplayString(timeAgo(ticket.createdAt)), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                });
                _push2(`<!--]--></div>`);
              }
              _push2(`<!--]-->`);
            }
          } else {
            return [
              createVNode("div", { class: "flex items-center justify-between px-5 py-4 border-b border-white/10" }, [
                createVNode("h3", { class: "text-white font-semibold text-sm" }, "Recent Tickets"),
                createVNode(_component_NuxtLink, {
                  to: "/dashboard/tickets",
                  class: "text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" View all → ")
                  ]),
                  _: 1
                })
              ]),
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "p-4 space-y-3"
              }, [
                (openBlock(), createBlock(Fragment, null, renderList(5, (i) => {
                  return createVNode("div", {
                    key: i,
                    class: "h-12 rounded-lg bg-white/5 animate-pulse",
                    style: { animationDelay: `${i * 60}ms` }
                  }, null, 4);
                }), 64))
              ])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                !unref(stats)?.data?.recentTickets?.length ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "py-12 text-center text-white/30 text-sm"
                }, " No tickets yet — they'll appear here once created. ")) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "divide-y divide-white/5"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(stats)?.data?.recentTickets, (ticket) => {
                    return openBlock(), createBlock(_component_NuxtLink, {
                      key: ticket.id,
                      to: `/dashboard/tickets/${ticket.id}`,
                      class: "flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors group"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", {
                          class: ["w-2 h-2 rounded-full flex-shrink-0", priorityConfig[ticket.priority]?.dot ?? "bg-white/20"]
                        }, null, 2),
                        createVNode("div", { class: "flex-1 min-w-0" }, [
                          createVNode("p", { class: "text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors" }, toDisplayString(ticket.subject), 1),
                          ticket.category ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "text-white/40 text-xs"
                          }, toDisplayString(ticket.category), 1)) : createCommentVNode("", true)
                        ]),
                        createVNode("span", {
                          class: ["flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[ticket.status]?.class]
                        }, toDisplayString(statusConfig[ticket.status]?.label), 3),
                        ticket.isBreachingSla ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "flex-shrink-0 text-red-400",
                          title: "SLA Breaching"
                        }, [
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
                              d: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            })
                          ]))
                        ])) : createCommentVNode("", true),
                        createVNode("span", { class: "flex-shrink-0 text-white/30 text-xs" }, toDisplayString(timeAgo(ticket.createdAt)), 1)
                      ]),
                      _: 2
                    }, 1032, ["to"]);
                  }), 128))
                ]))
              ], 64))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="space-y-4">`);
      _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 class="text-white font-semibold text-sm mb-4"${_scopeId}>Sentiment Overview</h3>`);
            if (unref(pending)) {
              _push2(`<div class="space-y-3"${_scopeId}><!--[-->`);
              ssrRenderList(3, (i) => {
                _push2(`<div class="h-8 rounded bg-white/5 animate-pulse"${_scopeId}></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<div class="space-y-3"${_scopeId}><div${_scopeId}><div class="flex justify-between text-xs mb-1"${_scopeId}><span class="text-green-400"${_scopeId}>😊 Positive</span><span class="text-white/50 tabular-nums"${_scopeId}>${ssrInterpolate(unref(stats)?.data?.sentiment?.positive ?? 0)}</span></div><div class="h-1.5 rounded-full bg-white/10 overflow-hidden"${_scopeId}><div class="h-full rounded-full bg-green-500 transition-all duration-700" style="${ssrRenderStyle({ width: `${(unref(stats)?.data?.sentiment?.positive ?? 0) / unref(sentimentTotal) * 100}%` })}"${_scopeId}></div></div></div><div${_scopeId}><div class="flex justify-between text-xs mb-1"${_scopeId}><span class="text-white/60"${_scopeId}>😐 Neutral</span><span class="text-white/50 tabular-nums"${_scopeId}>${ssrInterpolate(unref(stats)?.data?.sentiment?.neutral ?? 0)}</span></div><div class="h-1.5 rounded-full bg-white/10 overflow-hidden"${_scopeId}><div class="h-full rounded-full bg-white/40 transition-all duration-700" style="${ssrRenderStyle({ width: `${(unref(stats)?.data?.sentiment?.neutral ?? 0) / unref(sentimentTotal) * 100}%` })}"${_scopeId}></div></div></div><div${_scopeId}><div class="flex justify-between text-xs mb-1"${_scopeId}><span class="text-red-400"${_scopeId}>😡 Negative</span><span class="text-white/50 tabular-nums"${_scopeId}>${ssrInterpolate(unref(stats)?.data?.sentiment?.negative ?? 0)}</span></div><div class="h-1.5 rounded-full bg-white/10 overflow-hidden"${_scopeId}><div class="h-full rounded-full bg-red-500 transition-all duration-700" style="${ssrRenderStyle({ width: `${(unref(stats)?.data?.sentiment?.negative ?? 0) / unref(sentimentTotal) * 100}%` })}"${_scopeId}></div></div></div></div>`);
            }
          } else {
            return [
              createVNode("h3", { class: "text-white font-semibold text-sm mb-4" }, "Sentiment Overview"),
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "space-y-3"
              }, [
                (openBlock(), createBlock(Fragment, null, renderList(3, (i) => {
                  return createVNode("div", {
                    key: i,
                    class: "h-8 rounded bg-white/5 animate-pulse"
                  });
                }), 64))
              ])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "space-y-3"
              }, [
                createVNode("div", null, [
                  createVNode("div", { class: "flex justify-between text-xs mb-1" }, [
                    createVNode("span", { class: "text-green-400" }, "😊 Positive"),
                    createVNode("span", { class: "text-white/50 tabular-nums" }, toDisplayString(unref(stats)?.data?.sentiment?.positive ?? 0), 1)
                  ]),
                  createVNode("div", { class: "h-1.5 rounded-full bg-white/10 overflow-hidden" }, [
                    createVNode("div", {
                      class: "h-full rounded-full bg-green-500 transition-all duration-700",
                      style: { width: `${(unref(stats)?.data?.sentiment?.positive ?? 0) / unref(sentimentTotal) * 100}%` }
                    }, null, 4)
                  ])
                ]),
                createVNode("div", null, [
                  createVNode("div", { class: "flex justify-between text-xs mb-1" }, [
                    createVNode("span", { class: "text-white/60" }, "😐 Neutral"),
                    createVNode("span", { class: "text-white/50 tabular-nums" }, toDisplayString(unref(stats)?.data?.sentiment?.neutral ?? 0), 1)
                  ]),
                  createVNode("div", { class: "h-1.5 rounded-full bg-white/10 overflow-hidden" }, [
                    createVNode("div", {
                      class: "h-full rounded-full bg-white/40 transition-all duration-700",
                      style: { width: `${(unref(stats)?.data?.sentiment?.neutral ?? 0) / unref(sentimentTotal) * 100}%` }
                    }, null, 4)
                  ])
                ]),
                createVNode("div", null, [
                  createVNode("div", { class: "flex justify-between text-xs mb-1" }, [
                    createVNode("span", { class: "text-red-400" }, "😡 Negative"),
                    createVNode("span", { class: "text-white/50 tabular-nums" }, toDisplayString(unref(stats)?.data?.sentiment?.negative ?? 0), 1)
                  ]),
                  createVNode("div", { class: "h-1.5 rounded-full bg-white/10 overflow-hidden" }, [
                    createVNode("div", {
                      class: "h-full rounded-full bg-red-500 transition-all duration-700",
                      style: { width: `${(unref(stats)?.data?.sentiment?.negative ?? 0) / unref(sentimentTotal) * 100}%` }
                    }, null, 4)
                  ])
                ])
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 class="text-white font-semibold text-sm mb-4"${_scopeId}>Tickets by Priority</h3>`);
            if (unref(pending)) {
              _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
              ssrRenderList(4, (i) => {
                _push2(`<div class="h-7 rounded bg-white/5 animate-pulse"${_scopeId}></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
              ssrRenderList(priorityConfig, (config, key) => {
                _push2(`<div class="flex items-center justify-between py-1"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><div class="${ssrRenderClass([config.dot, "w-2 h-2 rounded-full"])}"${_scopeId}></div><span class="text-white/60 text-sm"${_scopeId}>${ssrInterpolate(config.label)}</span></div><span class="text-white font-semibold tabular-nums text-sm"${_scopeId}>${ssrInterpolate(unref(stats)?.data?.priority?.[key.toLowerCase()] ?? 0)}</span></div>`);
              });
              _push2(`<!--]--></div>`);
            }
          } else {
            return [
              createVNode("h3", { class: "text-white font-semibold text-sm mb-4" }, "Tickets by Priority"),
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "space-y-2"
              }, [
                (openBlock(), createBlock(Fragment, null, renderList(4, (i) => {
                  return createVNode("div", {
                    key: i,
                    class: "h-7 rounded bg-white/5 animate-pulse"
                  });
                }), 64))
              ])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "space-y-2"
              }, [
                (openBlock(), createBlock(Fragment, null, renderList(priorityConfig, (config, key) => {
                  return createVNode("div", {
                    key,
                    class: "flex items-center justify-between py-1"
                  }, [
                    createVNode("div", { class: "flex items-center gap-2" }, [
                      createVNode("div", {
                        class: ["w-2 h-2 rounded-full", config.dot]
                      }, null, 2),
                      createVNode("span", { class: "text-white/60 text-sm" }, toDisplayString(config.label), 1)
                    ]),
                    createVNode("span", { class: "text-white font-semibold tabular-nums text-sm" }, toDisplayString(unref(stats)?.data?.priority?.[key.toLowerCase()] ?? 0), 1)
                  ]);
                }), 64))
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-GLqGDqm7.mjs.map
