import { defineComponent, computed, createVNode, resolveDynamicComponent, mergeProps, unref, withCtx, renderSlot, useSSRContext } from 'vue';
import { ssrRenderVNode, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "GlassCard",
  __ssrInlineRender: true,
  props: {
    variant: { default: "default" },
    padding: { default: "md" },
    hover: { type: Boolean, default: false },
    as: { default: "div" }
  },
  setup(__props) {
    const props = __props;
    const variantClasses = computed(() => ({
      default: "bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-glass",
      heavy: "bg-white/[0.1] backdrop-blur-xl border border-white/[0.12] rounded-2xl shadow-glass-lg",
      subtle: "bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl shadow-glass-sm"
    })[props.variant]);
    const paddingClasses = computed(() => ({
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8"
    })[props.padding]);
    const hoverClasses = computed(
      () => props.hover ? "transition-all duration-300 hover:bg-white/15 hover:shadow-glass-lg hover:-translate-y-0.5 cursor-pointer" : ""
    );
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(__props.as), mergeProps({
        class: [unref(variantClasses), unref(paddingClasses), unref(hoverClasses)]
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }), _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/GlassCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main, { __name: "UiGlassCard" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=GlassCard-C-gZz82T.mjs.map
