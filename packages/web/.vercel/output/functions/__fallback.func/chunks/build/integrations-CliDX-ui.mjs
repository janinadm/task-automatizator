import { _ as __nuxt_component_1 } from './GlassCard-C-gZz82T.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, createTextVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderTeleport, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
import { u as useToast } from './useToast-BbS4urR_.mjs';
import { u as useFetch } from './fetch-DpJJTBVE.mjs';
import './server.mjs';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "integrations",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const { data: integrationsData, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/integrations",
      {
        key: "integrations-data"
      },
      "$uw9_dKDzf-"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const integrations = computed(() => integrationsData.value?.data ?? []);
    const showCreateModal = ref(false);
    const newName = ref("");
    const newType = ref("WEBHOOK");
    const creating = ref(false);
    ref({});
    const typeOptions = [
      { value: "EMAIL_IMAP", label: "Email (IMAP)", description: "Receive emails as tickets", icon: "📧" },
      { value: "EMAIL_SMTP", label: "Email (SMTP)", description: "Send replies via email", icon: "📤" },
      { value: "WHATSAPP", label: "WhatsApp", description: "WhatsApp Business API messages", icon: "💬" },
      { value: "SLACK", label: "Slack", description: "Slack workspace messages", icon: "💼" },
      { value: "WEBHOOK", label: "Custom Webhook", description: "Generic HTTP webhook integration", icon: "🔗" }
    ];
    function getTypeInfo(type) {
      return typeOptions.find((t) => t.value === type) ?? { label: type, description: "", icon: "🔧" };
    }
    const togglingId = ref(null);
    async function toggleActive(integration) {
      togglingId.value = integration.id;
      try {
        await $fetch(`/api/integrations/${integration.id}`, {
          method: "PATCH",
          body: { isActive: !integration.isActive }
        });
        toast.success(`${integration.name} ${integration.isActive ? "disabled" : "enabled"}`);
        await refresh();
      } catch (e) {
        toast.error(e?.data?.message ?? "Failed to update integration");
      } finally {
        togglingId.value = null;
      }
    }
    const deletingId = ref(null);
    async function deleteIntegration(integration) {
      if (!confirm(`Delete "${integration.name}"? This cannot be undone.`)) return;
      deletingId.value = integration.id;
      try {
        await $fetch(`/api/integrations/${integration.id}`, { method: "DELETE" });
        toast.success(`${integration.name} deleted`);
        await refresh();
      } catch (e) {
        toast.error(e?.data?.message ?? "Failed to delete integration");
      } finally {
        deletingId.value = null;
      }
    }
    function copyWebhookUrl(url) {
      const fullUrl = `${(void 0).location.origin}${url}`;
      (void 0).clipboard.writeText(fullUrl);
      toast.success("Webhook URL copied!");
    }
    function fmtDate(d) {
      return new Date(d).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
    }
    function fmtRelative(d) {
      const diff = Date.now() - new Date(d).getTime();
      const mins = Math.floor(diff / 6e4);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiGlassCard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in space-y-6" }, _attrs))}><div class="flex items-center justify-between"><div><h2 class="text-xl font-bold text-white">Integrations</h2><p class="text-white/40 text-sm mt-1"> Connect external channels to receive and respond to tickets </p></div><div class="flex items-center gap-2"><button class="btn-primary text-sm flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add Integration </button><button class="btn-ghost text-sm flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Refresh </button></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showCreateModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div class="w-full max-w-lg bg-[#0f0f23]/95 border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-bold text-white">New Integration</h3><button class="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"><svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><form class="space-y-5"><div><label class="block text-sm text-white/60 mb-3 font-medium">Channel type</label><div class="grid grid-cols-2 gap-2"><!--[-->`);
          ssrRenderList(typeOptions, (opt) => {
            _push2(`<button type="button" class="${ssrRenderClass([unref(newType) === opt.value ? "border-indigo-500/40 bg-indigo-500/[0.08]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]", "p-3 rounded-xl border text-left transition-all duration-200"])}"><span class="text-lg">${ssrInterpolate(opt.icon)}</span><p class="text-white text-sm font-medium mt-1">${ssrInterpolate(opt.label)}</p><p class="text-white/30 text-xs mt-0.5">${ssrInterpolate(opt.description)}</p></button>`);
          });
          _push2(`<!--]--></div></div><div><label class="block text-sm text-white/60 mb-2 font-medium">Display name</label><input${ssrRenderAttr("value", unref(newName))} type="text" placeholder="e.g. Support Email, Sales WhatsApp" class="input-glass"${ssrIncludeBooleanAttr(unref(creating)) ? " disabled" : ""}></div><div class="p-4 bg-indigo-500/[0.06] border border-indigo-500/15 rounded-xl"><p class="text-indigo-300 text-sm font-medium mb-1">How it works</p><p class="text-white/40 text-xs leading-relaxed">`);
          if (unref(newType) === "WEBHOOK") {
            _push2(`<!--[--> A unique webhook URL will be generated. Send POST requests to this URL with a JSON body containing <code class="text-white/60">subject</code>, <code class="text-white/60">body</code>, <code class="text-white/60">senderName</code>, and <code class="text-white/60">senderEmail</code> to automatically create tickets. <!--]-->`);
          } else if (unref(newType) === "EMAIL_IMAP" || unref(newType) === "EMAIL_SMTP") {
            _push2(`<!--[--> Configure your email service to forward incoming messages to the generated webhook URL, or set up IMAP polling credentials in the config section after creation. <!--]-->`);
          } else if (unref(newType) === "WHATSAPP") {
            _push2(`<!--[--> Configure the WhatsApp Business API webhook to point to the generated URL. Incoming messages will automatically create tickets. <!--]-->`);
          } else if (unref(newType) === "SLACK") {
            _push2(`<!--[--> Set up a Slack app with Events API and point the webhook URL to the generated endpoint. Channel messages will be converted to tickets. <!--]-->`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</p></div><button type="submit"${ssrIncludeBooleanAttr(unref(creating) || !unref(newName).trim()) ? " disabled" : ""} class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">`);
          if (unref(creating)) {
            _push2(`<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate(unref(creating) ? "Creating..." : "Create Integration")}</button></form></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      if (unref(pending)) {
        _push(`<div class="flex items-center justify-center py-24"><div class="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div></div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-8 text-center"><p class="text-red-300">Failed to load integrations.</p><button class="btn-primary mt-4 text-sm">Retry</button></div>`);
      } else {
        _push(`<!--[-->`);
        if (unref(integrations).length === 0) {
          _push(`<div class="glass-card p-16 text-center"><div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-500/10 flex items-center justify-center"><svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></div><h3 class="text-white font-semibold text-lg mb-2">No integrations yet</h3><p class="text-white/40 text-sm mb-6 max-w-md mx-auto"> Connect external channels like Email, WhatsApp, or Slack to automatically receive customer messages as tickets. </p><button class="btn-primary text-sm inline-flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add your first integration </button></div>`);
        } else {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(integrations), (integration) => {
            _push(ssrRenderComponent(_component_UiGlassCard, {
              key: integration.id,
              padding: "md",
              hover: true
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="flex items-start gap-4 flex-wrap sm:flex-nowrap"${_scopeId}><div class="${ssrRenderClass([integration.isActive ? "bg-indigo-500/15" : "bg-white/[0.04]", "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"])}"${_scopeId}>${ssrInterpolate(getTypeInfo(integration.type).icon)}</div><div class="flex-1 min-w-0"${_scopeId}><div class="flex items-center gap-2 flex-wrap"${_scopeId}><span class="${ssrRenderClass([{ "opacity-50": !integration.isActive }, "text-white font-semibold"])}"${_scopeId}>${ssrInterpolate(integration.name)}</span><span class="${ssrRenderClass([integration.isActive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-white/[0.06] text-white/40 border-white/10", "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border"])}"${_scopeId}>${ssrInterpolate(integration.isActive ? "Active" : "Disabled")}</span></div><p class="text-white/40 text-sm mt-0.5"${_scopeId}>${ssrInterpolate(getTypeInfo(integration.type).label)}</p>`);
                  if (integration.webhookUrl) {
                    _push2(`<div class="mt-2 flex items-center gap-2"${_scopeId}><code class="text-xs text-white/30 bg-white/[0.04] px-2 py-1 rounded-lg truncate max-w-xs"${_scopeId}>${ssrInterpolate(integration.webhookUrl)}</code><button class="p-1 rounded hover:bg-white/[0.06] transition-colors flex-shrink-0" title="Copy full URL"${_scopeId}><svg class="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"${_scopeId}></path></svg></button></div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`<div class="flex items-center gap-3 mt-2 text-xs text-white/30"${_scopeId}><span${_scopeId}>Created ${ssrInterpolate(fmtDate(integration.createdAt))}</span>`);
                  if (integration.lastSyncAt) {
                    _push2(`<span${_scopeId}> · Last activity ${ssrInterpolate(fmtRelative(integration.lastSyncAt))}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div></div><div class="flex items-center gap-2 flex-shrink-0"${_scopeId}><button class="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"${ssrIncludeBooleanAttr(unref(togglingId) === integration.id) ? " disabled" : ""}${ssrRenderAttr("title", integration.isActive ? "Disable" : "Enable")}${_scopeId}>`);
                  if (unref(togglingId) === integration.id) {
                    _push2(`<svg class="w-4 h-4 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"${_scopeId}></path></svg>`);
                  } else {
                    _push2(`<svg class="${ssrRenderClass([integration.isActive ? "text-emerald-400" : "text-white/30", "w-4 h-4"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", integration.isActive ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636")}${_scopeId}></path></svg>`);
                  }
                  _push2(`</button><button class="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 transition-colors"${ssrIncludeBooleanAttr(unref(deletingId) === integration.id) ? " disabled" : ""} title="Delete integration"${_scopeId}>`);
                  if (unref(deletingId) === integration.id) {
                    _push2(`<svg class="w-4 h-4 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"${_scopeId}></path></svg>`);
                  } else {
                    _push2(`<svg class="w-4 h-4 text-red-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"${_scopeId}></path></svg>`);
                  }
                  _push2(`</button></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex items-start gap-4 flex-wrap sm:flex-nowrap" }, [
                      createVNode("div", {
                        class: ["w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0", integration.isActive ? "bg-indigo-500/15" : "bg-white/[0.04]"]
                      }, toDisplayString(getTypeInfo(integration.type).icon), 3),
                      createVNode("div", { class: "flex-1 min-w-0" }, [
                        createVNode("div", { class: "flex items-center gap-2 flex-wrap" }, [
                          createVNode("span", {
                            class: ["text-white font-semibold", { "opacity-50": !integration.isActive }]
                          }, toDisplayString(integration.name), 3),
                          createVNode("span", {
                            class: ["px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border", integration.isActive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-white/[0.06] text-white/40 border-white/10"]
                          }, toDisplayString(integration.isActive ? "Active" : "Disabled"), 3)
                        ]),
                        createVNode("p", { class: "text-white/40 text-sm mt-0.5" }, toDisplayString(getTypeInfo(integration.type).label), 1),
                        integration.webhookUrl ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "mt-2 flex items-center gap-2"
                        }, [
                          createVNode("code", { class: "text-xs text-white/30 bg-white/[0.04] px-2 py-1 rounded-lg truncate max-w-xs" }, toDisplayString(integration.webhookUrl), 1),
                          createVNode("button", {
                            onClick: ($event) => copyWebhookUrl(integration.webhookUrl),
                            class: "p-1 rounded hover:bg-white/[0.06] transition-colors flex-shrink-0",
                            title: "Copy full URL"
                          }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-3.5 h-3.5 text-white/40",
                              fill: "none",
                              stroke: "currentColor",
                              viewBox: "0 0 24 24"
                            }, [
                              createVNode("path", {
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round",
                                "stroke-width": "2",
                                d: "M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                              })
                            ]))
                          ], 8, ["onClick"])
                        ])) : createCommentVNode("", true),
                        createVNode("div", { class: "flex items-center gap-3 mt-2 text-xs text-white/30" }, [
                          createVNode("span", null, "Created " + toDisplayString(fmtDate(integration.createdAt)), 1),
                          integration.lastSyncAt ? (openBlock(), createBlock("span", { key: 0 }, " · Last activity " + toDisplayString(fmtRelative(integration.lastSyncAt)), 1)) : createCommentVNode("", true)
                        ])
                      ]),
                      createVNode("div", { class: "flex items-center gap-2 flex-shrink-0" }, [
                        createVNode("button", {
                          onClick: ($event) => toggleActive(integration),
                          class: "p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors",
                          disabled: unref(togglingId) === integration.id,
                          title: integration.isActive ? "Disable" : "Enable"
                        }, [
                          unref(togglingId) === integration.id ? (openBlock(), createBlock("svg", {
                            key: 0,
                            class: "w-4 h-4 text-white/40 animate-spin",
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
                            class: ["w-4 h-4", integration.isActive ? "text-emerald-400" : "text-white/30"],
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: integration.isActive ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            }, null, 8, ["d"])
                          ], 2))
                        ], 8, ["onClick", "disabled", "title"]),
                        createVNode("button", {
                          onClick: ($event) => deleteIntegration(integration),
                          class: "p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 transition-colors",
                          disabled: unref(deletingId) === integration.id,
                          title: "Delete integration"
                        }, [
                          unref(deletingId) === integration.id ? (openBlock(), createBlock("svg", {
                            key: 0,
                            class: "w-4 h-4 text-white/40 animate-spin",
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
                            class: "w-4 h-4 text-red-400/60",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            })
                          ]))
                        ], 8, ["onClick", "disabled"])
                      ])
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        }
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-white font-semibold text-sm mb-3 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"${_scopeId}></path></svg> Supported Channels </h3><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(typeOptions, (opt) => {
                _push2(`<div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"${_scopeId}><div class="flex items-center gap-2 mb-1"${_scopeId}><span class="text-lg"${_scopeId}>${ssrInterpolate(opt.icon)}</span><span class="text-white/70 text-sm font-medium"${_scopeId}>${ssrInterpolate(opt.label)}</span></div><p class="text-white/30 text-xs"${_scopeId}>${ssrInterpolate(opt.description)}</p></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("h3", { class: "text-white font-semibold text-sm mb-3 flex items-center gap-2" }, [
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
                      d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    })
                  ])),
                  createTextVNode(" Supported Channels ")
                ]),
                createVNode("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" }, [
                  (openBlock(), createBlock(Fragment, null, renderList(typeOptions, (opt) => {
                    return createVNode("div", {
                      key: opt.value,
                      class: "p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                    }, [
                      createVNode("div", { class: "flex items-center gap-2 mb-1" }, [
                        createVNode("span", { class: "text-lg" }, toDisplayString(opt.icon), 1),
                        createVNode("span", { class: "text-white/70 text-sm font-medium" }, toDisplayString(opt.label), 1)
                      ]),
                      createVNode("p", { class: "text-white/30 text-xs" }, toDisplayString(opt.description), 1)
                    ]);
                  }), 64))
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/integrations.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=integrations-CliDX-ui.mjs.map
