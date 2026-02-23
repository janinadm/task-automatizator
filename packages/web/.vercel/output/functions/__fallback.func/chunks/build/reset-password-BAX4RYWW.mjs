import { _ as __nuxt_component_1 } from './GlassCard-C-gZz82T.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-CyRG7-rc.mjs';
import { defineComponent, ref, mergeProps, withCtx, unref, createTextVNode, createVNode, openBlock, createBlock, toDisplayString, withModifiers, withDirectives, isRef, vModelText, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useSupabaseClient } from './useSupabaseClient-DxYTVa8G.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "reset-password",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const email = ref("");
    const sent = ref(false);
    const isLoading = ref(false);
    const error = ref(null);
    async function handleReset() {
      if (!email.value) return;
      isLoading.value = true;
      error.value = null;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
        redirectTo: `${(void 0).location.origin}/confirm`
      });
      if (resetError) {
        error.value = resetError.message;
      } else {
        sent.value = true;
      }
      isLoading.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiGlassCard = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(ssrRenderComponent(_component_UiGlassCard, mergeProps({ padding: "lg" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="text-2xl font-bold text-white mb-2"${_scopeId}>Reset password</h2><p class="text-white/60 text-sm mb-8"${_scopeId}> Enter your email and we&#39;ll send you a reset link. </p>`);
            if (unref(sent)) {
              _push2(`<div class="text-center animate-fade-in"${_scopeId}><div class="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"${_scopeId}><svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"${_scopeId}></path></svg></div><p class="text-white font-semibold mb-1"${_scopeId}>Check your inbox</p><p class="text-white/50 text-sm"${_scopeId}>We sent a reset link to <strong${_scopeId}>${ssrInterpolate(unref(email))}</strong></p>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/login",
                class: "block mt-5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` \u2190 Back to Login `);
                  } else {
                    return [
                      createTextVNode(" \u2190 Back to Login ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<form class="space-y-4"${_scopeId}><div${_scopeId}><label class="block text-sm text-white/70 mb-1.5"${_scopeId}>Email address</label><input${ssrRenderAttr("value", unref(email))} type="email" placeholder="you@company.com" class="input-glass"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""}${_scopeId}></div>`);
              if (unref(error)) {
                _push2(`<div class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm"${_scopeId}>${ssrInterpolate(unref(error))}</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button type="submit"${ssrIncludeBooleanAttr(unref(isLoading) || !unref(email)) ? " disabled" : ""} class="btn-primary w-full flex items-center justify-center gap-2"${_scopeId}>`);
              if (unref(isLoading)) {
                _push2(`<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"${_scopeId}></path></svg>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(` ${ssrInterpolate(unref(isLoading) ? "Sending..." : "Send reset link")}</button>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/login",
                class: "block text-center text-white/40 hover:text-white/60 text-sm transition-colors"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` \u2190 Back to Login `);
                  } else {
                    return [
                      createTextVNode(" \u2190 Back to Login ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</form>`);
            }
          } else {
            return [
              createVNode("h2", { class: "text-2xl font-bold text-white mb-2" }, "Reset password"),
              createVNode("p", { class: "text-white/60 text-sm mb-8" }, " Enter your email and we'll send you a reset link. "),
              unref(sent) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "text-center animate-fade-in"
              }, [
                createVNode("div", { class: "w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center" }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-7 h-7 text-green-400",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    })
                  ]))
                ]),
                createVNode("p", { class: "text-white font-semibold mb-1" }, "Check your inbox"),
                createVNode("p", { class: "text-white/50 text-sm" }, [
                  createTextVNode("We sent a reset link to "),
                  createVNode("strong", null, toDisplayString(unref(email)), 1)
                ]),
                createVNode(_component_NuxtLink, {
                  to: "/login",
                  class: "block mt-5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" \u2190 Back to Login ")
                  ]),
                  _: 1
                })
              ])) : (openBlock(), createBlock("form", {
                key: 1,
                class: "space-y-4",
                onSubmit: withModifiers(handleReset, ["prevent"])
              }, [
                createVNode("div", null, [
                  createVNode("label", { class: "block text-sm text-white/70 mb-1.5" }, "Email address"),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
                    type: "email",
                    placeholder: "you@company.com",
                    class: "input-glass",
                    disabled: unref(isLoading)
                  }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                    [vModelText, unref(email)]
                  ])
                ]),
                unref(error) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm"
                }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                createVNode("button", {
                  type: "submit",
                  disabled: unref(isLoading) || !unref(email),
                  class: "btn-primary w-full flex items-center justify-center gap-2"
                }, [
                  unref(isLoading) ? (openBlock(), createBlock("svg", {
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
                  ])) : createCommentVNode("", true),
                  createTextVNode(" " + toDisplayString(unref(isLoading) ? "Sending..." : "Send reset link"), 1)
                ], 8, ["disabled"]),
                createVNode(_component_NuxtLink, {
                  to: "/login",
                  class: "block text-center text-white/40 hover:text-white/60 text-sm transition-colors"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" \u2190 Back to Login ")
                  ]),
                  _: 1
                })
              ], 32))
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reset-password.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reset-password-BAX4RYWW.mjs.map
