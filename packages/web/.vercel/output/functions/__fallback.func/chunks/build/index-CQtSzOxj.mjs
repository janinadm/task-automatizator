import { _ as __nuxt_component_0 } from './nuxt-link-CyRG7-rc.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { _ as _imports_0 } from './virtual_public-GXG8ACDz.mjs';
import { _ as _export_sfc } from './server.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const features = [
      {
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
        title: "AI-Powered Triage",
        desc: "Automatically classify tickets by sentiment, priority, and category using Gemini AI. Reduce manual sorting by 90%.",
        color: "from-indigo-500 to-purple-600",
        glow: "shadow-indigo-500/20"
      },
      {
        icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
        title: "Omnichannel Inbox",
        desc: "Unify WhatsApp, Email, Instagram, and web chat into a single real-time dashboard. Never miss a message.",
        color: "from-emerald-500 to-teal-600",
        glow: "shadow-emerald-500/20"
      },
      {
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        title: "Real-time Analytics",
        desc: "Track response times, SLA compliance, and team performance with live dashboards updated in real time.",
        color: "from-amber-500 to-orange-600",
        glow: "shadow-amber-500/20"
      },
      {
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
        title: "Team Collaboration",
        desc: "Assign tickets, manage roles, and collaborate in real time. Built for agencies with 5 to 500 agents.",
        color: "from-pink-500 to-rose-600",
        glow: "shadow-pink-500/20"
      },
      {
        icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
        title: "Enterprise Security",
        desc: "Row-level security, encrypted connections, and multi-tenant isolation. SOC 2 compliant architecture.",
        color: "from-cyan-500 to-blue-600",
        glow: "shadow-cyan-500/20"
      },
      {
        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
        title: "Smart Automation",
        desc: "Auto-assign tickets, trigger SLA alerts, and generate AI replies. Let your team focus on what matters.",
        color: "from-violet-500 to-purple-600",
        glow: "shadow-violet-500/20"
      }
    ];
    const stats = [
      { value: "60%", label: "Faster response time" },
      { value: "3x", label: "Agent productivity" },
      { value: "95%", label: "Customer satisfaction" },
      { value: "10k+", label: "Tickets / month" }
    ];
    const plans = [
      {
        name: "Free",
        price: "0",
        desc: "For small teams getting started",
        features: ["Up to 3 agents", "100 tickets/month", "AI triage", "Email channel", "Basic analytics"],
        cta: "Start Free",
        popular: false
      },
      {
        name: "Pro",
        price: "29",
        desc: "For growing agencies",
        features: ["Up to 25 agents", "Unlimited tickets", "All AI features", "All channels", "Advanced analytics", "Priority support", "Custom SLA rules"],
        cta: "Start Free Trial",
        popular: true
      },
      {
        name: "Enterprise",
        price: "99",
        desc: "For large organizations",
        features: ["Unlimited agents", "Unlimited tickets", "Custom AI models", "API access", "SSO / SAML", "Dedicated support", "Custom integrations", "SLA guarantee"],
        cta: "Contact Sales",
        popular: false
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#06050f] text-white overflow-hidden" }, _attrs))} data-v-b8db7baa><div class="fixed inset-0 pointer-events-none overflow-hidden" data-v-b8db7baa><div class="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[128px] animate-pulse-soft" data-v-b8db7baa></div><div class="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-soft" style="${ssrRenderStyle({ "animation-delay": "1s" })}" data-v-b8db7baa></div><div class="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-pink-600/[0.08] rounded-full blur-[150px] animate-pulse-soft" style="${ssrRenderStyle({ "animation-delay": "2s" })}" data-v-b8db7baa></div><div class="absolute inset-0 opacity-[0.03]" style="${ssrRenderStyle({ "background-image": "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", "background-size": "64px 64px" })}" data-v-b8db7baa></div></div><nav class="relative z-50 border-b border-white/[0.06]" data-v-b8db7baa><div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" data-v-b8db7baa>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center gap-3 group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", _imports_0)} alt="AuraDesk" class="w-10 h-10" data-v-b8db7baa${_scopeId}><span class="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent" data-v-b8db7baa${_scopeId}> AuraDesk </span>`);
          } else {
            return [
              createVNode("img", {
                src: _imports_0,
                alt: "AuraDesk",
                class: "w-10 h-10"
              }),
              createVNode("span", { class: "text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent" }, " AuraDesk ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="hidden md:flex items-center gap-8" data-v-b8db7baa><a href="#features" class="text-sm text-white/60 hover:text-white transition-colors" data-v-b8db7baa>Features</a><a href="#pricing" class="text-sm text-white/60 hover:text-white transition-colors" data-v-b8db7baa>Pricing</a>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "text-sm text-white/70 hover:text-white transition-colors font-medium"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Log in `);
          } else {
            return [
              createTextVNode(" Log in ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/signup",
        class: "px-5 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Get Started Free `);
          } else {
            return [
              createTextVNode(" Get Started Free ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex md:hidden items-center gap-3" data-v-b8db7baa>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "text-sm text-white/70"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Log in`);
          } else {
            return [
              createTextVNode("Log in")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/signup",
        class: "px-4 py-2 bg-indigo-500 rounded-xl text-sm font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Start Free `);
          } else {
            return [
              createTextVNode(" Start Free ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></nav><section class="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-36" data-v-b8db7baa><div class="grid lg:grid-cols-2 gap-16 items-center" data-v-b8db7baa><div class="animate-fade-in" data-v-b8db7baa><div class="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium" data-v-b8db7baa><span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" data-v-b8db7baa></span> Powered by Gemini AI </div><h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight" data-v-b8db7baa><span class="block text-white" data-v-b8db7baa>Customer support</span><span class="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" data-v-b8db7baa> on autopilot. </span></h1><p class="mt-6 text-lg text-white/55 leading-relaxed max-w-lg" data-v-b8db7baa> AI-powered triage that classifies, prioritizes, and drafts replies for every ticket \u2014 across WhatsApp, Email, Instagram, and web. Your agents handle only what matters. </p><div class="mt-10 flex flex-wrap gap-4" data-v-b8db7baa>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/signup",
        class: "group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white font-semibold transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="relative z-10" data-v-b8db7baa${_scopeId}>Start Free \u2014 No card needed</span><div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-v-b8db7baa${_scopeId}></div>`);
          } else {
            return [
              createVNode("span", { class: "relative z-10" }, "Start Free \u2014 No card needed"),
              createVNode("div", { class: "absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<a href="#features" class="px-8 py-4 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-sm border border-white/[0.08] rounded-2xl text-white/80 font-medium transition-all duration-300 hover:-translate-y-0.5" data-v-b8db7baa> See how it works </a></div><div class="mt-12 flex items-center gap-4" data-v-b8db7baa><div class="flex -space-x-2" data-v-b8db7baa><!--[-->`);
      ssrRenderList(["from-indigo-400 to-blue-500", "from-emerald-400 to-teal-500", "from-amber-400 to-orange-500", "from-pink-400 to-rose-500"], (gradient, i) => {
        _push(`<div class="${ssrRenderClass([`bg-gradient-to-br ${gradient}`, "w-8 h-8 rounded-full border-2 border-[#06050f] flex items-center justify-center text-[10px] font-bold"])}" data-v-b8db7baa>${ssrInterpolate(["M", "S", "J", "A"][i])}</div>`);
      });
      _push(`<!--]--></div><div data-v-b8db7baa><div class="flex items-center gap-1" data-v-b8db7baa><!--[-->`);
      ssrRenderList(5, (i) => {
        _push(`<svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" data-v-b8db7baa><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" data-v-b8db7baa></path></svg>`);
      });
      _push(`<!--]--></div><p class="text-white/40 text-xs mt-0.5" data-v-b8db7baa>Loved by 500+ agencies worldwide</p></div></div></div><div class="hidden lg:block animate-slide-up" style="${ssrRenderStyle({ "animation-delay": "0.2s" })}" data-v-b8db7baa><div class="relative" data-v-b8db7baa><div class="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-pink-500/20 rounded-3xl blur-2xl" data-v-b8db7baa></div><div class="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl" data-v-b8db7baa><div class="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]" data-v-b8db7baa><div class="w-3 h-3 rounded-full bg-red-500/60" data-v-b8db7baa></div><div class="w-3 h-3 rounded-full bg-amber-500/60" data-v-b8db7baa></div><div class="w-3 h-3 rounded-full bg-green-500/60" data-v-b8db7baa></div><div class="flex-1 mx-4 h-5 rounded-md bg-white/[0.04] flex items-center px-3" data-v-b8db7baa><span class="text-[10px] text-white/30" data-v-b8db7baa>app.agencytask.ai/dashboard</span></div></div><div class="p-5 space-y-4" data-v-b8db7baa><div class="grid grid-cols-3 gap-3" data-v-b8db7baa><!--[-->`);
      ssrRenderList([{ v: "247", l: "Open Tickets", c: "text-blue-400" }, { v: "12m", l: "Avg. Response", c: "text-emerald-400" }, { v: "94%", l: "AI Accuracy", c: "text-purple-400" }], (kpi, i) => {
        _push(`<div class="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]" data-v-b8db7baa><p class="${ssrRenderClass([kpi.c, "text-lg font-bold"])}" data-v-b8db7baa>${ssrInterpolate(kpi.v)}</p><p class="text-[10px] text-white/40 mt-0.5" data-v-b8db7baa>${ssrInterpolate(kpi.l)}</p></div>`);
      });
      _push(`<!--]--></div><div class="space-y-2" data-v-b8db7baa><!--[-->`);
      ssrRenderList([
        { subj: "Payment not processed", badge: "Urgent", bc: "bg-red-500/20 text-red-300", sent: "\u{1F621}", ch: "\u2709\uFE0F" },
        { subj: "How to integrate Slack?", badge: "Medium", bc: "bg-amber-500/20 text-amber-300", sent: "\u{1F610}", ch: "\u{1F4AC}" },
        { subj: "Great onboarding experience!", badge: "Low", bc: "bg-green-500/20 text-green-300", sent: "\u{1F60A}", ch: "\u{1F310}" }
      ], (t, i) => {
        _push(`<div class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors" data-v-b8db7baa><div class="flex-1 min-w-0" data-v-b8db7baa><p class="text-xs text-white/80 font-medium truncate" data-v-b8db7baa>${ssrInterpolate(t.subj)}</p><p class="text-[10px] text-white/30 mt-0.5" data-v-b8db7baa>Customer \xB7 2m ago</p></div><span class="text-xs" data-v-b8db7baa>${ssrInterpolate(t.sent)}</span><span class="text-xs" data-v-b8db7baa>${ssrInterpolate(t.ch)}</span><span class="${ssrRenderClass([t.bc, "px-2 py-0.5 rounded-full text-[9px] font-medium"])}" data-v-b8db7baa>${ssrInterpolate(t.badge)}</span></div>`);
      });
      _push(`<!--]--></div><div class="p-3 rounded-xl bg-purple-500/[0.08] border border-purple-500/15" data-v-b8db7baa><div class="flex items-center gap-2 mb-2" data-v-b8db7baa><svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b8db7baa><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" data-v-b8db7baa></path></svg><span class="text-[10px] text-purple-300 font-medium" data-v-b8db7baa>AI Suggested Reply</span><span class="ml-auto px-1.5 py-0.5 rounded-full bg-purple-500/20 text-[8px] text-purple-300" data-v-b8db7baa>98% confidence</span></div><p class="text-[10px] text-white/50 leading-relaxed" data-v-b8db7baa>Hi there! I understand your frustration with the payment issue. I&#39;ve escalated this to our billing team...</p></div></div></div><div class="absolute -right-6 top-12 animate-slide-in-right" style="${ssrRenderStyle({ "animation-delay": "0.8s" })}" data-v-b8db7baa><div class="px-4 py-3 bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-xl w-48" data-v-b8db7baa><div class="flex items-center gap-2" data-v-b8db7baa><div class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center" data-v-b8db7baa><svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b8db7baa><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-v-b8db7baa></path></svg></div><div data-v-b8db7baa><p class="text-[10px] text-white/80 font-medium" data-v-b8db7baa>AI Analysis Done</p><p class="text-[8px] text-white/30" data-v-b8db7baa>Sentiment: Negative</p></div></div></div></div><div class="absolute -left-8 bottom-16 animate-fade-in" style="${ssrRenderStyle({ "animation-delay": "1.2s" })}" data-v-b8db7baa><div class="px-4 py-3 bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-xl" data-v-b8db7baa><div class="flex items-center gap-3" data-v-b8db7baa><div class="text-2xl" data-v-b8db7baa>\u{1F60A}</div><div data-v-b8db7baa><p class="text-[10px] text-white/80 font-medium" data-v-b8db7baa>Sentiment Score</p><div class="flex items-center gap-1.5 mt-1" data-v-b8db7baa><div class="w-20 h-1.5 rounded-full bg-white/10" data-v-b8db7baa><div class="w-[85%] h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400" data-v-b8db7baa></div></div><span class="text-[9px] text-emerald-400 font-bold" data-v-b8db7baa>85%</span></div></div></div></div></div></div></div></div></section><section class="relative z-10 border-y border-white/[0.06] bg-white/[0.015] backdrop-blur-sm" data-v-b8db7baa><div class="max-w-7xl mx-auto px-6 py-12" data-v-b8db7baa><div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" data-v-b8db7baa><!--[-->`);
      ssrRenderList(stats, (stat) => {
        _push(`<div data-v-b8db7baa><p class="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent" data-v-b8db7baa>${ssrInterpolate(stat.value)}</p><p class="text-sm text-white/40 mt-1" data-v-b8db7baa>${ssrInterpolate(stat.label)}</p></div>`);
      });
      _push(`<!--]--></div></div></section><section id="features" class="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32" data-v-b8db7baa><div class="text-center max-w-2xl mx-auto mb-16" data-v-b8db7baa><p class="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3" data-v-b8db7baa>Features</p><h2 class="text-3xl sm:text-4xl font-extrabold text-white" data-v-b8db7baa>Everything your team needs</h2><p class="text-white/45 mt-4 leading-relaxed" data-v-b8db7baa> From AI-powered classification to real-time collaboration \u2014 built for agencies that take customer experience seriously. </p></div><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-v-b8db7baa><!--[-->`);
      ssrRenderList(features, (f, i) => {
        _push(`<div class="${ssrRenderClass([f.glow, "group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-500 hover:-translate-y-1"])}" data-v-b8db7baa><div class="${ssrRenderClass([f.color, "w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg"])}" data-v-b8db7baa><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b8db7baa><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", f.icon)} data-v-b8db7baa></path></svg></div><h3 class="text-white font-semibold text-lg mb-2" data-v-b8db7baa>${ssrInterpolate(f.title)}</h3><p class="text-white/40 text-sm leading-relaxed" data-v-b8db7baa>${ssrInterpolate(f.desc)}</p><div class="${ssrRenderClass([`bg-gradient-to-br ${f.color}`, "absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl -z-10"])}" style="${ssrRenderStyle({ "filter": "brightness(0.3)" })}" data-v-b8db7baa></div></div>`);
      });
      _push(`<!--]--></div></section><section class="relative z-10 max-w-7xl mx-auto px-6 py-24" data-v-b8db7baa><div class="text-center max-w-2xl mx-auto mb-16" data-v-b8db7baa><p class="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3" data-v-b8db7baa>How it works</p><h2 class="text-3xl sm:text-4xl font-extrabold text-white" data-v-b8db7baa>Three steps to automated support</h2></div><div class="grid md:grid-cols-3 gap-8 relative" data-v-b8db7baa><div class="hidden md:block absolute top-14 left-[16%] right-[16%] h-px bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30" data-v-b8db7baa></div><!--[-->`);
      ssrRenderList([
        { num: "01", title: "Connect your channels", desc: "Link WhatsApp, Email, Instagram or your web form. Tickets flow in automatically.", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
        { num: "02", title: "AI analyzes everything", desc: "Gemini AI classifies sentiment, priority, category and drafts a reply \u2014 in seconds.", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
        { num: "03", title: "Your team takes over", desc: "Agents see enriched tickets with AI suggestions. One click to reply, resolve, or escalate.", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
      ], (step, i) => {
        _push(`<div class="relative text-center group" data-v-b8db7baa><div class="w-14 h-14 rounded-2xl mx-auto mb-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300" data-v-b8db7baa><svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b8db7baa><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", step.icon)} data-v-b8db7baa></path></svg></div><p class="text-indigo-400/50 text-xs font-bold uppercase tracking-widest mb-2" data-v-b8db7baa>Step ${ssrInterpolate(step.num)}</p><h3 class="text-white font-semibold text-lg mb-2" data-v-b8db7baa>${ssrInterpolate(step.title)}</h3><p class="text-white/40 text-sm leading-relaxed max-w-xs mx-auto" data-v-b8db7baa>${ssrInterpolate(step.desc)}</p></div>`);
      });
      _push(`<!--]--></div></section><section id="pricing" class="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32" data-v-b8db7baa><div class="text-center max-w-2xl mx-auto mb-16" data-v-b8db7baa><p class="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3" data-v-b8db7baa>Pricing</p><h2 class="text-3xl sm:text-4xl font-extrabold text-white" data-v-b8db7baa>Simple, transparent pricing</h2><p class="text-white/45 mt-4" data-v-b8db7baa>Start free. Upgrade when you&#39;re ready. No hidden fees.</p></div><div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" data-v-b8db7baa><!--[-->`);
      ssrRenderList(plans, (plan) => {
        _push(`<div class="${ssrRenderClass([plan.popular ? "bg-gradient-to-b from-indigo-500/[0.08] to-purple-500/[0.04] border-indigo-500/30 shadow-xl shadow-indigo-500/10" : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.1]", "relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1"])}" data-v-b8db7baa>`);
        if (plan.popular) {
          _push(`<div class="absolute -top-3 left-1/2 -translate-x-1/2" data-v-b8db7baa><span class="px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg" data-v-b8db7baa> Most Popular </span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<h3 class="text-white font-bold text-lg" data-v-b8db7baa>${ssrInterpolate(plan.name)}</h3><p class="text-white/40 text-sm mt-1" data-v-b8db7baa>${ssrInterpolate(plan.desc)}</p><div class="mt-6 mb-6" data-v-b8db7baa><span class="text-4xl font-extrabold text-white" data-v-b8db7baa>$${ssrInterpolate(plan.price)}</span><span class="text-white/40 text-sm" data-v-b8db7baa>/agent/mo</span></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/signup",
          class: ["block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300", plan.popular ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5" : "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]"]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(plan.cta)}`);
            } else {
              return [
                createTextVNode(toDisplayString(plan.cta), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`<ul class="mt-6 space-y-3" data-v-b8db7baa><!--[-->`);
        ssrRenderList(plan.features, (feat) => {
          _push(`<li class="flex items-center gap-2.5 text-sm text-white/55" data-v-b8db7baa><svg class="${ssrRenderClass([plan.popular ? "text-indigo-400" : "text-white/30", "w-4 h-4 flex-shrink-0"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b8db7baa><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-v-b8db7baa></path></svg> ${ssrInterpolate(feat)}</li>`);
        });
        _push(`<!--]--></ul></div>`);
      });
      _push(`<!--]--></div></section><section class="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center" data-v-b8db7baa><div class="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-indigo-500/[0.1] to-purple-500/[0.05] border border-indigo-500/20 overflow-hidden" data-v-b8db7baa><div class="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 blur-3xl" data-v-b8db7baa></div><div class="relative" data-v-b8db7baa><h2 class="text-3xl sm:text-4xl font-extrabold text-white mb-4" data-v-b8db7baa> Ready to transform your support? </h2><p class="text-white/50 max-w-xl mx-auto mb-8" data-v-b8db7baa> Join 500+ agencies using AI to deliver faster, smarter customer service. Set up in 2 minutes \u2014 no credit card required. </p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/signup",
        class: "inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-2xl text-white font-semibold transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Get Started Free <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b8db7baa${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" data-v-b8db7baa${_scopeId}></path></svg>`);
          } else {
            return [
              createTextVNode(" Get Started Free "),
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
                  d: "M13 7l5 5m0 0l-5 5m5-5H6"
                })
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></section><footer class="relative z-10 border-t border-white/[0.06] bg-white/[0.01]" data-v-b8db7baa><div class="max-w-7xl mx-auto px-6 py-12" data-v-b8db7baa><div class="flex flex-col md:flex-row items-center justify-between gap-6" data-v-b8db7baa><div class="flex items-center gap-3" data-v-b8db7baa><img${ssrRenderAttr("src", _imports_0)} alt="AuraDesk" class="w-8 h-8" data-v-b8db7baa><span class="text-sm text-white/40" data-v-b8db7baa>AuraDesk</span></div><p class="text-xs text-white/25" data-v-b8db7baa>\xA9 2026 Janina Dorobantu. All rights reserved.</p></div></div></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b8db7baa"]]);

export { index as default };
//# sourceMappingURL=index-CQtSzOxj.mjs.map
