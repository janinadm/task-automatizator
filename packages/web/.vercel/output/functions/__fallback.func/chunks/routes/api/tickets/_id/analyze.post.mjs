import { d as defineEventHandler, c as createError, a as getRouterParam, e as analyzeTicket, s as suggestReply } from '../../../../nitro/nitro.mjs';
import { p as prisma } from '../../../../_/client.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import '@prisma/client';

const analyze_post = defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) throw createError({ statusCode: 401, message: "Unauthorized" });
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing ticket ID" });
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true }
  });
  if (!dbUser) throw createError({ statusCode: 404, message: "User not found" });
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { body: true, senderType: true }
      }
    }
  });
  if (!ticket) throw createError({ statusCode: 404, message: "Ticket not found" });
  if (ticket.orgId !== dbUser.orgId) throw createError({ statusCode: 403, message: "Forbidden" });
  const [analysis, reply] = await Promise.all([
    analyzeTicket(ticket.subject, ticket.body),
    suggestReply(
      ticket.subject,
      ticket.body,
      ticket.messages,
      ticket.sentiment,
      ticket.category
    )
  ]);
  const [updatedTicket, aiSuggestion] = await prisma.$transaction([
    prisma.ticket.update({
      where: { id },
      data: {
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        priority: analysis.priority,
        category: analysis.category,
        language: analysis.language,
        summary: analysis.summary
      }
    }),
    prisma.aiSuggestion.create({
      data: {
        ticketId: id,
        suggestedReply: reply.suggestedReply,
        confidence: reply.confidence
      }
    })
  ]);
  return {
    data: {
      analysis,
      suggestion: {
        id: aiSuggestion.id,
        suggestedReply: reply.suggestedReply,
        confidence: reply.confidence,
        reasoning: reply.reasoning
      },
      updatedTicket
    }
  };
});

export { analyze_post as default };
//# sourceMappingURL=analyze.post.mjs.map
