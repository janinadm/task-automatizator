import { _ as __nuxt_component_1 } from './GlassCard-C-gZz82T.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createTextVNode, Fragment, renderList, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
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
import '@vue/shared';
import './server.mjs';
import 'pinia';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "analytics",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: analytics, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/analytics",
      {
        key: "analytics-data"
      },
      "$fQIe7nZWbn"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a;
      return (_a = analytics.value) == null ? void 0 : _a.data;
    });
    const overviewCards = computed(() => {
      var _a;
      const o = (_a = stats.value) == null ? void 0 : _a.overview;
      if (!o) return [];
      return [
        {
          label: "Total Tickets",
          value: o.totalTickets,
          icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
          color: "text-blue-400",
          bg: "bg-blue-500/10"
        },
        {
          label: "Resolution Rate",
          value: `${o.resolutionRate}%`,
          icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
          color: "text-emerald-400",
          bg: "bg-emerald-500/10"
        },
        {
          label: "Avg. Resolution",
          value: o.avgResolutionHours > 0 ? `${o.avgResolutionHours}h` : "\u2014",
          icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
          color: "text-amber-400",
          bg: "bg-amber-500/10"
        },
        {
          label: "This Week",
          value: o.ticketsThisWeek,
          icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
          color: "text-purple-400",
          bg: "bg-purple-500/10"
        }
      ];
    });
    const maxVolume = computed(() => {
      var _a;
      if (!((_a = stats.value) == null ? void 0 : _a.dailyVolume)) return 1;
      return Math.max(1, ...stats.value.dailyVolume.map((d) => d.count));
    });
    const channelConfig = {
      WEB: { label: "Web", color: "bg-blue-400" },
      EMAIL: { label: "Email", color: "bg-indigo-400" },
      WHATSAPP: { label: "WhatsApp", color: "bg-green-400" },
      SLACK: { label: "Slack", color: "bg-purple-400" }
    };
    const statusConfig = {
      OPEN: { label: "Open", color: "bg-blue-400" },
      IN_PROGRESS: { label: "In Progress", color: "bg-amber-400" },
      RESOLVED: { label: "Resolved", color: "bg-emerald-400" },
      CLOSED: { label: "Closed", color: "bg-white/40" }
    };
    const priorityConfig = {
      URGENT: { label: "Urgent", color: "bg-red-400" },
      HIGH: { label: "High", color: "bg-orange-400" },
      MEDIUM: { label: "Medium", color: "bg-amber-400" },
      LOW: { label: "Low", color: "bg-emerald-400" }
    };
    function totalOf(obj) {
      if (!obj) return 1;
      return Math.max(1, Object.values(obj).reduce((a, b) => a + b, 0));
    }
    function fmtDate(d) {
      const dt = new Date(d);
      return dt.toLocaleDateString("en", { month: "short", day: "numeric" });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiGlassCard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in space-y-6" }, _attrs))}><div class="flex items-center justify-between"><div><h2 class="text-xl font-bold text-white">Analytics</h2><p class="text-white/40 text-sm mt-1">Performance metrics and ticket insights</p></div><button class="btn-ghost text-sm flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Refresh </button></div>`);
      if (unref(pending)) {
        _push(`<div class="flex items-center justify-center py-24"><div class="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div></div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-8 text-center"><p class="text-red-300">Failed to load analytics data.</p><button class="btn-primary mt-4 text-sm">Retry</button></div>`);
      } else if (unref(stats)) {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><!--[-->`);
        ssrRenderList(unref(overviewCards), (card) => {
          _push(ssrRenderComponent(_component_UiGlassCard, {
            key: card.label,
            padding: "md",
            hover: true
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-start justify-between"${_scopeId}><div${_scopeId}><p class="text-white/50 text-xs uppercase tracking-wider mb-1"${_scopeId}>${ssrInterpolate(card.label)}</p><p class="text-2xl font-bold text-white"${_scopeId}>${ssrInterpolate(card.value)}</p></div><div class="${ssrRenderClass([card.bg, "p-2 rounded-xl"])}"${_scopeId}><svg class="${ssrRenderClass(["w-5 h-5", card.color])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", card.icon)}${_scopeId}></path></svg></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-start justify-between" }, [
                    createVNode("div", null, [
                      createVNode("p", { class: "text-white/50 text-xs uppercase tracking-wider mb-1" }, toDisplayString(card.label), 1),
                      createVNode("p", { class: "text-2xl font-bold text-white" }, toDisplayString(card.value), 1)
                    ]),
                    createVNode("div", {
                      class: [card.bg, "p-2 rounded-xl"]
                    }, [
                      (openBlock(), createBlock("svg", {
                        class: ["w-5 h-5", card.color],
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: card.icon
                        }, null, 8, ["d"])
                      ], 2))
                    ], 2)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"${_scopeId}></path></svg> Ticket Volume \u2014 Last 30 Days </h3>`);
              if (unref(stats).dailyVolume.length) {
                _push2(`<div class="flex items-end gap-[2px] h-32"${_scopeId}><!--[-->`);
                ssrRenderList(unref(stats).dailyVolume, (day) => {
                  _push2(`<div class="flex-1 group relative"${_scopeId}><div class="bg-indigo-500/60 hover:bg-indigo-400/80 rounded-t-sm transition-all duration-200 w-full" style="${ssrRenderStyle({ height: `${Math.max(2, day.count / unref(maxVolume) * 100)}%` })}"${_scopeId}></div><div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10"${_scopeId}><div class="bg-[#1a1a2e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap shadow-lg"${_scopeId}>${ssrInterpolate(fmtDate(day.date))}: ${ssrInterpolate(day.count)} ticket${ssrInterpolate(day.count !== 1 ? "s" : "")}</div></div></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-white/30 text-sm text-center py-8"${_scopeId}>No ticket data available</p>`);
              }
              if (unref(stats).dailyVolume.length) {
                _push2(`<div class="flex justify-between mt-2 text-white/30 text-[10px]"${_scopeId}><!--[-->`);
                ssrRenderList(unref(stats).dailyVolume.filter((_2, idx) => idx % 7 === 0), (day, i) => {
                  _push2(`<span${_scopeId}>${ssrInterpolate(fmtDate(day.date))}</span>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("h3", { class: "text-white font-semibold text-sm mb-4 flex items-center gap-2" }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-4 h-4 text-indigo-400",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    })
                  ])),
                  createTextVNode(" Ticket Volume \u2014 Last 30 Days ")
                ]),
                unref(stats).dailyVolume.length ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "flex items-end gap-[2px] h-32"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(stats).dailyVolume, (day) => {
                    return openBlock(), createBlock("div", {
                      key: day.date,
                      class: "flex-1 group relative"
                    }, [
                      createVNode("div", {
                        class: "bg-indigo-500/60 hover:bg-indigo-400/80 rounded-t-sm transition-all duration-200 w-full",
                        style: { height: `${Math.max(2, day.count / unref(maxVolume) * 100)}%` }
                      }, null, 4),
                      createVNode("div", { class: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10" }, [
                        createVNode("div", { class: "bg-[#1a1a2e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap shadow-lg" }, toDisplayString(fmtDate(day.date)) + ": " + toDisplayString(day.count) + " ticket" + toDisplayString(day.count !== 1 ? "s" : ""), 1)
                      ])
                    ]);
                  }), 128))
                ])) : (openBlock(), createBlock("p", {
                  key: 1,
                  class: "text-white/30 text-sm text-center py-8"
                }, "No ticket data available")),
                unref(stats).dailyVolume.length ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "flex justify-between mt-2 text-white/30 text-[10px]"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(stats).dailyVolume.filter((_2, idx) => idx % 7 === 0), (day, i) => {
                    return openBlock(), createBlock("span", {
                      key: day.date
                    }, toDisplayString(fmtDate(day.date)), 1);
                  }), 128))
                ])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid grid-cols-1 md:grid-cols-3 gap-4">`);
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white font-semibold text-sm mb-4"${_scopeId}>By Channel</h3><div class="space-y-3"${_scopeId}><!--[-->`);
              ssrRenderList(channelConfig, (cfg, key) => {
                var _a, _b;
                _push2(`<div${_scopeId}><div class="flex items-center justify-between text-xs mb-1"${_scopeId}><span class="text-white/70"${_scopeId}>${ssrInterpolate(cfg.label)}</span><span class="text-white/40"${_scopeId}>${ssrInterpolate((_a = unref(stats).channels[key]) != null ? _a : 0)}</span></div><div class="h-2 bg-white/[0.06] rounded-full overflow-hidden"${_scopeId}><div class="${ssrRenderClass([cfg.color, "h-full rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: `${((_b = unref(stats).channels[key]) != null ? _b : 0) / totalOf(unref(stats).channels) * 100}%` })}"${_scopeId}></div></div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("h3", { class: "text-white font-semibold text-sm mb-4" }, "By Channel"),
                createVNode("div", { class: "space-y-3" }, [
                  (openBlock(), createBlock(Fragment, null, renderList(channelConfig, (cfg, key) => {
                    var _a, _b;
                    return createVNode("div", { key }, [
                      createVNode("div", { class: "flex items-center justify-between text-xs mb-1" }, [
                        createVNode("span", { class: "text-white/70" }, toDisplayString(cfg.label), 1),
                        createVNode("span", { class: "text-white/40" }, toDisplayString((_a = unref(stats).channels[key]) != null ? _a : 0), 1)
                      ]),
                      createVNode("div", { class: "h-2 bg-white/[0.06] rounded-full overflow-hidden" }, [
                        createVNode("div", {
                          class: [cfg.color, "h-full rounded-full transition-all duration-500"],
                          style: { width: `${((_b = unref(stats).channels[key]) != null ? _b : 0) / totalOf(unref(stats).channels) * 100}%` }
                        }, null, 6)
                      ])
                    ]);
                  }), 64))
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white font-semibold text-sm mb-4"${_scopeId}>By Status</h3><div class="space-y-3"${_scopeId}><!--[-->`);
              ssrRenderList(statusConfig, (cfg, key) => {
                var _a, _b;
                _push2(`<div${_scopeId}><div class="flex items-center justify-between text-xs mb-1"${_scopeId}><span class="text-white/70"${_scopeId}>${ssrInterpolate(cfg.label)}</span><span class="text-white/40"${_scopeId}>${ssrInterpolate((_a = unref(stats).statuses[key]) != null ? _a : 0)}</span></div><div class="h-2 bg-white/[0.06] rounded-full overflow-hidden"${_scopeId}><div class="${ssrRenderClass([cfg.color, "h-full rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: `${((_b = unref(stats).statuses[key]) != null ? _b : 0) / totalOf(unref(stats).statuses) * 100}%` })}"${_scopeId}></div></div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("h3", { class: "text-white font-semibold text-sm mb-4" }, "By Status"),
                createVNode("div", { class: "space-y-3" }, [
                  (openBlock(), createBlock(Fragment, null, renderList(statusConfig, (cfg, key) => {
                    var _a, _b;
                    return createVNode("div", { key }, [
                      createVNode("div", { class: "flex items-center justify-between text-xs mb-1" }, [
                        createVNode("span", { class: "text-white/70" }, toDisplayString(cfg.label), 1),
                        createVNode("span", { class: "text-white/40" }, toDisplayString((_a = unref(stats).statuses[key]) != null ? _a : 0), 1)
                      ]),
                      createVNode("div", { class: "h-2 bg-white/[0.06] rounded-full overflow-hidden" }, [
                        createVNode("div", {
                          class: [cfg.color, "h-full rounded-full transition-all duration-500"],
                          style: { width: `${((_b = unref(stats).statuses[key]) != null ? _b : 0) / totalOf(unref(stats).statuses) * 100}%` }
                        }, null, 6)
                      ])
                    ]);
                  }), 64))
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white font-semibold text-sm mb-4"${_scopeId}>By Priority</h3><div class="space-y-3"${_scopeId}><!--[-->`);
              ssrRenderList(priorityConfig, (cfg, key) => {
                var _a, _b;
                _push2(`<div${_scopeId}><div class="flex items-center justify-between text-xs mb-1"${_scopeId}><span class="text-white/70"${_scopeId}>${ssrInterpolate(cfg.label)}</span><span class="text-white/40"${_scopeId}>${ssrInterpolate((_a = unref(stats).priorities[key]) != null ? _a : 0)}</span></div><div class="h-2 bg-white/[0.06] rounded-full overflow-hidden"${_scopeId}><div class="${ssrRenderClass([cfg.color, "h-full rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: `${((_b = unref(stats).priorities[key]) != null ? _b : 0) / totalOf(unref(stats).priorities) * 100}%` })}"${_scopeId}></div></div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("h3", { class: "text-white font-semibold text-sm mb-4" }, "By Priority"),
                createVNode("div", { class: "space-y-3" }, [
                  (openBlock(), createBlock(Fragment, null, renderList(priorityConfig, (cfg, key) => {
                    var _a, _b;
                    return createVNode("div", { key }, [
                      createVNode("div", { class: "flex items-center justify-between text-xs mb-1" }, [
                        createVNode("span", { class: "text-white/70" }, toDisplayString(cfg.label), 1),
                        createVNode("span", { class: "text-white/40" }, toDisplayString((_a = unref(stats).priorities[key]) != null ? _a : 0), 1)
                      ]),
                      createVNode("div", { class: "h-2 bg-white/[0.06] rounded-full overflow-hidden" }, [
                        createVNode("div", {
                          class: [cfg.color, "h-full rounded-full transition-all duration-500"],
                          style: { width: `${((_b = unref(stats).priorities[key]) != null ? _b : 0) / totalOf(unref(stats).priorities) * 100}%` }
                        }, null, 6)
                      ])
                    ]);
                  }), 64))
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="grid grid-cols-1 md:grid-cols-2 gap-4">`);
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"${_scopeId}></path></svg> Sentiment Analysis </h3><div class="space-y-4"${_scopeId}><div${_scopeId}><div class="flex items-center justify-between text-sm mb-1.5"${_scopeId}><span class="text-emerald-400 flex items-center gap-1.5"${_scopeId}>\u{1F60A} Positive</span><span class="text-white/50"${_scopeId}>${ssrInterpolate(unref(stats).sentiment.positive)}</span></div><div class="h-3 bg-white/[0.06] rounded-full overflow-hidden"${_scopeId}><div class="h-full bg-emerald-500 rounded-full transition-all duration-500" style="${ssrRenderStyle({ width: `${unref(stats).sentiment.positive / Math.max(1, unref(stats).sentiment.positive + unref(stats).sentiment.neutral + unref(stats).sentiment.negative) * 100}%` })}"${_scopeId}></div></div></div><div${_scopeId}><div class="flex items-center justify-between text-sm mb-1.5"${_scopeId}><span class="text-amber-400 flex items-center gap-1.5"${_scopeId}>\u{1F610} Neutral</span><span class="text-white/50"${_scopeId}>${ssrInterpolate(unref(stats).sentiment.neutral)}</span></div><div class="h-3 bg-white/[0.06] rounded-full overflow-hidden"${_scopeId}><div class="h-full bg-amber-500 rounded-full transition-all duration-500" style="${ssrRenderStyle({ width: `${unref(stats).sentiment.neutral / Math.max(1, unref(stats).sentiment.positive + unref(stats).sentiment.neutral + unref(stats).sentiment.negative) * 100}%` })}"${_scopeId}></div></div></div><div${_scopeId}><div class="flex items-center justify-between text-sm mb-1.5"${_scopeId}><span class="text-red-400 flex items-center gap-1.5"${_scopeId}>\u{1F620} Negative</span><span class="text-white/50"${_scopeId}>${ssrInterpolate(unref(stats).sentiment.negative)}</span></div><div class="h-3 bg-white/[0.06] rounded-full overflow-hidden"${_scopeId}><div class="h-full bg-red-500 rounded-full transition-all duration-500" style="${ssrRenderStyle({ width: `${unref(stats).sentiment.negative / Math.max(1, unref(stats).sentiment.positive + unref(stats).sentiment.neutral + unref(stats).sentiment.negative) * 100}%` })}"${_scopeId}></div></div></div></div>`);
            } else {
              return [
                createVNode("h3", { class: "text-white font-semibold text-sm mb-4 flex items-center gap-2" }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-4 h-4 text-indigo-400",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    })
                  ])),
                  createTextVNode(" Sentiment Analysis ")
                ]),
                createVNode("div", { class: "space-y-4" }, [
                  createVNode("div", null, [
                    createVNode("div", { class: "flex items-center justify-between text-sm mb-1.5" }, [
                      createVNode("span", { class: "text-emerald-400 flex items-center gap-1.5" }, "\u{1F60A} Positive"),
                      createVNode("span", { class: "text-white/50" }, toDisplayString(unref(stats).sentiment.positive), 1)
                    ]),
                    createVNode("div", { class: "h-3 bg-white/[0.06] rounded-full overflow-hidden" }, [
                      createVNode("div", {
                        class: "h-full bg-emerald-500 rounded-full transition-all duration-500",
                        style: { width: `${unref(stats).sentiment.positive / Math.max(1, unref(stats).sentiment.positive + unref(stats).sentiment.neutral + unref(stats).sentiment.negative) * 100}%` }
                      }, null, 4)
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode("div", { class: "flex items-center justify-between text-sm mb-1.5" }, [
                      createVNode("span", { class: "text-amber-400 flex items-center gap-1.5" }, "\u{1F610} Neutral"),
                      createVNode("span", { class: "text-white/50" }, toDisplayString(unref(stats).sentiment.neutral), 1)
                    ]),
                    createVNode("div", { class: "h-3 bg-white/[0.06] rounded-full overflow-hidden" }, [
                      createVNode("div", {
                        class: "h-full bg-amber-500 rounded-full transition-all duration-500",
                        style: { width: `${unref(stats).sentiment.neutral / Math.max(1, unref(stats).sentiment.positive + unref(stats).sentiment.neutral + unref(stats).sentiment.negative) * 100}%` }
                      }, null, 4)
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode("div", { class: "flex items-center justify-between text-sm mb-1.5" }, [
                      createVNode("span", { class: "text-red-400 flex items-center gap-1.5" }, "\u{1F620} Negative"),
                      createVNode("span", { class: "text-white/50" }, toDisplayString(unref(stats).sentiment.negative), 1)
                    ]),
                    createVNode("div", { class: "h-3 bg-white/[0.06] rounded-full overflow-hidden" }, [
                      createVNode("div", {
                        class: "h-full bg-red-500 rounded-full transition-all duration-500",
                        style: { width: `${unref(stats).sentiment.negative / Math.max(1, unref(stats).sentiment.positive + unref(stats).sentiment.neutral + unref(stats).sentiment.negative) * 100}%` }
                      }, null, 4)
                    ])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"${_scopeId}></path></svg> Top Categories </h3>`);
              if (unref(stats).categories.length) {
                _push2(`<div class="space-y-3"${_scopeId}><!--[-->`);
                ssrRenderList(unref(stats).categories, (cat) => {
                  var _a, _b;
                  _push2(`<div${_scopeId}><div class="flex items-center justify-between text-xs mb-1"${_scopeId}><span class="text-white/70 capitalize"${_scopeId}>${ssrInterpolate(cat.name.toLowerCase().replace(/_/g, " "))}</span><span class="text-white/40"${_scopeId}>${ssrInterpolate(cat.count)}</span></div><div class="h-2 bg-white/[0.06] rounded-full overflow-hidden"${_scopeId}><div class="h-full bg-indigo-500 rounded-full transition-all duration-500" style="${ssrRenderStyle({ width: `${cat.count / Math.max(1, (_b = (_a = unref(stats).categories[0]) == null ? void 0 : _a.count) != null ? _b : 1) * 100}%` })}"${_scopeId}></div></div></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-white/30 text-sm text-center py-4"${_scopeId}>No categorized tickets yet. AI will auto-categorize new tickets.</p>`);
              }
            } else {
              return [
                createVNode("h3", { class: "text-white font-semibold text-sm mb-4 flex items-center gap-2" }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-4 h-4 text-indigo-400",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    })
                  ])),
                  createTextVNode(" Top Categories ")
                ]),
                unref(stats).categories.length ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "space-y-3"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(stats).categories, (cat) => {
                    var _a, _b;
                    return openBlock(), createBlock("div", {
                      key: cat.name
                    }, [
                      createVNode("div", { class: "flex items-center justify-between text-xs mb-1" }, [
                        createVNode("span", { class: "text-white/70 capitalize" }, toDisplayString(cat.name.toLowerCase().replace(/_/g, " ")), 1),
                        createVNode("span", { class: "text-white/40" }, toDisplayString(cat.count), 1)
                      ]),
                      createVNode("div", { class: "h-2 bg-white/[0.06] rounded-full overflow-hidden" }, [
                        createVNode("div", {
                          class: "h-full bg-indigo-500 rounded-full transition-all duration-500",
                          style: { width: `${cat.count / Math.max(1, (_b = (_a = unref(stats).categories[0]) == null ? void 0 : _a.count) != null ? _b : 1) * 100}%` }
                        }, null, 4)
                      ])
                    ]);
                  }), 128))
                ])) : (openBlock(), createBlock("p", {
                  key: 1,
                  class: "text-white/30 text-sm text-center py-4"
                }, "No categorized tickets yet. AI will auto-categorize new tickets."))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"${_scopeId}></path></svg> Agent Performance \u2014 Resolved Tickets </h3>`);
              if (unref(stats).agentPerformance.length) {
                _push2(`<div class="space-y-3"${_scopeId}><!--[-->`);
                ssrRenderList(unref(stats).agentPerformance, (agent, index) => {
                  var _a, _b;
                  _push2(`<div class="flex items-center gap-3"${_scopeId}><span class="text-white/30 text-xs w-5 text-right"${_scopeId}>#${ssrInterpolate(index + 1)}</span><div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm text-indigo-300 font-semibold flex-shrink-0"${_scopeId}>${ssrInterpolate(agent.name.charAt(0).toUpperCase())}</div><div class="flex-1 min-w-0"${_scopeId}><div class="flex items-center justify-between mb-1"${_scopeId}><span class="text-white/80 text-sm truncate"${_scopeId}>${ssrInterpolate(agent.name)}</span><span class="text-white/40 text-xs"${_scopeId}>${ssrInterpolate(agent.resolved)} resolved</span></div><div class="h-1.5 bg-white/[0.06] rounded-full overflow-hidden"${_scopeId}><div class="h-full bg-indigo-500 rounded-full transition-all duration-500" style="${ssrRenderStyle({ width: `${agent.resolved / Math.max(1, (_b = (_a = unref(stats).agentPerformance[0]) == null ? void 0 : _a.resolved) != null ? _b : 1) * 100}%` })}"${_scopeId}></div></div></div></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-white/30 text-sm text-center py-4"${_scopeId}>No agent performance data yet. Assign and resolve tickets to see stats.</p>`);
              }
            } else {
              return [
                createVNode("h3", { class: "text-white font-semibold text-sm mb-4 flex items-center gap-2" }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-4 h-4 text-indigo-400",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    })
                  ])),
                  createTextVNode(" Agent Performance \u2014 Resolved Tickets ")
                ]),
                unref(stats).agentPerformance.length ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "space-y-3"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(stats).agentPerformance, (agent, index) => {
                    var _a, _b;
                    return openBlock(), createBlock("div", {
                      key: agent.id,
                      class: "flex items-center gap-3"
                    }, [
                      createVNode("span", { class: "text-white/30 text-xs w-5 text-right" }, "#" + toDisplayString(index + 1), 1),
                      createVNode("div", { class: "w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm text-indigo-300 font-semibold flex-shrink-0" }, toDisplayString(agent.name.charAt(0).toUpperCase()), 1),
                      createVNode("div", { class: "flex-1 min-w-0" }, [
                        createVNode("div", { class: "flex items-center justify-between mb-1" }, [
                          createVNode("span", { class: "text-white/80 text-sm truncate" }, toDisplayString(agent.name), 1),
                          createVNode("span", { class: "text-white/40 text-xs" }, toDisplayString(agent.resolved) + " resolved", 1)
                        ]),
                        createVNode("div", { class: "h-1.5 bg-white/[0.06] rounded-full overflow-hidden" }, [
                          createVNode("div", {
                            class: "h-full bg-indigo-500 rounded-full transition-all duration-500",
                            style: { width: `${agent.resolved / Math.max(1, (_b = (_a = unref(stats).agentPerformance[0]) == null ? void 0 : _a.resolved) != null ? _b : 1) * 100}%` }
                          }, null, 4)
                        ])
                      ])
                    ]);
                  }), 128))
                ])) : (openBlock(), createBlock("p", {
                  key: 1,
                  class: "text-white/30 text-sm text-center py-4"
                }, "No agent performance data yet. Assign and resolve tickets to see stats."))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/analytics.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=analytics-iCaCe74W.mjs.map
