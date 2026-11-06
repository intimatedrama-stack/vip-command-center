import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { supabase } from './db.js';
import { scoreLead } from '../../../packages/core/src/scoring.js';

const token = REDACTED
if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN');

const bot = new Telegraf(token);

function parsePipe(input: string) {
  return input.split('|').map((x) => x.trim()).filter(Boolean);
}

bot.start((ctx) => {
  ctx.reply([
    'VIP Command Center online.',
    '',
    'Commands:',
    '/newlead Name | Source | City | Notes',
    '/paid Name | Amount | Product',
    '/hot',
    '/followups',
    '/metrics'
  ].join('\n'));
});

bot.command('newlead', async (ctx) => {
  const raw = ctx.message.text.replace('/newlead', '').trim();
  const [display_name, source, city, notes] = parsePipe(raw);
  if (!display_name || !source) return ctx.reply('Use: /newlead Name | Source | City | Notes');

  const { data, error } = await supabase.from('leads').insert({
    display_name,
    source,
    city,
    notes,
    last_contact_at: new Date().toISOString(),
    next_followup_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }).select().single();

  if (error) return ctx.reply(`Error: ${error.message}`);
  return ctx.reply(`Lead added: ${data.display_name} (${data.source})`);
});

bot.command('paid', async (ctx) => {
  const raw = ctx.message.text.replace('/paid', '').trim();
  const [name, amountRaw, product] = parsePipe(raw);
  const amount = Number(amountRaw);
  if (!name || !amount || !product) return ctx.reply('Use: /paid Name | Amount | Product');

  const { data: leads } = await supabase.from('leads').select('*').ilike('display_name', `%${name}%`).limit(1);
  const lead = leads?.[0];
  if (!lead) return ctx.reply('Lead not found. Add them first with /newlead.');

  const { error: txError } = await supabase.from('transactions').insert({ lead_id: lead.id, amount, product });
  if (txError) return ctx.reply(`Transaction error: ${txError.message}`);

  const newTotal = Number(lead.total_spent ?? 0) + amount;
  const score = scoreLead({ totalSpent: newTotal, repeatBuyer: newTotal > amount, paidFast: true });

  await supabase.from('leads').update({
    total_spent: newTotal,
    lead_score: score.leadScore,
    whale_score: score.whaleScore,
    buyer_tier: score.buyerTier,
    stage: score.stageHint,
    next_followup_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  }).eq('id', lead.id);

  return ctx.reply(`Payment logged: ${lead.display_name} $${amount} for ${product}\nTier: ${score.buyerTier}\nLead score: ${score.leadScore}\nWhale score: ${score.whaleScore}`);
});

bot.command('hot', async (ctx) => {
  const { data, error } = await supabase.from('hot_leads').select('*').limit(10);
  if (error) return ctx.reply(`Error: ${error.message}`);
  if (!data?.length) return ctx.reply('No hot leads yet.');
  return ctx.reply(data.map((l, i) => `${i + 1}. ${l.display_name} | ${l.source} | ${l.buyer_tier} | L${l.lead_score}/W${l.whale_score} | $${l.total_spent}`).join('\n'));
});

bot.command('followups', async (ctx) => {
  const { data, error } = await supabase.from('due_followups').select('*').limit(10);
  if (error) return ctx.reply(`Error: ${error.message}`);
  if (!data?.length) return ctx.reply('No follow-ups due.');
  return ctx.reply(data.map((l, i) => `${i + 1}. ${l.display_name} | ${l.source} | ${l.stage} | ${l.next_followup_at}`).join('\n'));
});

bot.command('metrics', async (ctx) => {
  const { data, error } = await supabase.from('daily_metrics').select('*').single();
  if (error) return ctx.reply(`Error: ${error.message}`);
  return ctx.reply([
    'Today:',
    `New leads: ${data.new_leads}`,
    `Transactions: ${data.transactions}`,
    `Revenue: $${data.revenue}`,
    `Drafts: ${data.drafts_created}`,
  ].join('\n'));
});

bot.launch();
console.log('VIP Command Center Telegram bot running.');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
