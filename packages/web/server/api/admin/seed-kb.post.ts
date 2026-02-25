/**
 * API Route: POST /api/admin/seed-kb
 *
 * One-time endpoint to seed Knowledge Base articles for the authenticated user's org.
 * Only ADMINs can trigger this. It checks if articles already exist to avoid duplicates.
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, orgId: true, role: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })
  if (dbUser.role !== 'ADMIN')
    throw createError({ statusCode: 403, message: 'Only admins can seed articles' })

  // Check if org already has articles
  const existingCount = await prisma.article.count({ where: { orgId: dbUser.orgId } })
  if (existingCount > 0) {
    return {
      success: true,
      message: `Organization already has ${existingCount} articles. Skipping seed.`,
      count: existingCount,
    }
  }

  const articlesData = [
    {
      title: 'Getting Started with AuraDesk',
      slug: 'getting-started-with-auradesk',
      category: 'Getting Started',
      status: 'PUBLISHED' as const,
      body: `# Getting Started with AuraDesk\n\nWelcome to AuraDesk! This guide walks you through the key features and how to get the most out of your support platform.\n\n## Quick Overview\n\nAuraDesk is a modern customer support platform with:\n- **Ticket Management** — Track and resolve customer issues\n- **AI-Powered Analysis** — Automatic sentiment detection, priority classification, and suggested replies\n- **Team Collaboration** — Assign tickets, leave internal notes, and manage agents\n- **Knowledge Base** — Create help articles for your team and customers\n- **SLA Tracking** — Monitor response times and compliance\n- **Customer Portal** — Let customers check ticket status and browse help articles\n\n## First Steps\n\n1. **Review your dashboard** — See KPIs, recent tickets, and agent performance at a glance\n2. **Check your tickets** — Open the Tickets page to see all incoming requests\n3. **Try AI Analysis** — Click "Analyze with AI" on any ticket to get sentiment and priority suggestions\n4. **Invite your team** — Go to Team page to invite agents and admins\n5. **Configure SLA** — Set response time targets in Settings\n\n## Navigation\n\n- **Dashboard** — Overview with KPIs and charts\n- **Tickets** — Full ticket list with filters, search, and bulk actions\n- **Analytics** — Detailed charts and agent performance leaderboard\n- **Team** — Manage team members and invitations\n- **Integrations** — Connect email, Slack, WhatsApp channels\n- **Knowledge Base** — Create and manage help articles\n- **Settings** — SLA rules, canned responses, auto-assignment, and org settings`,
    },
    {
      title: 'Understanding Ticket Priorities',
      slug: 'understanding-ticket-priorities',
      category: 'Tickets',
      status: 'PUBLISHED' as const,
      body: `# Understanding Ticket Priorities\n\nAuraDesk uses four priority levels to help your team focus on the most urgent issues first.\n\n## Priority Levels\n\n| Priority | Icon | SLA Target | Use Case |\n|----------|------|-----------|----------|\n| 🔴 **Urgent** | Red dot | 30 minutes | System outages, data loss, security issues |\n| 🟠 **High** | Orange dot | 2 hours | Major feature broken, blocking customer work |\n| 🟡 **Medium** | Amber dot | 8 hours | Non-critical bugs, questions about features |\n| 🟢 **Low** | Green dot | 24 hours | Feature requests, general feedback, minor UI issues |\n\n## How Priorities Are Set\n\n1. **Manual** — Agents can set priority when creating or editing a ticket\n2. **AI-Powered** — Click "Analyze with AI" to let the AI suggest a priority based on the ticket content\n3. **Auto-enrichment** — New tickets are automatically analyzed on creation\n\n## SLA Breach Warnings\n\nWhen a ticket approaches or exceeds its SLA target:\n- A red pulsing dot appears next to the ticket\n- The SLA status shows "Breached" or "At risk"\n- Urgent tickets get flagged in the dashboard KPIs\n\n## Best Practices\n\n- Review AI priority suggestions but override when needed\n- Escalate tickets that are close to SLA breach\n- Use the Analytics page to monitor SLA compliance rates`,
    },
    {
      title: 'AI Analysis: How It Works',
      slug: 'ai-analysis-how-it-works',
      category: 'Features',
      status: 'PUBLISHED' as const,
      body: `# AI Analysis: How It Works\n\nAuraDesk integrates Google Gemini AI to help agents work faster and smarter.\n\n## What AI Analyzes\n\nWhen you click **"Analyze with AI"** on a ticket, the system:\n\n1. **Sentiment Detection** — Classifies the customer's mood as Positive 😊, Neutral 😐, or Negative 😡\n2. **Priority Suggestion** — Recommends Urgent, High, Medium, or Low based on content\n3. **Category Classification** — Assigns a category (Technical, Billing, Sales, Feedback, etc.)\n4. **Language Detection** — Identifies the ticket language\n5. **Summary Generation** — Creates a brief summary of the ticket\n6. **Suggested Reply** — Generates a professional response you can use or edit\n\n## Using AI Suggestions\n\n- AI suggestions appear in the **AI Summary** and **AI Analysis** sections of the ticket detail\n- The **suggested reply** can be copied directly into your response\n- AI confidence scores help you decide how much to trust the suggestion\n- You can always override AI decisions — they're suggestions, not rules\n\n## Rate Limits\n\nThe AI service uses Google Gemini's API which has rate limits:\n- If you see "rate limited," wait 30–60 seconds and try again\n- Avoid clicking "Analyze" rapidly on multiple tickets\n- The system automatically retries up to 3 times with increasing delays\n\n## Privacy\n\nOnly the ticket subject, body, and message history are sent to the AI. No personal customer data (email, phone) is included in the analysis.`,
    },
    {
      title: 'Managing Your Team',
      slug: 'managing-your-team',
      category: 'Team',
      status: 'PUBLISHED' as const,
      body: `# Managing Your Team\n\nThe Team page lets admins manage agents, roles, and invitations.\n\n## Roles\n\n| Role | Permissions |\n|------|------------|\n| **Admin** | Full access: manage team, settings, SLA, canned responses, integrations |\n| **Agent** | Handle tickets: view, reply, resolve, use canned responses, add tags |\n\n## Inviting New Members\n\n1. Go to **Team** page\n2. Click **"Send Invitation"**\n3. Enter the person's email and select their role (Admin or Agent)\n4. They'll receive a link to create their account and join your organization\n\n## Important Notes on Invitations\n\n- Invited users must sign up using the **exact email** the invitation was sent to\n- The invitation link expires after 7 days\n- Users should click the invite link in a **fresh browser** or **incognito window** to avoid session conflicts\n- After signing up, they automatically join your organization with the assigned role\n\n## Agent Performance\n\nTrack agent productivity in the **Analytics** page:\n- Tickets resolved per agent\n- Average response times\n- Agent leaderboard\n\nPerformance is based on tickets **assigned to** each agent that have been resolved or closed.`,
    },
    {
      title: 'Canned Responses (Reply Templates)',
      slug: 'canned-responses-reply-templates',
      category: 'Features',
      status: 'PUBLISHED' as const,
      body: `# Canned Responses (Reply Templates)\n\nCanned responses are pre-written reply templates that agents can quickly insert when responding to tickets.\n\n## What Are They For?\n\n- **Save time** — Don't retype common responses\n- **Consistency** — Every customer gets professional, well-written replies\n- **Onboarding** — New agents can use proven response templates immediately\n- **Quality** — Templates can be reviewed and approved by admins\n\n## Creating Canned Responses\n\nOnly **Admins** can create and manage canned responses:\n\n1. Go to **Settings** page\n2. Scroll to the **"Canned Responses"** section\n3. Click **"New Response"**\n4. Fill in:\n   - **Title** — A descriptive name (e.g., "Billing query acknowledgment")\n   - **Shortcut** — A quick keyword to find it (e.g., "billing-ack")\n   - **Category** — Group by type (e.g., "Billing", "Technical", "General")\n   - **Body** — The actual response text\n5. Save it\n\n## Using Canned Responses in Tickets\n\n1. Open any ticket\n2. Click the **"📋 Templates"** button next to the reply box\n3. Search or browse available templates\n4. Click one to insert it into your reply\n5. Edit as needed before sending\n\n## Template Variables\n\nTemplates support dynamic variables:\n- \`{{ticket.customerName}}\` — Replaced with the customer's name\n- \`{{ticket.subject}}\` — Replaced with the ticket subject\n\n## Tips\n\n- Create templates for your most frequent ticket types\n- Keep templates professional but warm\n- Update templates periodically based on customer feedback`,
    },
    {
      title: 'Auto-Assignment: Distributing Tickets',
      slug: 'auto-assignment-distributing-tickets',
      category: 'Features',
      status: 'PUBLISHED' as const,
      body: `# Auto-Assignment: Distributing Tickets\n\nAuto-assignment automatically distributes unassigned tickets among your active agents using a round-robin algorithm.\n\n## How It Works\n\n1. **Enable** auto-assignment in **Settings** (toggle switch)\n2. Click **"Run Auto-Assign Now"** to trigger distribution\n3. The system finds all unassigned OPEN/IN_PROGRESS tickets\n4. It gets all active agents (both Admins and Agents)\n5. Tickets are distributed evenly, prioritizing:\n   - **Urgent** tickets first, then High → Medium → Low\n   - Oldest tickets within each priority level\n6. Agents with fewer assigned tickets get new ones first\n7. Assigned tickets automatically move to **In Progress** status\n\n## Who Are "Agents"?\n\nAgents are your team members — real people (not AI). In AuraDesk:\n- **Any user** with a role of Admin or Agent can be assigned tickets\n- Users must be **active** (not deactivated) to receive auto-assignments\n- Invite new team members from the **Team** page\n\n## Important\n\n- Auto-assign is **manual trigger only** — you click the button to run it\n- It does NOT automatically assign new tickets as they arrive\n- Only **Admins** can enable and trigger auto-assignment\n- The toggle in Settings enables/disables the feature; the button runs it\n\n## Tips\n\n- Run auto-assign at the start of each shift\n- Check agent workload in Analytics before running\n- Combine with SLA monitoring to ensure urgent tickets get quick attention`,
    },
    {
      title: 'SLA Configuration and Monitoring',
      slug: 'sla-configuration-and-monitoring',
      category: 'Settings',
      status: 'PUBLISHED' as const,
      body: `# SLA Configuration and Monitoring\n\nService Level Agreements (SLAs) define the maximum response times for tickets based on their priority.\n\n## Default SLA Targets\n\n| Priority | Max Response Time |\n|----------|------------------|\n| Urgent | 30 minutes |\n| High | 2 hours |\n| Medium | 8 hours |\n| Low | 24 hours |\n\n## Configuring SLAs\n\n1. Go to **Settings** page\n2. Find the **"SLA Configuration"** section\n3. Adjust response time targets for each priority level\n4. Changes take effect immediately\n\n## Monitoring SLA Compliance\n\n### Dashboard\n- The main dashboard shows **SLA compliance rate** as a KPI card\n- At-risk and breaching tickets are highlighted\n\n### Ticket List\n- Red pulsing dots indicate SLA breach\n- Tickets are sorted to show urgent/breaching items first\n\n### Ticket Detail\n- SLA countdown timer shows time remaining\n- Status shows "At risk" (amber) or "Breached" (red)\n\n### Analytics\n- Track SLA compliance trends over time\n- See which priority levels have the most breaches\n- Monitor average resolution times\n\n## Tips\n\n- Set realistic SLA targets based on your team capacity\n- Use auto-assignment to distribute workload evenly\n- Monitor the dashboard daily for SLA warnings`,
    },
    {
      title: 'Internal Notes: Team Communication',
      slug: 'internal-notes-team-communication',
      category: 'Features',
      status: 'PUBLISHED' as const,
      body: `# Internal Notes: Team Communication\n\nInternal notes let your team communicate about a ticket without the customer seeing the conversation.\n\n## Adding an Internal Note\n\n1. Open a ticket from the Tickets page\n2. Click the **"📝 Note"** button next to the Send Reply button\n3. Write your note in the amber-colored panel\n4. Click **"Add Note"**\n\n## How Notes Appear\n\nInternal notes are displayed with:\n- An **amber/orange background**\n- A 🔒 lock icon prefix\n- An "internal note" badge\n- They're clearly distinguished from customer-facing messages\n\n## Use Cases\n\n- **Handoff context** — Leave notes when transferring a ticket to another agent\n- **Investigation updates** — Document your findings without notifying the customer\n- **Manager guidance** — Admins can leave instructions for agents\n- **Compliance notes** — Record internal decisions or approvals\n\n## Privacy\n\nInternal notes are **never** shown to customers, not even through the Customer Portal. They're exclusively for your team.`,
    },
    {
      title: 'Customer Portal Guide',
      slug: 'customer-portal-guide',
      category: 'Getting Started',
      status: 'PUBLISHED' as const,
      body: `# Customer Portal Guide\n\nThe Customer Portal allows your customers to check ticket status and browse help articles without needing to log in to AuraDesk.\n\n## Accessing the Portal\n\nThe portal is available at the dedicated **"Customer Portal"** link in the sidebar.\nShare this link with your customers.\n\n## Portal Features\n\n### Ticket Lookup\nCustomers enter their email to see all their support tickets with:\n- Current status (Open, In Progress, Resolved, Closed)\n- Priority level\n- Last message preview\n- Time since last update\n\n### Knowledge Base Browse\nCustomers can browse your published help articles by:\n- Searching by keyword\n- Filtering by category\n- Reading full article content\n\n## Privacy & Security\n\n- Only tickets matching the customer's email are shown\n- Internal notes are never exposed\n- Only **Published** articles appear (not drafts or archived)\n- No authentication required — email lookup only\n\n## Tips\n\n- Publish helpful articles to reduce repetitive support requests\n- Include your portal link in email signatures and auto-replies\n- Keep articles up-to-date with your latest features and processes`,
    },
    {
      title: 'Integrations Overview',
      slug: 'integrations-overview',
      category: 'Integrations',
      status: 'PUBLISHED' as const,
      body: `# Integrations Overview\n\nAuraDesk supports connecting external communication channels to centralize all customer interactions.\n\n## Available Channel Types\n\n| Type | Description | Status |\n|------|------------|--------|\n| 📧 **Email (IMAP)** | Receive emails as tickets | Configuration ready |\n| 📤 **Email (SMTP)** | Send replies via email | Configuration ready |\n| 💬 **WhatsApp** | WhatsApp Business messages | Webhook endpoint ready |\n| 🔔 **Slack** | Slack channel notifications | Webhook endpoint ready |\n| 🔗 **Webhook** | Custom integrations via HTTP | Fully functional |\n\n## Setting Up an Integration\n\n1. Go to **Integrations** page\n2. Click **"New Integration"**\n3. Select the channel type\n4. Give it a name\n5. The system generates a unique **webhook URL**\n6. Configure your external service to send data to that webhook URL\n\n## Current Capabilities\n\n- **CRUD Management** — Create, edit, toggle active/inactive, delete integrations\n- **Webhook URLs** — Unique URLs generated for each integration\n- **Status Toggle** — Enable/disable integrations without deleting them\n\n## Coming Soon\n\nFull connectivity features are planned for future phases:\n- Direct IMAP email polling\n- WhatsApp Business API integration\n- Slack bot with bi-directional messaging\n- Automatic ticket creation from incoming messages\n\n## Webhooks\n\nThe Webhook type is the most flexible — any external system can POST data to your webhook URL to create tickets or update data in AuraDesk.`,
    },
  ]

  // Create all articles
  const created = await prisma.$transaction(
    articlesData.map((article) =>
      prisma.article.create({
        data: {
          ...article,
          authorId: dbUser.id,
          orgId: dbUser.orgId,
        },
      }),
    ),
  )

  return {
    success: true,
    message: `Created ${created.length} knowledge base articles for your organization.`,
    count: created.length,
  }
})
