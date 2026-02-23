import { _ as __nuxt_component_0 } from './nuxt-link-CyRG7-rc.mjs';
import { defineComponent, computed, ref, withAsyncContext, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderDynamicModel, ssrRenderList } from 'vue/server-renderer';
import { u as useSupabaseClient } from './useSupabaseClient-DxYTVa8G.mjs';
import { a as useRouter, b as useRoute } from './server.mjs';
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
  __name: "signup",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d, _e, _f;
    let __temp, __restore;
    useSupabaseClient();
    useRouter();
    const route = useRoute();
    const inviteToken = computed(() => {
      var _a2;
      return String((_a2 = route.query.invite) != null ? _a2 : "");
    });
    const inviteData = ref(null);
    const inviteError = ref(null);
    if (inviteToken.value) {
      try {
        const res = ([__temp, __restore] = withAsyncContext(() => $fetch(`/api/auth/invite?token=${inviteToken.value}`)), __temp = await __temp, __restore(), __temp);
        inviteData.value = res.data;
      } catch (e) {
        inviteError.value = (_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) != null ? _b : "Invalid invitation link";
      }
    }
    const fullName = ref("");
    const organizationName = ref((_d = (_c = inviteData.value) == null ? void 0 : _c.orgName) != null ? _d : "");
    const email = ref((_f = (_e = inviteData.value) == null ? void 0 : _e.email) != null ? _f : "");
    const password = ref("");
    const confirmPassword = ref("");
    const showPassword = ref(false);
    const isLoading = ref(false);
    const error = ref(null);
    const successMessage = ref(null);
    const passwordStrength = computed(() => {
      if (!password.value) return 0;
      let score = 0;
      if (password.value.length >= 8) score++;
      if (/[A-Z]/.test(password.value)) score++;
      if (/[0-9]/.test(password.value)) score++;
      if (/[^A-Za-z0-9]/.test(password.value)) score++;
      return score;
    });
    const strengthLabel = computed(() => {
      const labels = ["", "Weak", "Fair", "Good", "Strong"];
      return labels[passwordStrength.value];
    });
    const strengthColor = computed(() => {
      var _a2;
      const colors = ["", "bg-red-500", "bg-amber-500", "bg-indigo-500", "bg-green-500"];
      return (_a2 = colors[passwordStrength.value]) != null ? _a2 : "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="mb-8"><h2 class="text-2xl font-extrabold text-white">${ssrInterpolate(unref(inviteData) ? "Join your team" : "Create your workspace")}</h2><p class="text-white/50 text-sm mt-2">${ssrInterpolate(unref(inviteData) ? `You've been invited to join ${unref(inviteData).orgName}` : "Set up your agency's AI-powered support hub")}</p></div>`);
      if (unref(inviteError)) {
        _push(`<div class="mb-6 p-4 bg-red-500/[0.08] border border-red-500/15 rounded-2xl text-red-300 text-sm text-center animate-fade-in">${ssrInterpolate(unref(inviteError))} `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/signup",
          class: "block mt-3 text-white font-semibold underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Sign up without invitation `);
            } else {
              return [
                createTextVNode(" Sign up without invitation ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(inviteData) && !unref(inviteError)) {
        _push(`<div class="mb-6 p-4 bg-indigo-500/[0.08] border border-indigo-500/15 rounded-2xl animate-fade-in"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0"><svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div><div><p class="text-indigo-300 text-sm font-medium">Joining ${ssrInterpolate(unref(inviteData).orgName)}</p><p class="text-white/40 text-xs">Invited by ${ssrInterpolate(unref(inviteData).invitedBy)} as ${ssrInterpolate(unref(inviteData).role)}</p></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(successMessage)) {
        _push(`<div class="p-5 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-2xl text-emerald-300 text-sm text-center animate-fade-in">${ssrInterpolate(unref(successMessage))} `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "block mt-4 text-white font-semibold underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Login `);
            } else {
              return [
                createTextVNode(" Back to Login ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<form class="space-y-5"><div class="grid grid-cols-1 gap-4">`);
        if (!unref(inviteData)) {
          _push(`<div><label class="block text-sm text-white/60 mb-2 font-medium">Agency / Company name</label><input${ssrRenderAttr("value", unref(organizationName))} type="text" placeholder="Stellar Marketing Agency" class="input-glass"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""}></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div><label class="block text-sm text-white/60 mb-2 font-medium">Your full name</label><input${ssrRenderAttr("value", unref(fullName))} type="text" placeholder="Mar\xEDa Garc\xEDa" class="input-glass"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""}></div></div><div><label class="block text-sm text-white/60 mb-2 font-medium">Work email</label><input${ssrRenderAttr("value", unref(email))} type="email" autocomplete="email" placeholder="you@company.com"${ssrIncludeBooleanAttr(unref(isLoading) || !!unref(inviteData)) ? " disabled" : ""} class="${ssrRenderClass([{ "opacity-60": unref(inviteData) }, "input-glass"])}"></div><div><label class="block text-sm text-white/60 mb-2 font-medium">Password</label><div class="relative"><input${ssrRenderDynamicModel(unref(showPassword) ? "text" : "password", unref(password), null)}${ssrRenderAttr("type", unref(showPassword) ? "text" : "password")} autocomplete="new-password" placeholder="Min. 8 characters" class="input-glass pr-10"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""}><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", unref(showPassword) ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z")}></path></svg></button></div>`);
        if (unref(password)) {
          _push(`<div class="mt-2.5"><div class="flex gap-1"><!--[-->`);
          ssrRenderList(4, (i) => {
            _push(`<div class="${ssrRenderClass([i <= unref(passwordStrength) ? unref(strengthColor) : "bg-white/[0.06]", "h-1 flex-1 rounded-full transition-all duration-300"])}"></div>`);
          });
          _push(`<!--]--></div><p class="text-xs mt-1.5 text-white/40">${ssrInterpolate(unref(strengthLabel))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div><label class="block text-sm text-white/60 mb-2 font-medium">Confirm password</label><input${ssrRenderAttr("value", unref(confirmPassword))} type="password" autocomplete="new-password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" class="input-glass"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""}></div>`);
        if (unref(error)) {
          _push(`<div class="flex items-start gap-2.5 p-3.5 bg-red-500/[0.08] border border-red-500/15 rounded-xl text-red-300 text-sm animate-fade-in"><svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${ssrInterpolate(unref(error))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="text-white/30 text-xs leading-relaxed"> By creating an account you agree to our Terms of Service and Privacy Policy. </p><button type="submit"${ssrIncludeBooleanAttr(unref(isLoading) || !unref(email) || !unref(password) || !unref(fullName) || !unref(inviteData) && !unref(organizationName)) ? " disabled" : ""} class="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-indigo-500/25 flex items-center justify-center gap-2">`);
        if (unref(isLoading)) {
          _push(`<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(isLoading) ? "Setting up workspace..." : unref(inviteData) ? "Join team" : "Create free workspace")}</button></form>`);
      }
      _push(`<p class="text-center text-white/40 text-sm mt-8"> Already have an account? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Sign in `);
          } else {
            return [
              createTextVNode(" Sign in ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/signup.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=signup-DrMPqJqH.mjs.map
