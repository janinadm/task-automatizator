<!--
  Landing Page — Marketing Homepage
  Route: /
  
  A premium, visually stunning landing page with glassmorphism design.
  Features: animated hero, feature cards, social proof, pricing, CTA.
  All visuals are CSS-only (gradients, blurs, SVGs) — no external images needed.
-->
<script setup lang="ts">
  definePageMeta({ layout: false })

  const features = [
    {
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      title: 'AI-Powered Triage',
      desc: 'Gemini AI classifies tickets by sentiment, priority, and category — then drafts a reply. Reduce manual sorting by 90%.',
      color: 'from-indigo-500 to-purple-600',
      glow: 'shadow-indigo-500/20',
    },
    {
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      title: 'Knowledge Base',
      desc: 'Create and organize help articles for your team and customers. Searchable, categorized, and always up to date.',
      color: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/20',
    },
    {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Real-time Analytics',
      desc: 'Track response times, SLA compliance, and team performance with live dashboards. Monitor KPIs at a glance.',
      color: 'from-amber-500 to-orange-600',
      glow: 'shadow-amber-500/20',
    },
    {
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      title: 'Team Collaboration',
      desc: 'Invite agents, manage roles, assign tickets, and share internal notes. Built for teams of any size.',
      color: 'from-pink-500 to-rose-600',
      glow: 'shadow-pink-500/20',
    },
    {
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      title: 'Canned Responses',
      desc: 'Save and reuse pre-written replies for common questions. One click to insert — speed up every conversation.',
      color: 'from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/20',
    },
    {
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      title: 'Smart Automation',
      desc: 'Auto-assign tickets by workload, enforce SLA deadlines, and trigger alerts. Let your team focus on what matters.',
      color: 'from-violet-500 to-purple-600',
      glow: 'shadow-violet-500/20',
    },
    {
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      title: 'Customer Portal',
      desc: 'Give your customers a branded portal to submit tickets and check status — no login required.',
      color: 'from-rose-500 to-red-600',
      glow: 'shadow-rose-500/20',
    },
    {
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      title: 'Tags & Bulk Actions',
      desc: 'Organize tickets with color-coded tags. Select multiple tickets for bulk assign, close, or tag operations.',
      color: 'from-teal-500 to-emerald-600',
      glow: 'shadow-teal-500/20',
    },
    {
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      title: 'Enterprise Security',
      desc: 'Row-level security, encrypted connections, and multi-tenant isolation. Your data stays yours.',
      color: 'from-slate-500 to-gray-600',
      glow: 'shadow-slate-500/20',
    },
  ]

  const stats = [
    { value: '60%', label: 'Faster response time' },
    { value: '3x', label: 'Agent productivity' },
    { value: '95%', label: 'Customer satisfaction' },
    { value: '10k+', label: 'Tickets / month' },
  ]

  const plans = [
    {
      name: 'Free',
      price: '0',
      desc: 'For small teams getting started',
      features: [
        'Up to 3 agents',
        '100 tickets/month',
        'AI triage & sentiment',
        'Knowledge Base',
        'Customer Portal',
        'Canned Responses',
        'Basic analytics',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Pro',
      price: '29',
      desc: 'For growing teams',
      features: [
        'Up to 25 agents',
        'Unlimited tickets',
        'All AI features',
        'Auto-assignment rules',
        'SLA Engine & alerts',
        'Internal Notes',
        'Tags & Bulk Actions',
        'Advanced analytics',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '99',
      desc: 'For large organizations',
      features: [
        'Unlimited agents',
        'Unlimited tickets',
        'Custom AI models',
        'API access',
        'SSO / SAML',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
        'Onboarding included',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]
</script>

<template>
  <div class="min-h-screen bg-[#06050f] text-white overflow-hidden">
    <!-- ═══════════════════════════════════════════════════════════
         BACKGROUND EFFECTS — Ambient glow orbs for depth
         ═══════════════════════════════════════════════════════════ -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <!-- Top-left orb -->
      <div
        class="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[128px] animate-pulse-soft"
      />
      <!-- Center-right orb -->
      <div
        class="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-soft"
        style="animation-delay: 1s"
      />
      <!-- Bottom orb -->
      <div
        class="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-pink-600/[0.08] rounded-full blur-[150px] animate-pulse-soft"
        style="animation-delay: 2s"
      />
      <!-- Grid pattern -->
      <div
        class="absolute inset-0 opacity-[0.03]"
        style="
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 64px 64px;
        "
      />
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         NAVIGATION
         ═══════════════════════════════════════════════════════════ -->
    <nav class="relative z-50 border-b border-white/[0.06]">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <img src="/logo.svg" alt="AuraDesk" class="w-10 h-10" />
          <span
            class="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
          >
            AuraDesk
          </span>
        </NuxtLink>

        <!-- Nav Links -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-sm text-white/60 hover:text-white transition-colors"
            >Features</a
          >
          <a href="#pricing" class="text-sm text-white/60 hover:text-white transition-colors"
            >Pricing</a
          >
          <NuxtLink
            to="/login"
            class="text-sm text-white/70 hover:text-white transition-colors font-medium"
          >
            Log in
          </NuxtLink>
          <NuxtLink
            to="/signup"
            class="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
          >
            Get Started Free
          </NuxtLink>
        </div>

        <!-- Mobile menu -->
        <div class="flex md:hidden items-center gap-3">
          <NuxtLink to="/login" class="text-sm text-white/70">Log in</NuxtLink>
          <NuxtLink to="/signup" class="px-4 py-2 bg-indigo-500 rounded-xl text-sm font-semibold">
            Start Free
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- ═══════════════════════════════════════════════════════════
         HERO SECTION
         ═══════════════════════════════════════════════════════════ -->
    <section class="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-36">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Left: Copy -->
        <div class="animate-fade-in">
          <!-- Badge -->
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Powered by Gemini AI
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            <span class="block text-white">Customer support</span>
            <span
              class="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              on autopilot.
            </span>
          </h1>

          <p class="mt-6 text-lg text-white/55 leading-relaxed max-w-lg">
            AI-powered triage that classifies, prioritizes, and drafts replies for every ticket.
            Knowledge Base, Customer Portal, SLA Engine, and smart automation — all in one platform.
          </p>

          <!-- CTA Buttons -->
          <div class="mt-10 flex flex-wrap gap-4">
            <NuxtLink
              to="/signup"
              class="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white font-semibold transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
            >
              <span class="relative z-10">Start Free — No card needed</span>
              <div
                class="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </NuxtLink>
            <a
              href="#features"
              class="px-8 py-4 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-sm border border-white/[0.08] rounded-2xl text-white/80 font-medium transition-all duration-300 hover:-translate-y-0.5"
            >
              See how it works
            </a>
          </div>

          <!-- Social proof mini -->
          <div class="mt-12 flex items-center gap-4">
            <!-- Avatar stack -->
            <div class="flex -space-x-2">
              <div
                v-for="(gradient, i) in [
                  'from-indigo-400 to-blue-500',
                  'from-emerald-400 to-teal-500',
                  'from-amber-400 to-orange-500',
                  'from-pink-400 to-rose-500',
                ]"
                :key="i"
                class="w-8 h-8 rounded-full border-2 border-[#06050f] flex items-center justify-center text-[10px] font-bold"
                :class="`bg-gradient-to-br ${gradient}`"
              >
                {{ ['M', 'S', 'J', 'A'][i] }}
              </div>
            </div>
            <div>
              <div class="flex items-center gap-1">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="w-3.5 h-3.5 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
              <p class="text-white/40 text-xs mt-0.5">Loved by 500+ agencies worldwide</p>
            </div>
          </div>
        </div>

        <!-- Right: Dashboard Preview (CSS art) -->
        <div class="hidden lg:block animate-slide-up" style="animation-delay: 0.2s">
          <div class="relative">
            <!-- Glow behind the "screenshot" -->
            <div
              class="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-pink-500/20 rounded-3xl blur-2xl"
            />

            <!-- Mock dashboard card -->
            <div
              class="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl"
            >
              <!-- Top bar -->
              <div
                class="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]"
              >
                <div class="w-3 h-3 rounded-full bg-red-500/60" />
                <div class="w-3 h-3 rounded-full bg-amber-500/60" />
                <div class="w-3 h-3 rounded-full bg-green-500/60" />
                <div class="flex-1 mx-4 h-5 rounded-md bg-white/[0.04] flex items-center px-3">
                  <span class="text-[10px] text-white/30">app.auradesk.io/dashboard</span>
                </div>
              </div>

              <!-- Mock content -->
              <div class="p-5 space-y-4">
                <!-- KPI row -->
                <div class="grid grid-cols-3 gap-3">
                  <div
                    v-for="(kpi, i) in [
                      { v: '247', l: 'Open Tickets', c: 'text-blue-400' },
                      { v: '12m', l: 'Avg. Response', c: 'text-emerald-400' },
                      { v: '94%', l: 'AI Accuracy', c: 'text-purple-400' },
                    ]"
                    :key="i"
                    class="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                  >
                    <p class="text-lg font-bold" :class="kpi.c">{{ kpi.v }}</p>
                    <p class="text-[10px] text-white/40 mt-0.5">{{ kpi.l }}</p>
                  </div>
                </div>

                <!-- Fake ticket rows -->
                <div class="space-y-2">
                  <div
                    v-for="(t, i) in [
                      {
                        subj: 'Payment not processed',
                        badge: 'Urgent',
                        bc: 'bg-red-500/20 text-red-300',
                        sent: '😡',
                        ch: '✉️',
                      },
                      {
                        subj: 'How to integrate Slack?',
                        badge: 'Medium',
                        bc: 'bg-amber-500/20 text-amber-300',
                        sent: '😐',
                        ch: '💬',
                      },
                      {
                        subj: 'Great onboarding experience!',
                        badge: 'Low',
                        bc: 'bg-green-500/20 text-green-300',
                        sent: '😊',
                        ch: '🌐',
                      },
                    ]"
                    :key="i"
                    class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-white/80 font-medium truncate">{{ t.subj }}</p>
                      <p class="text-[10px] text-white/30 mt-0.5">Customer · 2m ago</p>
                    </div>
                    <span class="text-xs">{{ t.sent }}</span>
                    <span class="text-xs">{{ t.ch }}</span>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-medium" :class="t.bc">{{
                      t.badge
                    }}</span>
                  </div>
                </div>

                <!-- AI suggestion preview -->
                <div class="p-3 rounded-xl bg-purple-500/[0.08] border border-purple-500/15">
                  <div class="flex items-center gap-2 mb-2">
                    <svg
                      class="w-3.5 h-3.5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span class="text-[10px] text-purple-300 font-medium">AI Suggested Reply</span>
                    <span
                      class="ml-auto px-1.5 py-0.5 rounded-full bg-purple-500/20 text-[8px] text-purple-300"
                      >98% confidence</span
                    >
                  </div>
                  <p class="text-[10px] text-white/50 leading-relaxed">
                    Hi there! I understand your frustration with the payment issue. I've escalated
                    this to our billing team...
                  </p>
                </div>
              </div>
            </div>

            <!-- Floating notification card -->
            <div
              class="absolute -right-6 top-12 animate-slide-in-right"
              style="animation-delay: 0.8s"
            >
              <div
                class="px-4 py-3 bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-xl w-48"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <svg
                      class="w-3 h-3 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-[10px] text-white/80 font-medium">AI Analysis Done</p>
                    <p class="text-[8px] text-white/30">Sentiment: Negative</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating sentiment card -->
            <div class="absolute -left-8 bottom-16 animate-fade-in" style="animation-delay: 1.2s">
              <div
                class="px-4 py-3 bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-xl"
              >
                <div class="flex items-center gap-3">
                  <div class="text-2xl">😊</div>
                  <div>
                    <p class="text-[10px] text-white/80 font-medium">Sentiment Score</p>
                    <div class="flex items-center gap-1.5 mt-1">
                      <div class="w-20 h-1.5 rounded-full bg-white/10">
                        <div
                          class="w-[85%] h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                        />
                      </div>
                      <span class="text-[9px] text-emerald-400 font-bold">85%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         STATS BAR
         ═══════════════════════════════════════════════════════════ -->
    <section class="relative z-10 border-y border-white/[0.06] bg-white/[0.015] backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div v-for="stat in stats" :key="stat.label">
            <p
              class="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
            >
              {{ stat.value }}
            </p>
            <p class="text-sm text-white/40 mt-1">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         FEATURES GRID
         ═══════════════════════════════════════════════════════════ -->
    <section id="features" class="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <p class="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">Everything your team needs</h2>
        <p class="text-white/45 mt-4 leading-relaxed">
          From AI-powered classification to Knowledge Base, Customer Portal, and smart automation —
          everything your support team needs.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(f, i) in features"
          :key="f.title"
          class="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-500 hover:-translate-y-1"
          :class="f.glow"
        >
          <!-- Icon -->
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg"
            :class="f.color"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="f.icon" />
            </svg>
          </div>
          <h3 class="text-white font-semibold text-lg mb-2">{{ f.title }}</h3>
          <p class="text-white/40 text-sm leading-relaxed">{{ f.desc }}</p>

          <!-- Subtle corner glow on hover -->
          <div
            class="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl -z-10"
            :class="`bg-gradient-to-br ${f.color}`"
            style="filter: brightness(0.3)"
          />
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         HOW IT WORKS — 3-step visual flow
         ═══════════════════════════════════════════════════════════ -->
    <section class="relative z-10 max-w-7xl mx-auto px-6 py-24">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <p class="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
          How it works
        </p>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">
          Three steps to automated support
        </h2>
      </div>

      <div class="grid md:grid-cols-3 gap-8 relative">
        <!-- Connecting line -->
        <div
          class="hidden md:block absolute top-14 left-[16%] right-[16%] h-px bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30"
        />

        <div
          v-for="(step, i) in [
            {
              num: '01',
              title: 'Create your workspace',
              desc: 'Sign up, invite your team, and configure roles. Your helpdesk is ready in under 2 minutes.',
              icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
            },
            {
              num: '02',
              title: 'AI analyzes everything',
              desc: 'Gemini AI classifies sentiment, priority, category and drafts a reply — in seconds.',
              icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
            },
            {
              num: '03',
              title: 'Your team takes over',
              desc: 'Agents see enriched tickets with AI suggestions, internal notes, and canned replies. One click to resolve.',
              icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            },
          ]"
          :key="step.num"
          class="relative text-center group"
        >
          <!-- Step icon circle -->
          <div
            class="w-14 h-14 rounded-2xl mx-auto mb-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          >
            <svg
              class="w-6 h-6 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="step.icon"
              />
            </svg>
          </div>
          <p class="text-indigo-400/50 text-xs font-bold uppercase tracking-widest mb-2">
            Step {{ step.num }}
          </p>
          <h3 class="text-white font-semibold text-lg mb-2">{{ step.title }}</h3>
          <p class="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         PRICING
         ═══════════════════════════════════════════════════════════ -->
    <section id="pricing" class="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <p class="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">Simple, transparent pricing</h2>
        <p class="text-white/45 mt-4">Start free. Upgrade when you're ready. No hidden fees.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div
          v-for="plan in plans"
          :key="plan.name"
          class="relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
          :class="
            plan.popular
              ? 'bg-gradient-to-b from-indigo-500/[0.08] to-purple-500/[0.04] border-indigo-500/30 shadow-xl shadow-indigo-500/10'
              : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.1]'
          "
        >
          <!-- Popular badge -->
          <div v-if="plan.popular" class="absolute -top-3 left-1/2 -translate-x-1/2">
            <span
              class="px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg"
            >
              Most Popular
            </span>
          </div>

          <h3 class="text-white font-bold text-lg">{{ plan.name }}</h3>
          <p class="text-white/40 text-sm mt-1">{{ plan.desc }}</p>

          <div class="mt-6 mb-6">
            <span class="text-4xl font-extrabold text-white">${{ plan.price }}</span>
            <span class="text-white/40 text-sm">/agent/mo</span>
          </div>

          <NuxtLink
            to="/signup"
            class="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300"
            :class="
              plan.popular
                ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]'
            "
          >
            {{ plan.cta }}
          </NuxtLink>

          <ul class="mt-6 space-y-3">
            <li
              v-for="feat in plan.features"
              :key="feat"
              class="flex items-center gap-2.5 text-sm text-white/55"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
                :class="plan.popular ? 'text-indigo-400' : 'text-white/30'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {{ feat }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         FINAL CTA
         ═══════════════════════════════════════════════════════════ -->
    <section class="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
      <div
        class="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-indigo-500/[0.1] to-purple-500/[0.05] border border-indigo-500/20 overflow-hidden"
      >
        <!-- Background glow -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 blur-3xl"
        />

        <div class="relative">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to transform your support?
          </h2>
          <p class="text-white/50 max-w-xl mx-auto mb-8">
            Join teams using AI to deliver faster, smarter customer service. Set up in 2 minutes —
            no credit card required.
          </p>
          <NuxtLink
            to="/signup"
            class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-2xl text-white font-semibold transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
          >
            Get Started Free
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         FOOTER
         ═══════════════════════════════════════════════════════════ -->
    <footer class="relative z-10 border-t border-white/[0.06] bg-white/[0.01]">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            <img src="/logo.svg" alt="AuraDesk" class="w-8 h-8" />
            <span class="text-sm text-white/40">AuraDesk</span>
          </div>
          <p class="text-xs text-white/25">&copy; 2026 Janina Dorobantu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
  html {
    scroll-behavior: smooth;
  }
</style>
