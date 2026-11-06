# n8n Workflow Specs

## Lead Intake
Trigger: Telegram webhook or form submission.
Actions:
1. Normalize lead.
2. Upsert lead in Supabase.
3. Store message.
4. Classify with AI.
5. Update lead stage/tags.
6. Notify operator if hot, unsafe, or high-value.

## Due Follow-Up Poller
Trigger: every 15 minutes.
Query: `select * from due_followups limit 20;`
Actions:
1. Generate draft follow-up.
2. Save to outbound_queue.
3. Ask operator to approve/send.

## Daily Posting Kit
Trigger: 6:30, 11:30, 17:30, 22:30.
Actions:
1. Pick platform/city/theme.
2. Generate manual post kit.
3. Save in campaign_posts.
4. Send copy kit to Telegram.

## Whale Detection
Trigger: after transaction or hourly.
Actions:
1. Re-score updated leads.
2. If tier t3/t4, queue VIP offer draft.
3. Notify operator.

## Daily Metrics
Trigger: 23:55.
Actions:
1. Pull daily_metrics.
2. Pull top sources/posts.
3. Generate summary.
4. Send Telegram report.
