import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { p as prisma } from '../../_/client.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import '@prisma/client';

const index_get = defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true }
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  const { orgId } = dbUser;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const [recentTickets, recentMessages, slaBreach, aiSuggestions] = await Promise.all([
    // New tickets created recently
    prisma.ticket.findMany({
      where: { orgId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        subject: true,
        priority: true,
        channel: true,
        customerName: true,
        createdAt: true
      }
    }),
    // Recent customer messages (not agent/AI)
    prisma.ticketMessage.findMany({
      where: {
        ticket: { orgId },
        senderType: "CUSTOMER",
        createdAt: { gte: since }
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        body: true,
        senderName: true,
        createdAt: true,
        ticket: { select: { id: true, subject: true } }
      }
    }),
    // SLA breaching tickets
    prisma.ticket.findMany({
      where: {
        orgId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
        priority: "URGENT",
        createdAt: { lt: new Date(Date.now() - 2 * 60 * 60 * 1e3) }
      },
      take: 5,
      select: {
        id: true,
        subject: true,
        createdAt: true
      }
    }),
    // Recent AI suggestions
    prisma.aiSuggestion.findMany({
      where: {
        ticket: { orgId },
        createdAt: { gte: since }
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        ticket: { select: { id: true, subject: true } }
      }
    })
  ]);
  const notifications = [];
  for (const t of recentTickets) {
    notifications.push({
      id: `ticket-${t.id}`,
      type: "new_ticket",
      title: "New ticket",
      description: t.subject.length > 60 ? t.subject.substring(0, 60) + "..." : t.subject,
      ticketId: t.id,
      createdAt: t.createdAt,
      priority: t.priority
    });
  }
  for (const m of recentMessages) {
    notifications.push({
      id: `msg-${m.id}`,
      type: "customer_message",
      title: `Reply from ${m.senderName || "Customer"}`,
      description: m.ticket.subject.length > 60 ? m.ticket.subject.substring(0, 60) + "..." : m.ticket.subject,
      ticketId: m.ticket.id,
      createdAt: m.createdAt
    });
  }
  for (const s of slaBreach) {
    notifications.push({
      id: `sla-${s.id}`,
      type: "sla_breach",
      title: "SLA Breach Warning",
      description: s.subject.length > 60 ? s.subject.substring(0, 60) + "..." : s.subject,
      ticketId: s.id,
      createdAt: s.createdAt,
      priority: "URGENT"
    });
  }
  for (const a of aiSuggestions) {
    notifications.push({
      id: `ai-${a.id}`,
      type: "ai_suggestion",
      title: "AI suggestion ready",
      description: a.ticket.subject.length > 60 ? a.ticket.subject.substring(0, 60) + "..." : a.ticket.subject,
      ticketId: a.ticket.id,
      createdAt: a.createdAt
    });
  }
  notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return {
    data: {
      notifications: notifications.slice(0, 30),
      unreadCount: notifications.length
    }
  };
});

export { index_get as default };
//# sourceMappingURL=index.get4.mjs.map
