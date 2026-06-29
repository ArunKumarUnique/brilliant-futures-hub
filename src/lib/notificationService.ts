/**
 * Notification Service – abstraction layer.
 *
 * Today this only generates messages (templates) and simulates sending.
 * Tomorrow a real provider (MSG91 / TextLocal / Twilio / Exotel)
 * can be plugged in by swapping `sendNotification` without touching any UI.
 */

export interface StudentRecipient {
  id: string;
  student_name: string;
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
  dateLabel: string; // e.g. "29 Jun 2026"
  homework?: HomeworkItem[];
  learning?: LearningItem[];
}

export interface GeneratedNotification {
  studentId: string;
  studentName: string;
  parentMobile?: string | null;
  message: string;
}

export type NotificationKind = 'homework' | 'learning' | 'both';

const salutation = (s: StudentRecipient) => {
  const parent = s.parent_name?.trim();
  const rel = (s.parent_relation || '').trim();
  if (parent) {
    if (rel && rel.toLowerCase() !== 'other') return `Dear ${rel} (${parent})`;
    return `Dear ${parent}`;
  }
  return 'Dear Sir/Madam';
};

const homeworkBlock = (items: HomeworkItem[]) => {
  if (!items.length) return '';
  return items.map((h) => {
    const lines = [`Title: ${h.title}`];
    if (h.description) lines.push(`Homework: ${h.description}`);
    if (h.due_date) lines.push(`Due Date: ${h.due_date}`);
    return lines.join('\n');
  }).join('\n\n');
};

const learningBlock = (items: LearningItem[]) => {
  if (!items.length) return '';
  return items.map((l) => {
    const lines: string[] = [];
    if (l.title) lines.push(`Title: ${l.title}`);
    lines.push(`Topics Covered: ${l.topics}`);
    return lines.join('\n');
  }).join('\n\n');
};

export function generateHomeworkNotification(
  student: StudentRecipient,
  ctx: NotificationContext,
): string {
  const hw = ctx.homework || [];
  const child = student.student_name;
  return [
    `${salutation(student)},`,
    '',
    `Your child ${child} has been assigned the following homework on ${ctx.dateLabel}.`,
    '',
    homeworkBlock(hw) || 'No homework assigned.',
    '',
    'Regards,',
    ctx.instituteName,
  ].join('\n');
}

export function generateLearningNotification(
  student: StudentRecipient,
  ctx: NotificationContext,
): string {
  const learn = ctx.learning || [];
  const child = student.student_name;
  return [
    `${salutation(student)},`,
    '',
    `Your child ${child} has learned the following topics on ${ctx.dateLabel}.`,
    '',
    learningBlock(learn) || 'No learnings recorded.',
    '',
    'Regards,',
    ctx.instituteName,
  ].join('\n');
}

export function generateCombinedNotification(
  student: StudentRecipient,
  ctx: NotificationContext,
): string {
  const hw = ctx.homework || [];
  const learn = ctx.learning || [];
  const child = student.student_name;
  const parts: string[] = [
    `${salutation(student)},`,
    '',
    `Update for your child ${child} on ${ctx.dateLabel}.`,
  ];
  if (learn.length) {
    parts.push('', 'Topics Learned Today:', learningBlock(learn));
  }
  if (hw.length) {
    parts.push('', 'Homework Assigned:', homeworkBlock(hw));
  }
  if (!learn.length && !hw.length) {
    parts.push('', 'No homework or learnings recorded today.');
  }
  parts.push('', 'Regards,', ctx.instituteName);
  return parts.join('\n');
}

export function generateNotification(
  kind: NotificationKind,
  student: StudentRecipient,
  ctx: NotificationContext,
): string {
  if (kind === 'homework') return generateHomeworkNotification(student, ctx);
  if (kind === 'learning') return generateLearningNotification(student, ctx);
  return generateCombinedNotification(student, ctx);
}

export interface SendResult {
  studentId: string;
  success: boolean;
  channel: 'simulated' | 'sms' | 'whatsapp';
  info?: string;
}

/**
 * Simulated send. Future providers (MSG91 / Twilio / TextLocal / Exotel)
 * should implement this same signature.
 */
export async function sendNotification(
  notification: GeneratedNotification,
): Promise<SendResult> {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 50));
  // eslint-disable-next-line no-console
  console.info('[NotificationService] (simulated) send →', notification.studentName);
  return {
    studentId: notification.studentId,
    success: true,
    channel: 'simulated',
    info: 'Simulated send – no SMS provider configured yet.',
  };
}

export async function sendBulkNotifications(
  notifications: GeneratedNotification[],
): Promise<SendResult[]> {
  return Promise.all(notifications.map(sendNotification));
}
