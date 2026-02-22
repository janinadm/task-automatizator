// ============================================================================
// Database Seed Script — Populate development data
// (Script de Seed de Base de Datos — Poblar datos de desarrollo)
// ============================================================================
// Run this after migrations to fill the database with realistic demo data.
// Command: `pnpm db:seed` (from monorepo root)
//
// This creates:
// - 1 Organization (demo agency)
// - 2 Users (1 admin, 1 agent)
// - 10 Tickets with realistic customer messages, varying sentiments and priorities
// - Messages and AI suggestions for each ticket
// - SLA configurations
//
// (Ejecutar después de las migraciones para llenar la BD con datos demo realistas.
//  Comando: `pnpm db:seed` (desde la raíz del monorepo))
// ============================================================================

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database... (Sembrando base de datos...)')

  // === Clean existing data (Limpiar datos existentes) ===
  // Delete in reverse order of dependencies to avoid foreign key violations
  // (Eliminar en orden inverso de dependencias para evitar violaciones de clave foránea)
  await prisma.aiSuggestion.deleteMany()
  await prisma.ticketMessage.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.slaConfig.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  console.log('🧹 Cleaned existing data (Datos existentes limpiados)')

  // === Create Organization (Crear Organización) ===
  const org = await prisma.organization.create({
    data: {
      name: 'Stellar Marketing Agency',
      slug: 'stellar-marketing',
      plan: 'PRO',
      logoUrl: null,
    },
  })
  console.log(`🏢 Created organization: ${org.name}`)

  // === Create Users (Crear Usuarios) ===
  // NOTE: In production, these IDs would come from Supabase Auth.
  // For seeding, we use placeholder UUIDs that you'd replace after setting up auth.
  // (NOTA: En producción, estos IDs vendrían de Supabase Auth.
  //  Para seeding, usamos UUIDs placeholder que reemplazarías después de configurar auth.)
  const admin = await prisma.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001', // Placeholder UUID
      email: 'admin@stellarmarketing.com',
      fullName: 'María García',
      role: 'ADMIN',
      orgId: org.id,
      avatarUrl: null,
    },
  })
  console.log(`👤 Created admin: ${admin.fullName}`)

  const agent = await prisma.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000002', // Placeholder UUID
      email: 'agent@stellarmarketing.com',
      fullName: 'Carlos López',
      role: 'AGENT',
      orgId: org.id,
      avatarUrl: null,
    },
  })
  console.log(`👤 Created agent: ${agent.fullName}`)

  // === Create SLA Configurations (Crear Configuraciones SLA) ===
  const slaData = [
    { priority: 'LOW' as const, maxResponseMinutes: 1440 },    // 24 hours
    { priority: 'MEDIUM' as const, maxResponseMinutes: 480 },  // 8 hours
    { priority: 'HIGH' as const, maxResponseMinutes: 120 },    // 2 hours
    { priority: 'URGENT' as const, maxResponseMinutes: 30 },   // 30 minutes
  ]

  for (const sla of slaData) {
    await prisma.slaConfig.create({
      data: { ...sla, orgId: org.id },
    })
  }
  console.log('⏱️  Created SLA configurations')

  // === Create Tickets with Messages and AI Suggestions ===
  // (Crear Tickets con Mensajes y Sugerencias de IA)
  // Each ticket simulates a real customer interaction with different emotions and topics
  // (Cada ticket simula una interacción real de cliente con diferentes emociones y temas)

  const ticketsData = [
    {
      subject: 'URGENT: Our website is completely down!',
      body: 'Our entire website has been down for the last 2 hours! We are losing thousands of dollars every minute. This is completely unacceptable! We are paying premium prices for your services and this is what we get? Fix this NOW or we are switching providers today!',
      channel: 'EMAIL' as const,
      status: 'OPEN' as const,
      priority: 'URGENT' as const,
      sentiment: 'NEGATIVE' as const,
      sentimentScore: 0.95,
      category: 'technical',
      language: 'en',
      summary: 'Customer reports complete website outage for 2 hours. Extremely frustrated, threatening to leave. Revenue impact.',
      customerName: 'James Wilson',
      customerEmail: 'james@techcorp.com',
    },
    {
      subject: 'Question about upgrading our plan',
      body: 'Hi there! We\'ve been really happy with your services so far. Our team has grown and we\'re now looking at upgrading from Starter to Pro. Could you walk us through the differences and any migration steps needed? Thanks!',
      channel: 'WEB' as const,
      status: 'OPEN' as const,
      priority: 'MEDIUM' as const,
      sentiment: 'POSITIVE' as const,
      sentimentScore: 0.85,
      category: 'sales',
      language: 'en',
      summary: 'Happy customer inquiring about plan upgrade from Starter to Pro. Potential upsell opportunity.',
      customerName: 'Sarah Chen',
      customerEmail: 'sarah@growthco.com',
    },
    {
      subject: 'Invoice discrepancy for February',
      body: 'I noticed that our February invoice shows $499 but our contract says $399/month. Could you please check this? I assume it\'s just a billing error but would appreciate a quick resolution.',
      channel: 'EMAIL' as const,
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      sentiment: 'NEUTRAL' as const,
      sentimentScore: 0.45,
      category: 'billing',
      language: 'en',
      summary: 'Customer reports invoice discrepancy. February charge is $100 over contracted amount.',
      customerName: 'Robert Johnson',
      customerEmail: 'robert@mediallc.com',
      assignedToId: agent.id,
    },
    {
      subject: 'Muchísimas gracias por su ayuda',
      body: '¡Quería escribirles para darles las gracias! El equipo de soporte fue increíblemente amable y resolvió mi problema en menos de una hora. Estoy muy contenta con el servicio. ¡Seguiré recomendándolos a todos mis colegas!',
      channel: 'WEB' as const,
      status: 'RESOLVED' as const,
      priority: 'LOW' as const,
      sentiment: 'POSITIVE' as const,
      sentimentScore: 0.98,
      category: 'feedback',
      language: 'es',
      summary: 'Very positive feedback. Customer thanks support team for fast resolution. Plans to recommend service.',
      customerName: 'Ana Martínez',
      customerEmail: 'ana@designstudio.es',
      assignedToId: agent.id,
      resolvedAt: new Date(Date.now() - 86400000), // 1 day ago (hace 1 día)
    },
    {
      subject: 'API integration not working after update',
      body: 'Since your last update on Monday, our API integration has been returning 500 errors intermittently. We\'ve checked our code and the issue is on your end. This is affecting our production environment. Please look into this urgently.',
      channel: 'SLACK' as const,
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      sentiment: 'NEGATIVE' as const,
      sentimentScore: 0.72,
      category: 'technical',
      language: 'en',
      summary: 'API returning 500 errors after recent update. Customer confirms issue is server-side. Production impact.',
      customerName: 'David Kim',
      customerEmail: 'david@appdev.io',
      assignedToId: admin.id,
    },
    {
      subject: 'Want to cancel our subscription',
      body: 'We would like to cancel our subscription effective end of this month. The platform doesn\'t meet our needs anymore and we\'ve found an alternative that works better for our workflow. Please confirm the cancellation process.',
      channel: 'EMAIL' as const,
      status: 'OPEN' as const,
      priority: 'HIGH' as const,
      sentiment: 'NEGATIVE' as const,
      sentimentScore: 0.65,
      category: 'cancellation',
      language: 'en',
      summary: 'Customer requesting subscription cancellation. Has found alternative solution. Retention opportunity.',
      customerName: 'Emily Davis',
      customerEmail: 'emily@retailplus.com',
    },
    {
      subject: 'How do I set up automated reports?',
      body: 'I just started using the platform and I\'m trying to set up weekly automated reports for my team. I\'ve looked through the docs but can\'t find clear instructions. Could you point me in the right direction?',
      channel: 'WHATSAPP' as const,
      status: 'OPEN' as const,
      priority: 'LOW' as const,
      sentiment: 'NEUTRAL' as const,
      sentimentScore: 0.50,
      category: 'onboarding',
      language: 'en',
      summary: 'New customer needs help with automated reports setup. Documentation unclear.',
      customerName: 'Michael Brown',
      customerEmail: 'michael@startupxyz.com',
    },
    {
      subject: 'Re: Campaign performance issues',
      body: 'Following up on my previous email from last week. Nobody has responded yet. Our ad campaigns have been underperforming for 10 days now and we\'re hemorrhaging budget. This is our third attempt to reach someone. Incredibly disappointing service.',
      channel: 'EMAIL' as const,
      status: 'OPEN' as const,
      priority: 'URGENT' as const,
      sentiment: 'NEGATIVE' as const,
      sentimentScore: 0.90,
      category: 'complaint',
      language: 'en',
      summary: 'Follow-up complaint. No response to previous emails for a week. Campaign issues causing budget waste. Very frustrated.',
      customerName: 'Lisa Thompson',
      customerEmail: 'lisa@ecommerce365.com',
    },
    {
      subject: 'Feature request: Dark mode',
      body: 'Love the platform! Would it be possible to add a dark mode option? Our team works late hours and the bright interface can be tiring on the eyes. Not urgent at all, just a nice-to-have suggestion. Keep up the great work!',
      channel: 'WEB' as const,
      status: 'CLOSED' as const,
      priority: 'LOW' as const,
      sentiment: 'POSITIVE' as const,
      sentimentScore: 0.80,
      category: 'feedback',
      language: 'en',
      summary: 'Feature request for dark mode. Customer is satisfied overall. Low priority enhancement.',
      customerName: 'Tom Anderson',
      customerEmail: 'tom@creativelabs.com',
      assignedToId: admin.id,
      resolvedAt: new Date(Date.now() - 172800000), // 2 days ago (hace 2 días)
    },
    {
      subject: 'Problème de facturation récurrent',
      body: 'Bonjour, c\'est la troisième fois que je vous contacte au sujet de la double facturation sur notre compte. Chaque mois, nous sommes facturés deux fois et personne ne résout le problème définitivement. Je commence à perdre patience.',
      channel: 'EMAIL' as const,
      status: 'OPEN' as const,
      priority: 'HIGH' as const,
      sentiment: 'NEGATIVE' as const,
      sentimentScore: 0.78,
      category: 'billing',
      language: 'fr',
      summary: 'Recurring double billing issue. Third contact about the same problem. Customer losing patience. French-speaking.',
      customerName: 'Pierre Dubois',
      customerEmail: 'pierre@agencefr.com',
    },
  ]

  for (const ticketData of ticketsData) {
    const ticket = await prisma.ticket.create({
      data: {
        ...ticketData,
        orgId: org.id,
      },
    })

    // Create the initial customer message (Crear el mensaje inicial del cliente)
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        body: ticketData.body,
        senderType: 'CUSTOMER',
        senderName: ticketData.customerName,
      },
    })

    // Create an AI suggestion for open tickets (Crear sugerencia IA para tickets abiertos)
    if (ticketData.status === 'OPEN' || ticketData.status === 'IN_PROGRESS') {
      await prisma.aiSuggestion.create({
        data: {
          ticketId: ticket.id,
          suggestedReply: generateSuggestedReply(ticketData.category || 'general', ticketData.sentiment || 'NEUTRAL'),
          confidence: Math.random() * 0.3 + 0.65, // 0.65–0.95 range
          accepted: null, // Pending (Pendiente)
        },
      })
    }

    console.log(`🎫 Created ticket: "${ticket.subject.substring(0, 50)}..."`)
  }

  console.log('\n✅ Seed completed successfully! (¡Seed completado exitosamente!)')
  console.log(`   📊 Organization: ${org.name}`)
  console.log(`   👥 Users: 2 (1 admin, 1 agent)`)
  console.log(`   🎫 Tickets: ${ticketsData.length}`)
  console.log(`   ⏱️  SLA Configs: ${slaData.length}`)
}

