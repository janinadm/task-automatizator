import { d as defineEventHandler, c as createError, r as readBody, e as analyzeTicket, f as setResponseStatus } from '../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) throw createError({ statusCode: 401, message: "Unauthorized" });
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, id: true }
  });
  if (!dbUser) throw createError({ statusCode: 404, message: "User not found" });
  const body = await readBody(event);
  if (!(body == null ? void 0 : body.subject) || !(body == null ? void 0 : body.body)) {
    throw createError({
      statusCode: 400,
      message: "subject and body are required"
    });
  }
  const ticket = await prisma.ticket.create({
    data: {
      subject: String(body.subject).slice(0, 200),
      body: String(body.body).slice(0, 5e3),
      channel: body.channel || "WEB",
      customerName: body.customerName || null,
      customerEmail: body.customerEmail || null,
      orgId: dbUser.orgId
      // priority and sentiment will be filled by AI in the background
      // (prioridad y sentimiento serán llenados por la IA en segundo plano)
    }
  });
  analyzeTicket(ticket.subject, ticket.body).then(async (analysis) => {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        priority: analysis.priority,
        category: analysis.category,
        language: analysis.language,
        summary: analysis.summary
      }
    });
    console.log(`[AI] Enriched ticket ${ticket.id}: ${analysis.category} / ${analysis.sentiment} / ${analysis.priority}`);
  }).catch((err) => {
    console.error(`[AI] Failed to enrich ticket ${ticket.id}:`, err);
  });
  setResponseStatus(event, 201);
  return { data: ticket };
});

export { index_post as default };
//# sourceMappingURL=index.post3.mjs.map
