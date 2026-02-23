import { _ as __nuxt_component_0 } from './nuxt-link-CyRG7-rc.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, openBlock, createBlock, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "confirm",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    useRouter();
    useRoute();
    const status = ref("loading");
    const message = ref("Verifying your account...");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center" }, _attrs))}>`);
      if (unref(status) === "loading") {
        _push(`<div class="animate-fade-in"><div class="w-20 h-20 mx-auto mb-8 relative"><div class="absolute inset-0 rounded-full border-[3px] border-white/[0.06]"></div><div class="absolute inset-0 rounded-full border-[3px] border-t-indigo-500 border-r-purple-500 animate-spin"></div><div class="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm"><svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div></div><h2 class="text-2xl font-extrabold text-white mb-2">Authenticating</h2><p class="text-white/50 text-sm">${ssrInterpolate(unref(message))}</p></div>`);
      } else if (unref(status) === "success") {
        _push(`<div class="animate-fade-in"><div class="w-20 h-20 mx-auto mb-8 rounded-full bg-emerald-500/[0.12] border border-emerald-500/20 flex items-center justify-center"><svg class="w-9 h-9 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div><h2 class="text-2xl font-extrabold text-white mb-2">You&#39;re in!</h2><p class="text-white/50 text-sm">${ssrInterpolate(unref(message))}</p><div class="mt-6 flex justify-center"><div class="flex gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style="${ssrRenderStyle({ "animation-delay": "0s" })}"></div><div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style="${ssrRenderStyle({ "animation-delay": "0.2s" })}"></div><div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style="${ssrRenderStyle({ "animation-delay": "0.4s" })}"></div></div></div></div>`);
      } else {
        _push(`<div class="animate-fade-in"><div class="w-20 h-20 mx-auto mb-8 rounded-full bg-red-500/[0.12] border border-red-500/20 flex items-center justify-center"><svg class="w-9 h-9 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div><h2 class="text-2xl font-extrabold text-white mb-2">Something went wrong</h2><p class="text-white/50 text-sm mb-8">${ssrInterpolate(unref(message))}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"${_scopeId}></path></svg> Back to Login `);
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
                    d: "M10 19l-7-7m0 0l7-7m-7 7h18"
                  })
                ])),
                createTextVNode(" Back to Login ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/confirm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=confirm-Dj1b59W0.mjs.map
