import { _ as __nuxt_component_1 } from './GlassCard-C-gZz82T.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, createTextVNode, toDisplayString, createCommentVNode, withDirectives, withKeys, isRef, vModelText, Fragment, renderList, Transition, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
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
  __name: "settings",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const { data: settingsData, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/settings",
      {
        key: "settings-data"
      },
      "$NcOXUh9bJI"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const settings = computed(() => {
      var _a;
      return (_a = settingsData.value) == null ? void 0 : _a.data;
    });
    const isAdmin = computed(() => {
      var _a;
      return ((_a = settings.value) == null ? void 0 : _a.currentUserRole) === "ADMIN";
    });
    const editingName = ref(false);
    const orgName = ref("");
    const savingName = ref(false);
    function startEditName() {
      var _a, _b;
      orgName.value = (_b = (_a = settings.value) == null ? void 0 : _a.organization.name) != null ? _b : "";
      editingName.value = true;
    }
    async function saveName() {
      var _a, _b;
      if (!orgName.value.trim()) return;
      savingName.value = true;
      try {
        await $fetch("/api/settings", {
          method: "PATCH",
          body: { name: orgName.value }
        });
        toast.success("Organization name updated");
        editingName.value = false;
        await refresh();
      } catch (e) {
        toast.error((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) != null ? _b : "Failed to update name");
      } finally {
        savingName.value = false;
      }
    }
    const slaEditing = ref(false);
    const slaValues = ref([]);
    const savingSla = ref(false);
    const defaultSla = [
      { priority: "URGENT", maxResponseMinutes: 60, label: "Urgent" },
      { priority: "HIGH", maxResponseMinutes: 240, label: "High" },
      { priority: "MEDIUM", maxResponseMinutes: 480, label: "Medium" },
      { priority: "LOW", maxResponseMinutes: 1440, label: "Low" }
    ];
    function startEditSla() {
      slaValues.value = defaultSla.map((d) => {
        var _a, _b;
        const existing = (_a = settings.value) == null ? void 0 : _a.slaConfigs.find((c) => c.priority === d.priority);
        return {
          priority: d.priority,
          maxResponseMinutes: (_b = existing == null ? void 0 : existing.maxResponseMinutes) != null ? _b : d.maxResponseMinutes
        };
      });
      slaEditing.value = true;
    }
    async function saveSla() {
      var _a, _b;
      savingSla.value = true;
      try {
        await $fetch("/api/settings", {
          method: "PATCH",
          body: { slaConfigs: slaValues.value }
        });
        toast.success("SLA policies updated");
        slaEditing.value = false;
        await refresh();
      } catch (e) {
        toast.error((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) != null ? _b : "Failed to update SLA");
      } finally {
        savingSla.value = false;
      }
    }
    function formatMinutes(mins) {
      if (mins < 60) return `${mins}m`;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    function fmtDate(d) {
      return new Date(d).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });
    }
    const planBadgeClass = {
      FREE: "bg-white/10 text-white/60 border-white/10",
      STARTER: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      PRO: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      ENTERPRISE: "bg-purple-500/20 text-purple-300 border-purple-500/30"
    };
    const togglingAutoAssign = ref(false);
    async function toggleAutoAssign() {
      var _a, _b;
      if (!isAdmin.value || !settings.value) return;
      togglingAutoAssign.value = true;
      try {
        await $fetch("/api/settings", {
          method: "PATCH",
          body: { autoAssign: !settings.value.organization.autoAssign }
        });
        toast.success(settings.value.organization.autoAssign ? "Auto-assign disabled" : "Auto-assign enabled");
        await refresh();
      } catch (e) {
        toast.error((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) != null ? _b : "Failed to toggle auto-assign");
      } finally {
        togglingAutoAssign.value = false;
      }
    }
    async function triggerAutoAssign() {
      var _a, _b;
      try {
        const res = await $fetch("/api/tickets/auto-assign", { method: "POST" });
        toast.success(`Auto-assigned ${res.data.assignedCount} ticket(s)`);
      } catch (e) {
        toast.error((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) != null ? _b : "Auto-assign failed");
      }
    }
    const cannedResponses = ref([]);
    const loadingCanned = ref(false);
    const showCannedForm = ref(false);
    const cannedForm = ref({ title: "", body: "", category: "", shortcut: "" });
    const savingCanned = ref(false);
    async function fetchCannedResponses() {
      loadingCanned.value = true;
      try {
        const res = await $fetch("/api/canned-responses");
        cannedResponses.value = res.data;
      } catch {
      } finally {
        loadingCanned.value = false;
      }
    }
    async function createCannedResponse() {
      var _a, _b;
      if (!cannedForm.value.title.trim() || !cannedForm.value.body.trim()) return;
      savingCanned.value = true;
      try {
        await $fetch("/api/canned-responses", {
          method: "POST",
          body: {
            title: cannedForm.value.title,
            body: cannedForm.value.body,
            category: cannedForm.value.category || void 0,
            shortcut: cannedForm.value.shortcut || void 0
          }
        });
        toast.success("Canned response created");
        cannedForm.value = { title: "", body: "", category: "", shortcut: "" };
        showCannedForm.value = false;
        await fetchCannedResponses();
      } catch (e) {
        toast.error((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) != null ? _b : "Failed to create canned response");
      } finally {
        savingCanned.value = false;
      }
    }
    async function deleteCannedResponse(id) {
      var _a, _b;
      try {
        await $fetch(`/api/canned-responses/${id}`, { method: "DELETE" });
        toast.success("Canned response deleted");
        await fetchCannedResponses();
      } catch (e) {
        toast.error((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) != null ? _b : "Failed to delete");
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiGlassCard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in space-y-6 max-w-3xl" }, _attrs))}><div><h2 class="text-xl font-bold text-white">Settings</h2><p class="text-white/40 text-sm mt-1">Manage your organization configuration</p></div>`);
      if (unref(pending)) {
        _push(`<div class="flex items-center justify-center py-24"><div class="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div></div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-8 text-center"><p class="text-red-300">Failed to load settings.</p><button class="btn-primary mt-4 text-sm">Retry</button></div>`);
      } else if (unref(settings)) {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b;
            if (_push2) {
              _push2(`<h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"${_scopeId}></path></svg> Organization </h3><div class="space-y-4"${_scopeId}><div${_scopeId}><label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5"${_scopeId}>Name</label>`);
              if (!unref(editingName)) {
                _push2(`<div class="flex items-center gap-3"${_scopeId}><span class="text-white font-medium text-lg"${_scopeId}>${ssrInterpolate(unref(settings).organization.name)}</span>`);
                if (unref(isAdmin)) {
                  _push2(`<button class="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors" title="Edit name"${_scopeId}><svg class="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"${_scopeId}></path></svg></button>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<div class="flex items-center gap-2"${_scopeId}><input${ssrRenderAttr("value", unref(orgName))} type="text" class="input-glass flex-1" maxlength="100"${ssrIncludeBooleanAttr(unref(savingName)) ? " disabled" : ""}${_scopeId}><button${ssrIncludeBooleanAttr(unref(savingName) || !unref(orgName).trim()) ? " disabled" : ""} class="btn-primary text-sm"${_scopeId}>${ssrInterpolate(unref(savingName) ? "Saving..." : "Save")}</button><button class="btn-ghost text-sm"${_scopeId}>Cancel</button></div>`);
              }
              _push2(`</div><div${_scopeId}><label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5"${_scopeId}>Plan</label><span class="${ssrRenderClass([(_a = planBadgeClass[unref(settings).organization.plan]) != null ? _a : planBadgeClass.FREE, "inline-block px-3 py-1 rounded-full text-xs font-semibold border"])}"${_scopeId}>${ssrInterpolate(unref(settings).organization.plan)}</span></div><div class="grid grid-cols-3 gap-4 pt-2 border-t border-white/[0.06]"${_scopeId}><div${_scopeId}><p class="text-white font-semibold"${_scopeId}>${ssrInterpolate(unref(settings).memberCount)}</p><p class="text-white/30 text-xs"${_scopeId}>Team Members</p></div><div${_scopeId}><p class="text-white font-semibold"${_scopeId}>${ssrInterpolate(unref(settings).ticketCount)}</p><p class="text-white/30 text-xs"${_scopeId}>Total Tickets</p></div><div${_scopeId}><p class="text-white/50 text-sm"${_scopeId}>${ssrInterpolate(fmtDate(unref(settings).organization.createdAt))}</p><p class="text-white/30 text-xs"${_scopeId}>Created</p></div></div></div>`);
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
                      d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    })
                  ])),
                  createTextVNode(" Organization ")
                ]),
                createVNode("div", { class: "space-y-4" }, [
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-xs text-white/50 uppercase tracking-wider mb-1.5" }, "Name"),
                    !unref(editingName) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "flex items-center gap-3"
                    }, [
                      createVNode("span", { class: "text-white font-medium text-lg" }, toDisplayString(unref(settings).organization.name), 1),
                      unref(isAdmin) ? (openBlock(), createBlock("button", {
                        key: 0,
                        onClick: startEditName,
                        class: "p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors",
                        title: "Edit name"
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
                            d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          })
                        ]))
                      ])) : createCommentVNode("", true)
                    ])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "flex items-center gap-2"
                    }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => isRef(orgName) ? orgName.value = $event : null,
                        type: "text",
                        class: "input-glass flex-1",
                        maxlength: "100",
                        disabled: unref(savingName),
                        onKeyup: withKeys(saveName, ["enter"])
                      }, null, 40, ["onUpdate:modelValue", "disabled"]), [
                        [vModelText, unref(orgName)]
                      ]),
                      createVNode("button", {
                        onClick: saveName,
                        disabled: unref(savingName) || !unref(orgName).trim(),
                        class: "btn-primary text-sm"
                      }, toDisplayString(unref(savingName) ? "Saving..." : "Save"), 9, ["disabled"]),
                      createVNode("button", {
                        onClick: ($event) => editingName.value = false,
                        class: "btn-ghost text-sm"
                      }, "Cancel", 8, ["onClick"])
                    ]))
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-xs text-white/50 uppercase tracking-wider mb-1.5" }, "Plan"),
                    createVNode("span", {
                      class: ["inline-block px-3 py-1 rounded-full text-xs font-semibold border", (_b = planBadgeClass[unref(settings).organization.plan]) != null ? _b : planBadgeClass.FREE]
                    }, toDisplayString(unref(settings).organization.plan), 3)
                  ]),
                  createVNode("div", { class: "grid grid-cols-3 gap-4 pt-2 border-t border-white/[0.06]" }, [
                    createVNode("div", null, [
                      createVNode("p", { class: "text-white font-semibold" }, toDisplayString(unref(settings).memberCount), 1),
                      createVNode("p", { class: "text-white/30 text-xs" }, "Team Members")
                    ]),
                    createVNode("div", null, [
                      createVNode("p", { class: "text-white font-semibold" }, toDisplayString(unref(settings).ticketCount), 1),
                      createVNode("p", { class: "text-white/30 text-xs" }, "Total Tickets")
                    ]),
                    createVNode("div", null, [
                      createVNode("p", { class: "text-white/50 text-sm" }, toDisplayString(fmtDate(unref(settings).organization.createdAt)), 1),
                      createVNode("p", { class: "text-white/30 text-xs" }, "Created")
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
              _push2(`<div class="flex items-center justify-between mb-4"${_scopeId}><h3 class="text-white font-semibold text-sm flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"${_scopeId}></path></svg> SLA Policies </h3>`);
              if (unref(isAdmin) && !unref(slaEditing)) {
                _push2(`<button class="btn-ghost text-xs"${_scopeId}> Edit </button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><p class="text-white/30 text-xs mb-4"${_scopeId}>Maximum response time allowed per priority level.</p>`);
              if (!unref(slaEditing)) {
                _push2(`<div class="space-y-3"${_scopeId}><!--[-->`);
                ssrRenderList(defaultSla, (d) => {
                  var _a, _b;
                  _push2(`<div class="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><span class="${ssrRenderClass([{
                    "bg-red-400": d.priority === "URGENT",
                    "bg-orange-400": d.priority === "HIGH",
                    "bg-amber-400": d.priority === "MEDIUM",
                    "bg-emerald-400": d.priority === "LOW"
                  }, "w-2 h-2 rounded-full"])}"${_scopeId}></span><span class="text-white/70 text-sm"${_scopeId}>${ssrInterpolate(d.label)}</span></div><span class="text-white/50 text-sm font-mono"${_scopeId}>${ssrInterpolate(formatMinutes((_b = (_a = unref(settings).slaConfigs.find((c) => c.priority === d.priority)) == null ? void 0 : _a.maxResponseMinutes) != null ? _b : d.maxResponseMinutes))}</span></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<div class="space-y-3"${_scopeId}><!--[-->`);
                ssrRenderList(unref(slaValues), (sla, i) => {
                  var _a;
                  _push2(`<div class="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><span class="${ssrRenderClass([{
                    "bg-red-400": sla.priority === "URGENT",
                    "bg-orange-400": sla.priority === "HIGH",
                    "bg-amber-400": sla.priority === "MEDIUM",
                    "bg-emerald-400": sla.priority === "LOW"
                  }, "w-2 h-2 rounded-full"])}"${_scopeId}></span><span class="text-white/70 text-sm"${_scopeId}>${ssrInterpolate((_a = defaultSla[i]) == null ? void 0 : _a.label)}</span></div><div class="flex items-center gap-2"${_scopeId}><input${ssrRenderAttr("value", sla.maxResponseMinutes)} type="number" min="1" max="10080" class="input-glass w-24 text-right text-sm"${ssrIncludeBooleanAttr(unref(savingSla)) ? " disabled" : ""}${_scopeId}><span class="text-white/30 text-xs w-8"${_scopeId}>min</span></div></div>`);
                });
                _push2(`<!--]--><div class="flex items-center justify-end gap-2 pt-2"${_scopeId}><button class="btn-ghost text-sm"${_scopeId}>Cancel</button><button${ssrIncludeBooleanAttr(unref(savingSla)) ? " disabled" : ""} class="btn-primary text-sm"${_scopeId}>${ssrInterpolate(unref(savingSla) ? "Saving..." : "Save SLA")}</button></div></div>`);
              }
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between mb-4" }, [
                  createVNode("h3", { class: "text-white font-semibold text-sm flex items-center gap-2" }, [
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
                        d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      })
                    ])),
                    createTextVNode(" SLA Policies ")
                  ]),
                  unref(isAdmin) && !unref(slaEditing) ? (openBlock(), createBlock("button", {
                    key: 0,
                    onClick: startEditSla,
                    class: "btn-ghost text-xs"
                  }, " Edit ")) : createCommentVNode("", true)
                ]),
                createVNode("p", { class: "text-white/30 text-xs mb-4" }, "Maximum response time allowed per priority level."),
                !unref(slaEditing) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "space-y-3"
                }, [
                  (openBlock(), createBlock(Fragment, null, renderList(defaultSla, (d) => {
                    var _a, _b;
                    return createVNode("div", {
                      key: d.priority,
                      class: "flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]"
                    }, [
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        createVNode("span", {
                          class: ["w-2 h-2 rounded-full", {
                            "bg-red-400": d.priority === "URGENT",
                            "bg-orange-400": d.priority === "HIGH",
                            "bg-amber-400": d.priority === "MEDIUM",
                            "bg-emerald-400": d.priority === "LOW"
                          }]
                        }, null, 2),
                        createVNode("span", { class: "text-white/70 text-sm" }, toDisplayString(d.label), 1)
                      ]),
                      createVNode("span", { class: "text-white/50 text-sm font-mono" }, toDisplayString(formatMinutes((_b = (_a = unref(settings).slaConfigs.find((c) => c.priority === d.priority)) == null ? void 0 : _a.maxResponseMinutes) != null ? _b : d.maxResponseMinutes)), 1)
                    ]);
                  }), 64))
                ])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "space-y-3"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(slaValues), (sla, i) => {
                    var _a;
                    return openBlock(), createBlock("div", {
                      key: sla.priority,
                      class: "flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]"
                    }, [
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        createVNode("span", {
                          class: ["w-2 h-2 rounded-full", {
                            "bg-red-400": sla.priority === "URGENT",
                            "bg-orange-400": sla.priority === "HIGH",
                            "bg-amber-400": sla.priority === "MEDIUM",
                            "bg-emerald-400": sla.priority === "LOW"
                          }]
                        }, null, 2),
                        createVNode("span", { class: "text-white/70 text-sm" }, toDisplayString((_a = defaultSla[i]) == null ? void 0 : _a.label), 1)
                      ]),
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => sla.maxResponseMinutes = $event,
                          type: "number",
                          min: "1",
                          max: "10080",
                          class: "input-glass w-24 text-right text-sm",
                          disabled: unref(savingSla)
                        }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                          [
                            vModelText,
                            sla.maxResponseMinutes,
                            void 0,
                            { number: true }
                          ]
                        ]),
                        createVNode("span", { class: "text-white/30 text-xs w-8" }, "min")
                      ])
                    ]);
                  }), 128)),
                  createVNode("div", { class: "flex items-center justify-end gap-2 pt-2" }, [
                    createVNode("button", {
                      onClick: ($event) => slaEditing.value = false,
                      class: "btn-ghost text-sm"
                    }, "Cancel", 8, ["onClick"]),
                    createVNode("button", {
                      onClick: saveSla,
                      disabled: unref(savingSla),
                      class: "btn-primary text-sm"
                    }, toDisplayString(unref(savingSla) ? "Saving..." : "Save SLA"), 9, ["disabled"])
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
              _push2(`<div class="flex items-center justify-between mb-4"${_scopeId}><h3 class="text-white font-semibold text-sm flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"${_scopeId}></path></svg> Auto-Assignment </h3>`);
              if (unref(isAdmin)) {
                _push2(`<button class="${ssrRenderClass([unref(settings).organization.autoAssign ? "bg-indigo-500" : "bg-white/10", "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"])}"${ssrIncludeBooleanAttr(unref(togglingAutoAssign)) ? " disabled" : ""}${_scopeId}><span class="${ssrRenderClass([unref(settings).organization.autoAssign ? "translate-x-5" : "translate-x-0", "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"])}"${_scopeId}></span></button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><p class="text-white/30 text-xs mb-3"${_scopeId}> When enabled, new tickets are automatically distributed to available agents using round-robin. </p>`);
              if (unref(isAdmin) && unref(settings).organization.autoAssign) {
                _push2(`<button class="btn-ghost text-xs flex items-center gap-1.5"${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"${_scopeId}></path></svg> Assign unassigned tickets now </button>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between mb-4" }, [
                  createVNode("h3", { class: "text-white font-semibold text-sm flex items-center gap-2" }, [
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
                    createTextVNode(" Auto-Assignment ")
                  ]),
                  unref(isAdmin) ? (openBlock(), createBlock("button", {
                    key: 0,
                    class: ["relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none", unref(settings).organization.autoAssign ? "bg-indigo-500" : "bg-white/10"],
                    disabled: unref(togglingAutoAssign),
                    onClick: toggleAutoAssign
                  }, [
                    createVNode("span", {
                      class: ["absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200", unref(settings).organization.autoAssign ? "translate-x-5" : "translate-x-0"]
                    }, null, 2)
                  ], 10, ["disabled"])) : createCommentVNode("", true)
                ]),
                createVNode("p", { class: "text-white/30 text-xs mb-3" }, " When enabled, new tickets are automatically distributed to available agents using round-robin. "),
                unref(isAdmin) && unref(settings).organization.autoAssign ? (openBlock(), createBlock("button", {
                  key: 0,
                  class: "btn-ghost text-xs flex items-center gap-1.5",
                  onClick: triggerAutoAssign
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
                      d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    })
                  ])),
                  createTextVNode(" Assign unassigned tickets now ")
                ])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between mb-4"${_scopeId}><h3 class="text-white font-semibold text-sm flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"${_scopeId}></path></svg> Canned Responses <span class="text-white/30 text-xs font-normal"${_scopeId}>(${ssrInterpolate(unref(cannedResponses).length)})</span></h3>`);
              if (unref(isAdmin)) {
                _push2(`<button class="btn-primary text-xs flex items-center gap-1.5"${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"${_scopeId}></path></svg> New Template </button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><p class="text-white/30 text-xs mb-4"${_scopeId}> Pre-written reply templates agents can insert with one click. Use <code class="text-indigo-400/60"${_scopeId}>{{ticket.customerName}}</code> for dynamic values. </p>`);
              if (unref(showCannedForm)) {
                _push2(`<div class="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3"${_scopeId}><input${ssrRenderAttr("value", unref(cannedForm).title)} type="text" placeholder="Template title (e.g., Greeting)" class="input-glass w-full text-sm"${ssrIncludeBooleanAttr(unref(savingCanned)) ? " disabled" : ""}${_scopeId}><textarea rows="3"${ssrRenderAttr("placeholder", "Template body... (e.g., Hi {{ticket.customerName}}, thanks for reaching out!)")} class="input-glass w-full text-sm resize-none"${ssrIncludeBooleanAttr(unref(savingCanned)) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(cannedForm).body)}</textarea><div class="grid grid-cols-2 gap-3"${_scopeId}><input${ssrRenderAttr("value", unref(cannedForm).category)} type="text" placeholder="Category (optional)" class="input-glass text-sm"${ssrIncludeBooleanAttr(unref(savingCanned)) ? " disabled" : ""}${_scopeId}><input${ssrRenderAttr("value", unref(cannedForm).shortcut)} type="text" placeholder="Shortcut (e.g., /greet)" class="input-glass text-sm"${ssrIncludeBooleanAttr(unref(savingCanned)) ? " disabled" : ""}${_scopeId}></div><div class="flex items-center justify-end gap-2"${_scopeId}><button class="btn-ghost text-sm"${_scopeId}>Cancel</button><button${ssrIncludeBooleanAttr(unref(savingCanned) || !unref(cannedForm).title.trim() || !unref(cannedForm).body.trim()) ? " disabled" : ""} class="btn-primary text-sm"${_scopeId}>${ssrInterpolate(unref(savingCanned) ? "Creating..." : "Create")}</button></div></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(loadingCanned)) {
                _push2(`<div class="py-6 text-center"${_scopeId}><div class="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"${_scopeId}></div></div>`);
              } else if (!unref(cannedResponses).length) {
                _push2(`<div class="py-6 text-center text-white/30 text-sm"${_scopeId}> No canned responses yet. Create one to help agents reply faster. </div>`);
              } else {
                _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
                ssrRenderList(unref(cannedResponses), (cr) => {
                  _push2(`<div class="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors"${_scopeId}><div class="flex-1 min-w-0"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><span class="text-white/80 text-sm font-medium"${_scopeId}>${ssrInterpolate(cr.title)}</span>`);
                  if (cr.shortcut) {
                    _push2(`<span class="text-indigo-400/60 text-[10px] font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded"${_scopeId}>${ssrInterpolate(cr.shortcut)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (cr.category) {
                    _push2(`<span class="text-white/30 text-[10px]"${_scopeId}>${ssrInterpolate(cr.category)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><p class="text-white/40 text-xs mt-1 line-clamp-2"${_scopeId}>${ssrInterpolate(cr.body)}</p><span class="text-white/20 text-[10px] mt-1 block"${_scopeId}>Used ${ssrInterpolate(cr.usageCount)} time${ssrInterpolate(cr.usageCount === 1 ? "" : "s")}</span></div>`);
                  if (unref(isAdmin)) {
                    _push2(`<button class="text-white/20 hover:text-red-400 transition-colors flex-shrink-0 p-1"${_scopeId}><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"${_scopeId}></path></svg></button>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div>`);
                });
                _push2(`<!--]--></div>`);
              }
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between mb-4" }, [
                  createVNode("h3", { class: "text-white font-semibold text-sm flex items-center gap-2" }, [
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
                        d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      })
                    ])),
                    createTextVNode(" Canned Responses "),
                    createVNode("span", { class: "text-white/30 text-xs font-normal" }, "(" + toDisplayString(unref(cannedResponses).length) + ")", 1)
                  ]),
                  unref(isAdmin) ? (openBlock(), createBlock("button", {
                    key: 0,
                    class: "btn-primary text-xs flex items-center gap-1.5",
                    onClick: ($event) => showCannedForm.value = !unref(showCannedForm)
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
                        d: "M12 4v16m8-8H4"
                      })
                    ])),
                    createTextVNode(" New Template ")
                  ], 8, ["onClick"])) : createCommentVNode("", true)
                ]),
                createVNode("p", { class: "text-white/30 text-xs mb-4" }, [
                  createTextVNode(" Pre-written reply templates agents can insert with one click. Use "),
                  createVNode("code", { class: "text-indigo-400/60" }, "{{ticket.customerName}}"),
                  createTextVNode(" for dynamic values. ")
                ]),
                createVNode(Transition, { name: "fade" }, {
                  default: withCtx(() => [
                    unref(showCannedForm) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3"
                    }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(cannedForm).title = $event,
                        type: "text",
                        placeholder: "Template title (e.g., Greeting)",
                        class: "input-glass w-full text-sm",
                        disabled: unref(savingCanned)
                      }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                        [vModelText, unref(cannedForm).title]
                      ]),
                      withDirectives(createVNode("textarea", {
                        "onUpdate:modelValue": ($event) => unref(cannedForm).body = $event,
                        rows: "3",
                        placeholder: "Template body... (e.g., Hi {{ticket.customerName}}, thanks for reaching out!)",
                        class: "input-glass w-full text-sm resize-none",
                        disabled: unref(savingCanned)
                      }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                        [vModelText, unref(cannedForm).body]
                      ]),
                      createVNode("div", { class: "grid grid-cols-2 gap-3" }, [
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(cannedForm).category = $event,
                          type: "text",
                          placeholder: "Category (optional)",
                          class: "input-glass text-sm",
                          disabled: unref(savingCanned)
                        }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                          [vModelText, unref(cannedForm).category]
                        ]),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(cannedForm).shortcut = $event,
                          type: "text",
                          placeholder: "Shortcut (e.g., /greet)",
                          class: "input-glass text-sm",
                          disabled: unref(savingCanned)
                        }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                          [vModelText, unref(cannedForm).shortcut]
                        ])
                      ]),
                      createVNode("div", { class: "flex items-center justify-end gap-2" }, [
                        createVNode("button", {
                          onClick: ($event) => showCannedForm.value = false,
                          class: "btn-ghost text-sm"
                        }, "Cancel", 8, ["onClick"]),
                        createVNode("button", {
                          onClick: createCannedResponse,
                          disabled: unref(savingCanned) || !unref(cannedForm).title.trim() || !unref(cannedForm).body.trim(),
                          class: "btn-primary text-sm"
                        }, toDisplayString(unref(savingCanned) ? "Creating..." : "Create"), 9, ["disabled"])
                      ])
                    ])) : createCommentVNode("", true)
                  ]),
                  _: 1
                }),
                unref(loadingCanned) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "py-6 text-center"
                }, [
                  createVNode("div", { class: "animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" })
                ])) : !unref(cannedResponses).length ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "py-6 text-center text-white/30 text-sm"
                }, " No canned responses yet. Create one to help agents reply faster. ")) : (openBlock(), createBlock("div", {
                  key: 2,
                  class: "space-y-2"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(cannedResponses), (cr) => {
                    return openBlock(), createBlock("div", {
                      key: cr.id,
                      class: "flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                    }, [
                      createVNode("div", { class: "flex-1 min-w-0" }, [
                        createVNode("div", { class: "flex items-center gap-2" }, [
                          createVNode("span", { class: "text-white/80 text-sm font-medium" }, toDisplayString(cr.title), 1),
                          cr.shortcut ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "text-indigo-400/60 text-[10px] font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded"
                          }, toDisplayString(cr.shortcut), 1)) : createCommentVNode("", true),
                          cr.category ? (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-white/30 text-[10px]"
                          }, toDisplayString(cr.category), 1)) : createCommentVNode("", true)
                        ]),
                        createVNode("p", { class: "text-white/40 text-xs mt-1 line-clamp-2" }, toDisplayString(cr.body), 1),
                        createVNode("span", { class: "text-white/20 text-[10px] mt-1 block" }, "Used " + toDisplayString(cr.usageCount) + " time" + toDisplayString(cr.usageCount === 1 ? "" : "s"), 1)
                      ]),
                      unref(isAdmin) ? (openBlock(), createBlock("button", {
                        key: 0,
                        class: "text-white/20 hover:text-red-400 transition-colors flex-shrink-0 p-1",
                        onClick: ($event) => deleteCannedResponse(cr.id)
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
                            d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          })
                        ]))
                      ], 8, ["onClick"])) : createCommentVNode("", true)
                    ]);
                  }), 128))
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"${_scopeId}></path></svg> Danger Zone </h3><p class="text-white/30 text-xs mb-4"${_scopeId}>Irreversible actions. Contact support for account deletion.</p><button disabled class="btn-danger text-sm opacity-50 cursor-not-allowed"${_scopeId}> Delete Organization </button>`);
            } else {
              return [
                createVNode("h3", { class: "text-red-400 font-semibold text-sm mb-2 flex items-center gap-2" }, [
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
                      d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    })
                  ])),
                  createTextVNode(" Danger Zone ")
                ]),
                createVNode("p", { class: "text-white/30 text-xs mb-4" }, "Irreversible actions. Contact support for account deletion."),
                createVNode("button", {
                  disabled: "",
                  class: "btn-danger text-sm opacity-50 cursor-not-allowed"
                }, " Delete Organization ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-Cpmrr_a3.mjs.map
