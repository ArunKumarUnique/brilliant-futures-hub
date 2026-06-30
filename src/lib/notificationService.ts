/**
 * Notification Service – reusable framework
 * ------------------------------------------
 * - Message Builder: templates for Homework / Learning / Both
 * - NotificationProvider abstraction: Development (current) + MSG91 (stub)
 *   Future providers (WhatsApp, Email, TextLocal, Twilio, Exotel) drop in here
 *   without any UI change.
 */

export type NotificationKind = 'homework' | 'learning' | 'both';
export type NotificationChannel = 'sms' | 'whatsapp' | 'email';

export interface StudentRecipient {
  id: string;
  student_name: string;
  gender?: string | null;
  parent_name?: string | null;
  parent_relation?: string | null;
  parent_mobile?: string | null;
  class?: string | null;
}

export interface HomeworkItem {
  title: string;
  description?: string | null;
  due_date?: string | null;
}

export interface LearningItem {
  title: string;
  topics: string;
}

export interface NotificationContext {
  instituteName: string;
  dateLabel: string;
  homework?: HomeworkItem[];
  learning?: LearningItem[];
}

export interface GeneratedNotification {
  studentId: string;
  studentName: string;
  gender?: string | null;
  parentName?: string | null;
  parentRelation?: string | null;
  parentMobile?: string | null;
  className?: string | null;
  kind: NotificationKind;
  message: string;
}

// ---------------- Message Builder ----------------

const honorific = (relation?: string | null) => {
  const r = (relation || '').trim().toLowerCase();
  if (r === 'father') return 'Mr.';
  if (r === 'mother') return 'Mrs.';
  if (r === 'guardian') return 'Guardian';
  return 'Mr./Mrs./Guardian';
};

const salutation = (s: StudentRecipient) => {
  const h = honorific(s.parent_relation);
  const name = (s.parent_name || '').trim() || 'Parent';
  return `Dear ${h} ${name}`;
};

const formatHw = (items: HomeworkItem[]) =>
  items.map(h => {
    const lines: string[] = [];
    lines.push(`Title: ${h.title}`);
    if (h.description) lines.push(`Homework: ${h.description}`);
    if (h.due_date) lines.push(`Due Date: ${h.due_date}`);
    return lines.join('\n');
  }).join('\n\n');

const formatLearn = (items: LearningItem[]) =>
  items.map(l => {
    const lines: string[] = [];
    if (l.title) lines.push(`Title: ${l.title}`);
    lines.push(`Topics Covered: ${l.topics}`);
    return lines.join('\n');
  }).join('\n\n');

export function buildHomeworkMessage(s: StudentRecipient, ctx: NotificationContext): string {
  return [
    `${salutation(s)},`,
    '',
    `Your child ${s.student_name} has been assigned the following homework today.`,
    '',
    formatHw(ctx.homework || []),
    '',
    'Regards,',
    ctx.instituteName,
  ].join('\n');
}

export function buildLearningMessage(s: StudentRecipient, ctx: NotificationContext): string {
  return [
    `${salutation(s)},`,
    '',
    `Your child ${s.student_name} has learned the following topics today.`,
    '',
    formatLearn(ctx.learning || []),
    '',
    'Regards,',
    ctx.instituteName,
  ].join('\n');
}

export function buildCombinedMessage(s: StudentRecipient, ctx: NotificationContext): string {
  const parts: string[] = [
    `${salutation(s)},`,
    '',
    `Update for your child ${s.student_name} (${ctx.dateLabel}).`,
  ];
  if (ctx.learning?.length) {
    parts.push('', 'Topics Learned Today:', formatLearn(ctx.learning));
  }
  if (ctx.homework?.length) {
    parts.push('', 'Homework Assigned:', formatHw(ctx.homework));
  }
  parts.push('', 'Regards,', ctx.instituteName);
  return parts.join('\n');
}

export function buildMessage(
  kind: NotificationKind,
  s: StudentRecipient,
  ctx: NotificationContext,
): string {
  if (kind === 'homework') return buildHomeworkMessage(s, ctx);
  if (kind === 'learning') return buildLearningMessage(s, ctx);
  return buildCombinedMessage(s, ctx);
}

// ---------------- Validation helpers ----------------

export function isValidMobile(m?: string | null): boolean {
  if (!m) return false;
  const digits = m.replace(/\D/g, '');
  return /^\d{10}$/.test(digits);
}

// ---------------- Provider abstraction ----------------

export interface SendResult {
  studentId: string;
  success: boolean;
  channel: NotificationChannel;
  provider: string;
  failureReason?: string;
}

export interface NotificationProvider {
  name: string;
  send(n: GeneratedNotification, channel: NotificationChannel): Promise<SendResult>;
}

class DevelopmentProvider implements NotificationProvider {
  name = 'development';
  async send(n: GeneratedNotification, channel: NotificationChannel): Promise<SendResult> {
    await new Promise(r => setTimeout(r, 40));
    if (!isValidMobile(n.parentMobile)) {
      return {
        studentId: n.studentId,
        success: false,
        channel,
        provider: this.name,
        failureReason: 'Invalid mobile number (must be exactly 10 digits)',
      };
    }
    return { studentId: n.studentId, success: true, channel, provider: this.name };
  }
}

class MSG91Provider implements NotificationProvider {
  name = 'msg91';
  async send(n: GeneratedNotification, channel: NotificationChannel): Promise<SendResult> {
    // Real REST call belongs in an edge function using:
    //   MSG91_AUTH_KEY, MSG91_SENDER_ID, MSG91_ROUTE,
    //   MSG91_TEMPLATE_HOMEWORK / _LEARNING / _BOTH, MSG91_BASE_URL
    // Until KYC is complete we degrade gracefully to the dev simulation.
    return new DevelopmentProvider().send(n, channel);
  }
}

const providers: Record<string, NotificationProvider> = {
  development: new DevelopmentProvider(),
  msg91: new MSG91Provider(),
};

export function getProvider(name?: string): NotificationProvider {
  const key = (name || (import.meta as any).env?.VITE_NOTIFICATION_PROVIDER || 'development').toLowerCase();
  return providers[key] || providers.development;
}

// ---------------- Queue ----------------

export interface SendProgress {
  total: number;
  done: number;
  current?: GeneratedNotification;
}

export async function sendInBatches(
  notifications: GeneratedNotification[],
  channel: NotificationChannel,
  onProgress: (p: SendProgress) => void,
  providerName?: string,
  batchSize = 10,
): Promise<SendResult[]> {
  const provider = getProvider(providerName);
  const results: SendResult[] = [];
  let done = 0;
  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async n => {
        const r = await provider.send(n, channel);
        done += 1;
        onProgress({ total: notifications.length, done, current: n });
        return r;
      }),
    );
    results.push(...batchResults);
  }
  return results;
}
