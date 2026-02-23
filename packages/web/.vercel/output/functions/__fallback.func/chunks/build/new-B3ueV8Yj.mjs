import { _ as __nuxt_component_0 } from './nuxt-link-CyRG7-rc.mjs';
import { _ as __nuxt_component_1 } from './GlassCard-C-gZz82T.mjs';
import { defineComponent, reactive, ref, computed, mergeProps, withCtx, openBlock, createBlock, createVNode, unref, createTextVNode, withDirectives, vModelText, toDisplayString, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { a as useRouter } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "new",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    useToast();
    const form = reactive({
      subject: "",
      body: "",
      channel: "WEB",
      customerName: "",
      customerEmail: ""
    });
    const isSubmitting = ref(false);
    const error = ref(null);
    const channels = [
      { value: "WEB", label: "🌐 Web", description: "Web form or chat" },
      { value: "EMAIL", label: "✉️ Email", description: "Email message" },
      { value: "WHATSAPP", label: "💬 WhatsApp", description: "WhatsApp message" },
      { value: "SLACK", label: "⚡ Slack", description: "Slack message" }
    ];
    const isFormValid = computed(
      () => form.subject.trim().length > 0 && form.body.trim().length > 0
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiGlassCard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-3xl mx-auto animate-fade-in" }, _attrs))}><div class="flex items-center gap-3 mb-6">`);
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
      _push(`<h2 class="text-xl font-bold text-white">Create New Ticket</h2></div><form class="space-y-5">`);
      _push(ssrRenderComponent(_component_UiGlassCard, { padding: "md" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"${_scopeId}></path></svg> Ticket Details </h3><div class="space-y-4"${_scopeId}><div${_scopeId}><label class="block text-sm text-white/70 mb-1.5"${_scopeId}>Subject *</label><input${ssrRenderAttr("value", unref(form).subject)} type="text" placeholder="Brief description of the issue..." class="input-glass" maxlength="200"${ssrIncludeBooleanAttr(unref(isSubmitting)) ? " disabled" : ""}${_scopeId}><p class="text-white/30 text-xs mt-1"${_scopeId}>${ssrInterpolate(unref(form).subject.length)}/200</p></div><div${_scopeId}><label class="block text-sm text-white/70 mb-1.5"${_scopeId}>Message Body *</label><textarea rows="6" placeholder="Full description of the customer&#39;s issue, request, or question..." class="input-glass resize-none" maxlength="5000"${ssrIncludeBooleanAttr(unref(isSubmitting)) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(form).body)}</textarea><p class="text-white/30 text-xs mt-1"${_scopeId}>${ssrInterpolate(unref(form).body.length)}/5000</p></div></div>`);
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
                    d: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  })
                ])),
                createTextVNode(" Ticket Details ")
              ]),
              createVNode("div", { class: "space-y-4" }, [
                createVNode("div", null, [
                  createVNode("label", { class: "block text-sm text-white/70 mb-1.5" }, "Subject *"),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => unref(form).subject = $event,
                    type: "text",
                    placeholder: "Brief description of the issue...",
                    class: "input-glass",
                    maxlength: "200",
                    disabled: unref(isSubmitting)
                  }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                    [vModelText, unref(form).subject]
                  ]),
                  createVNode("p", { class: "text-white/30 text-xs mt-1" }, toDisplayString(unref(form).subject.length) + "/200", 1)
                ]),
                createVNode("div", null, [
                  createVNode("label", { class: "block text-sm text-white/70 mb-1.5" }, "Message Body *"),
                  withDirectives(createVNode("textarea", {
                    "onUpdate:modelValue": ($event) => unref(form).body = $event,
                    rows: "6",
                    placeholder: "Full description of the customer's issue, request, or question...",
                    class: "input-glass resize-none",
                    maxlength: "5000",
                    disabled: unref(isSubmitting)
                  }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                    [vModelText, unref(form).body]
                  ]),
                  createVNode("p", { class: "text-white/30 text-xs mt-1" }, toDisplayString(unref(form).body.length) + "/5000", 1)
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
            _push2(`<h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"${_scopeId}></path></svg> Channel </h3><div class="grid grid-cols-2 sm:grid-cols-4 gap-2"${_scopeId}><!--[-->`);
            ssrRenderList(channels, (ch) => {
              _push2(`<button type="button" class="${ssrRenderClass([unref(form).channel === ch.value ? "bg-indigo-500/20 border border-indigo-500/40 text-white" : "bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/[0.08]", "p-3 rounded-xl text-center transition-all duration-200 text-sm"])}"${_scopeId}><span class="text-lg block mb-1"${_scopeId}>${ssrInterpolate(ch.label.split(" ")[0])}</span><span class="text-xs"${_scopeId}>${ssrInterpolate(ch.label.split(" ").slice(1).join(" "))}</span></button>`);
            });
            _push2(`<!--]--></div>`);
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
                    d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  })
                ])),
                createTextVNode(" Channel ")
              ]),
              createVNode("div", { class: "grid grid-cols-2 sm:grid-cols-4 gap-2" }, [
                (openBlock(), createBlock(Fragment, null, renderList(channels, (ch) => {
                  return createVNode("button", {
                    key: ch.value,
                    type: "button",
                    class: ["p-3 rounded-xl text-center transition-all duration-200 text-sm", unref(form).channel === ch.value ? "bg-indigo-500/20 border border-indigo-500/40 text-white" : "bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/[0.08]"],
                    onClick: ($event) => unref(form).channel = ch.value
                  }, [
                    createVNode("span", { class: "text-lg block mb-1" }, toDisplayString(ch.label.split(" ")[0]), 1),
                    createVNode("span", { class: "text-xs" }, toDisplayString(ch.label.split(" ").slice(1).join(" ")), 1)
                  ], 10, ["onClick"]);
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
            _push2(`<h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2"${_scopeId}><svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"${_scopeId}></path></svg> Customer Information <span class="text-white/30 font-normal"${_scopeId}>(optional)</span></h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"${_scopeId}><div${_scopeId}><label class="block text-sm text-white/70 mb-1.5"${_scopeId}>Customer Name</label><input${ssrRenderAttr("value", unref(form).customerName)} type="text" placeholder="John Doe" class="input-glass"${ssrIncludeBooleanAttr(unref(isSubmitting)) ? " disabled" : ""}${_scopeId}></div><div${_scopeId}><label class="block text-sm text-white/70 mb-1.5"${_scopeId}>Customer Email</label><input${ssrRenderAttr("value", unref(form).customerEmail)} type="email" placeholder="john@example.com" class="input-glass"${ssrIncludeBooleanAttr(unref(isSubmitting)) ? " disabled" : ""}${_scopeId}></div></div>`);
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
                    d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  })
                ])),
                createTextVNode(" Customer Information "),
                createVNode("span", { class: "text-white/30 font-normal" }, "(optional)")
              ]),
              createVNode("div", { class: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, [
                createVNode("div", null, [
                  createVNode("label", { class: "block text-sm text-white/70 mb-1.5" }, "Customer Name"),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => unref(form).customerName = $event,
                    type: "text",
                    placeholder: "John Doe",
                    class: "input-glass",
                    disabled: unref(isSubmitting)
                  }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                    [vModelText, unref(form).customerName]
                  ])
                ]),
                createVNode("div", null, [
                  createVNode("label", { class: "block text-sm text-white/70 mb-1.5" }, "Customer Email"),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => unref(form).customerEmail = $event,
                    type: "email",
                    placeholder: "john@example.com",
                    class: "input-glass",
                    disabled: unref(isSubmitting)
                  }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                    [vModelText, unref(form).customerEmail]
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(error)) {
        _push(`<div class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-start gap-2"><svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-start gap-3 p-4 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl"><svg class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg><div><p class="text-purple-300 text-sm font-medium">AI will automatically analyze this ticket</p><p class="text-white/40 text-xs mt-1">Sentiment, priority, category, and a suggested reply will be generated in the background.</p></div></div><div class="flex items-center justify-end gap-3">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/dashboard/tickets",
        class: "btn-ghost text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Cancel `);
          } else {
            return [
              createTextVNode(" Cancel ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(isSubmitting) || !unref(isFormValid)) ? " disabled" : ""} class="btn-primary flex items-center gap-2">`);
      if (unref(isSubmitting)) {
        _push(`<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`);
      } else {
        _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>`);
      }
      _push(` ${ssrInterpolate(unref(isSubmitting) ? "Creating..." : "Create Ticket")}</button></div></form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/tickets/new.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=new-B3ueV8Yj.mjs.map