/**
 * Generate a realistic AI-suggested reply based on category and sentiment
 * (Generar una respuesta sugerida por IA realista basada en categoría y sentimiento)
 */
function generateSuggestedReply(category: string, sentiment: string): string {
  const replies: Record<string, string> = {
    technical: `Thank you for reporting this issue. I understand the urgency and have escalated this to our technical team for immediate investigation. We'll provide an update within the next 30 minutes. In the meantime, could you share any error logs or screenshots that might help us diagnose the problem faster?`,
    billing: `Thank you for bringing this billing discrepancy to our attention. I've flagged your account for review by our billing team. We take billing accuracy very seriously. You can expect a detailed response and resolution within 24 hours. If the charge was indeed incorrect, we'll process a refund immediately.`,
    sales: `Thank you for your interest in upgrading! I'd be happy to walk you through the differences between plans. The Pro plan includes unlimited API calls, priority support, and advanced analytics. I'll prepare a personalized comparison for your team and send it over shortly. Would you also be interested in a live demo?`,
    feedback: `Thank you so much for your kind words! It means a lot to our team. We're constantly working to improve our service and feedback like yours motivates us to keep pushing forward. If there's anything else we can help with, don't hesitate to reach out!`,
    complaint: `I sincerely apologize for the delay in response and the frustration this has caused. This is not the level of service we strive to provide. I'm personally escalating your case to our senior team. You'll receive a direct call from our account manager within the next 2 hours to address all your concerns.`,
    cancellation: `I'm sorry to hear you're considering leaving. Before processing the cancellation, I'd love to understand what hasn't met your needs — we may have solutions or features you haven't tried yet. Could we schedule a quick 15-minute call to discuss? If you still wish to proceed, I'll ensure a smooth transition.`,
    onboarding: `Welcome aboard! Setting up automated reports is easy. Go to Dashboard → Reports → Create New. Select "Weekly" frequency, choose your metrics, and add your team's email addresses. I'll also send you our step-by-step guide with screenshots. Feel free to reach out if you need any further help!`,
    general: `Thank you for reaching out. I've reviewed your message and want to ensure we address your needs promptly. Let me look into this and get back to you with a detailed response shortly.`,
  }

  // For negative sentiment, prepend an empathetic opener
  // (Para sentimiento negativo, anteponer una apertura empática)
  const prefix = sentiment === 'NEGATIVE'
    ? 'I completely understand your frustration, and I want to assure you that resolving this is our top priority. '
    : ''

  return prefix + (replies[category] || replies.general)
}

// Execute the seed function (Ejecutar la función de seed)
main()
  .catch((e) => {
    console.error('❌ Seed failed (El seed falló):', e)
    process.exit(1)
  })
  .finally(async () => {
    // Always disconnect from the database when done
    // (Siempre desconectar de la base de datos al terminar)
    await prisma.$disconnect()
  })
