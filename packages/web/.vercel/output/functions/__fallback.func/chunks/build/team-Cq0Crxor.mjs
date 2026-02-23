import { _ as __nuxt_component_1 } from './GlassCard-C-gZz82T.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderStyle, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "team",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const { data: teamData, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/team",
      {
        key: "team-data"
      },
      "$eHP_7exu-d"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const members = computed(() => teamData.value?.data.team ?? []);
    const isAdmin = computed(() => teamData.value?.data.currentUserRole === "ADMIN");
    const showInviteModal = ref(false);
    const inviteEmail = ref("");
    const inviteRole = ref("AGENT");
    const sendingInvite = ref(false);
    const inviteLink = ref("");
    const { data: invitationsData, refresh: refreshInvitations } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/team/invitations",
      {
        key: "team-invitations"
      },
      "$5a-FIiaTSj"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const invitations = computed(() => invitationsData.value?.data ?? []);
    const pendingInvitations = computed(() => invitations.value.filter((i) => i.status === "PENDING"));
    const revokingId = ref(null);
    const updatingId = ref(null);
    async function toggleRole(member) {
      if (!isAdmin.value || updatingId.value) return;
      const newRole = member.role === "ADMIN" ? "AGENT" : "ADMIN";
      updatingId.value = member.id;
      try {
        await $fetch(`/api/team/${member.id}`, {
          method: "PATCH",
          body: { role: newRole }
        });
        toast.success(`${member.fullName} is now ${newRole === "ADMIN" ? "an Admin" : "an Agent"}`);
        await refresh();
      } catch (e) {
        toast.error(e?.data?.message ?? "Failed to update role");
      } finally {
        updatingId.value = null;
      }
    }
    async function toggleActive(member) {
      if (!isAdmin.value || updatingId.value) return;
      updatingId.value = member.id;
      try {
        await $fetch(`/api/team/${member.id}`, {
          method: "PATCH",
          body: { isActive: !member.isActive }
        });
        toast.success(`${member.fullName} has been ${member.isActive ? "deactivated" : "activated"}`);
        await refresh();
      } catch (e) {
        toast.error(e?.data?.message ?? "Failed to update status");
      } finally {
        updatingId.value = null;
      }
    }
    function fmtDate(d) {
      return new Date(d).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
    }
    function isExpired(d) {
      return new Date(d) < /* @__PURE__ */ new Date();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiGlassCard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in space-y-6" }, _attrs))}><div class="flex items-center justify-between"><div><h2 class="text-xl font-bold text-white">Team</h2><p class="text-white/40 text-sm mt-1">${ssrInterpolate(unref(members).length)} member${ssrInterpolate(unref(members).length !== 1 ? "s" : "")} in your organization </p></div><div class="flex items-center gap-2">`);
      if (unref(isAdmin)) {
        _push(`<button class="btn-primary text-sm flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg> Invite Member </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn-ghost text-sm flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Refresh </button></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showInviteModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div class="w-full max-w-md bg-[#0f0f23]/95 border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-bold text-white">Invite Team Member</h3><button class="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"><svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><form class="space-y-4"><div><label class="block text-sm text-white/60 mb-2 font-medium">Email address</label><input${ssrRenderAttr("value", unref(inviteEmail))} type="email" placeholder="colleague@company.com" class="input-glass"${ssrIncludeBooleanAttr(unref(sendingInvite)) ? " disabled" : ""}></div><div><label class="block text-sm text-white/60 mb-2 font-medium">Role</label><select class="input-glass appearance-none" style="${ssrRenderStyle({ "background-image": "url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')", "background-repeat": "no-repeat", "background-position": "right 12px center" })}"${ssrIncludeBooleanAttr(unref(sendingInvite)) ? " disabled" : ""}><option value="AGENT"${ssrIncludeBooleanAttr(Array.isArray(unref(inviteRole)) ? ssrLooseContain(unref(inviteRole), "AGENT") : ssrLooseEqual(unref(inviteRole), "AGENT")) ? " selected" : ""}>Agent — Can manage tickets, respond to customers</option><option value="ADMIN"${ssrIncludeBooleanAttr(Array.isArray(unref(inviteRole)) ? ssrLooseContain(unref(inviteRole), "ADMIN") : ssrLooseEqual(unref(inviteRole), "ADMIN")) ? " selected" : ""}>Admin — Full access including settings &amp; AI config</option></select></div>`);
          if (unref(inviteLink)) {
            _push2(`<div class="animate-fade-in p-4 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-xl"><p class="text-emerald-300 text-sm font-medium mb-2">Invite link generated!</p><div class="flex items-center gap-2"><input${ssrRenderAttr("value", unref(inviteLink))} readonly class="input-glass text-xs flex-1 text-white/60"><button type="button" class="p-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors flex-shrink-0" title="Copy link"><svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg></button></div><p class="text-white/30 text-xs mt-2">Share this link with your team member. It expires in 7 days.</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<button type="submit"${ssrIncludeBooleanAttr(unref(sendingInvite) || !unref(inviteEmail).trim()) ? " disabled" : ""} class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">`);
          if (unref(sendingInvite)) {
            _push2(`<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate(unref(sendingInvite) ? "Sending..." : "Send Invitation")}</button></form></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      if (unref(pending)) {
        _push(`<div class="flex items-center justify-center py-24"><div class="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div></div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-8 text-center"><p class="text-red-300">Failed to load team data.</p><button class="btn-primary mt-4 text-sm">Retry</button></div>`);
      } else {
        _push(`<!--[-->`);
        if (unref(isAdmin) && unref(pendingInvitations).length > 0) {
          _push(`<div><h3 class="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2"><svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> Pending Invitations (${ssrInterpolate(unref(pendingInvitations).length)}) </h3><div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(pendingInvitations), (inv) => {
            _push(`<div class="flex items-center justify-between px-4 py-3 bg-amber-500/[0.04] border border-amber-500/10 rounded-xl"><div class="flex items-center gap-3 min-w-0"><div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div><div class="min-w-0"><p class="text-white/80 text-sm truncate">${ssrInterpolate(inv.email)}</p><p class="text-white/30 text-xs">${ssrInterpolate(inv.role)} · Invited by ${ssrInterpolate(inv.invitedBy.fullName)} · <span class="${ssrRenderClass(isExpired(inv.expiresAt) ? "text-red-400" : "")}">${ssrInterpolate(isExpired(inv.expiresAt) ? "Expired" : `Expires ${fmtDate(inv.expiresAt)}`)}</span></p></div></div><button${ssrIncludeBooleanAttr(unref(revokingId) === inv.id) ? " disabled" : ""} class="p-2 rounded-lg hover:bg-white/[0.06] transition-colors flex-shrink-0" title="Revoke invitation">`);
            if (unref(revokingId) === inv.id) {
              _push(`<svg class="w-4 h-4 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`);
            } else {
              _push(`<svg class="w-4 h-4 text-red-400/60 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`);
            }
            _push(`</button></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div><h3 class="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Members</h3><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(members), (member) => {
          _push(ssrRenderComponent(_component_UiGlassCard, {
            key: member.id,
            padding: "md",
            hover: true
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-center gap-4 flex-wrap sm:flex-nowrap"${_scopeId}><div class="${ssrRenderClass([member.isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-white/[0.06] text-white/30", "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0"])}"${_scopeId}>${ssrInterpolate(member.fullName?.charAt(0)?.toUpperCase() ?? "?")}</div><div class="flex-1 min-w-0"${_scopeId}><div class="flex items-center gap-2 flex-wrap"${_scopeId}><span class="${ssrRenderClass([{ "opacity-50": !member.isActive }, "text-white font-semibold truncate"])}"${_scopeId}>${ssrInterpolate(member.fullName)}</span><span class="${ssrRenderClass([member.role === "ADMIN" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30", "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold"])}"${_scopeId}>${ssrInterpolate(member.role)}</span>`);
                if (!member.isActive) {
                  _push2(`<span class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30"${_scopeId}> Inactive </span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><p class="text-white/40 text-sm truncate"${_scopeId}>${ssrInterpolate(member.email)}</p><p class="text-white/30 text-xs mt-0.5"${_scopeId}>Joined ${ssrInterpolate(fmtDate(member.createdAt))}</p></div><div class="flex items-center gap-4 text-center"${_scopeId}><div${_scopeId}><p class="text-white font-semibold"${_scopeId}>${ssrInterpolate(member.assignedTickets)}</p><p class="text-white/30 text-[10px] uppercase tracking-wider"${_scopeId}>Assigned</p></div><div${_scopeId}><p class="text-emerald-400 font-semibold"${_scopeId}>${ssrInterpolate(member.resolvedTickets)}</p><p class="text-white/30 text-[10px] uppercase tracking-wider"${_scopeId}>Resolved</p></div></div>`);
                if (unref(isAdmin)) {
                  _push2(`<div class="flex items-center gap-2 flex-shrink-0"${_scopeId}><button class="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"${ssrIncludeBooleanAttr(unref(updatingId) === member.id) ? " disabled" : ""}${ssrRenderAttr("title", member.role === "ADMIN" ? "Demote to Agent" : "Promote to Admin")}${_scopeId}>`);
                  if (unref(updatingId) === member.id) {
                    _push2(`<svg class="w-4 h-4 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"${_scopeId}></path></svg>`);
                  } else {
                    _push2(`<svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", member.role === "ADMIN" ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7")}${_scopeId}></path></svg>`);
                  }
                  _push2(`</button><button class="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"${ssrIncludeBooleanAttr(unref(updatingId) === member.id) ? " disabled" : ""}${ssrRenderAttr("title", member.isActive ? "Deactivate" : "Activate")}${_scopeId}><svg class="${ssrRenderClass([member.isActive ? "text-emerald-400" : "text-red-400", "w-4 h-4"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", member.isActive ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636")}${_scopeId}></path></svg></button></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-center gap-4 flex-wrap sm:flex-nowrap" }, [
                    createVNode("div", {
                      class: ["w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0", member.isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-white/[0.06] text-white/30"]
                    }, toDisplayString(member.fullName?.charAt(0)?.toUpperCase() ?? "?"), 3),
                    createVNode("div", { class: "flex-1 min-w-0" }, [
                      createVNode("div", { class: "flex items-center gap-2 flex-wrap" }, [
                        createVNode("span", {
                          class: ["text-white font-semibold truncate", { "opacity-50": !member.isActive }]
                        }, toDisplayString(member.fullName), 3),
                        createVNode("span", {
                          class: ["px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold", member.role === "ADMIN" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"]
                        }, toDisplayString(member.role), 3),
                        !member.isActive ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30"
                        }, " Inactive ")) : createCommentVNode("", true)
                      ]),
                      createVNode("p", { class: "text-white/40 text-sm truncate" }, toDisplayString(member.email), 1),
                      createVNode("p", { class: "text-white/30 text-xs mt-0.5" }, "Joined " + toDisplayString(fmtDate(member.createdAt)), 1)
                    ]),
                    createVNode("div", { class: "flex items-center gap-4 text-center" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "text-white font-semibold" }, toDisplayString(member.assignedTickets), 1),
                        createVNode("p", { class: "text-white/30 text-[10px] uppercase tracking-wider" }, "Assigned")
                      ]),
                      createVNode("div", null, [
                        createVNode("p", { class: "text-emerald-400 font-semibold" }, toDisplayString(member.resolvedTickets), 1),
                        createVNode("p", { class: "text-white/30 text-[10px] uppercase tracking-wider" }, "Resolved")
                      ])
                    ]),
                    unref(isAdmin) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "flex items-center gap-2 flex-shrink-0"
                    }, [
                      createVNode("button", {
                        onClick: ($event) => toggleRole(member),
                        class: "p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors",
                        disabled: unref(updatingId) === member.id,
                        title: member.role === "ADMIN" ? "Demote to Agent" : "Promote to Admin"
                      }, [
                        unref(updatingId) === member.id ? (openBlock(), createBlock("svg", {
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
                          class: "w-4 h-4 text-white/50",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: member.role === "ADMIN" ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"
                          }, null, 8, ["d"])
                        ]))
                      ], 8, ["onClick", "disabled", "title"]),
                      createVNode("button", {
                        onClick: ($event) => toggleActive(member),
                        class: "p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors",
                        disabled: unref(updatingId) === member.id,
                        title: member.isActive ? "Deactivate" : "Activate"
                      }, [
                        (openBlock(), createBlock("svg", {
                          class: ["w-4 h-4", member.isActive ? "text-emerald-400" : "text-red-400"],
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: member.isActive ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          }, null, 8, ["d"])
                        ], 2))
                      ], 8, ["onClick", "disabled", "title"])
                    ])) : createCommentVNode("", true)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]-->`);
        if (unref(members).length === 0) {
          _push(`<div class="glass-card p-12 text-center"><svg class="w-12 h-12 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><p class="text-white/40">No team members found</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/team.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=team-Cq0Crxor.mjs.map
