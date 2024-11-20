import mailchimp from '@mailchimp/mailchimp_marketing';
import templates from './templates';
import { checkRateLimit, getRateLimitKey } from './rateLimiter';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

interface NotificationOptions {
  subject: string;
  context: string;
  template?: keyof typeof templates;
  priority?: NotificationPriority;
  error?: any;
  metadata?: any;
}

const RATE_LIMITS = {
  low: { maxCalls: 10, timeWindow: 3600000 }, // 1 hour
  medium: { maxCalls: 20, timeWindow: 3600000 },
  high: { maxCalls: 30, timeWindow: 3600000 },
  critical: { maxCalls: 50, timeWindow: 3600000 }
};

export async function sendNotification({
  subject,
  context,
  template = 'errorAlert',
  priority = 'medium',
  error,
  metadata
}: NotificationOptions) {
  try {
    const rateLimitKey = getRateLimitKey(context, priority);
    const { maxCalls, timeWindow } = RATE_LIMITS[priority];

    if (!checkRateLimit(rateLimitKey, maxCalls, timeWindow)) {
      console.log(`Rate limit exceeded for ${rateLimitKey}`);
      return;
    }

    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    const templateData = {
      subject,
      context,
      priority,
      error,
      ...metadata
    };

    const html = templates[template](templateData);

    await mailchimp.messages.send({
      message: {
        subject: `[${priority.toUpperCase()}] ${subject}`,
        html,
        from_email: process.env.MAILCHIMP_REPLY_TO!,
        to: [{ email: process.env.ADMIN_EMAIL! }]
      }
    });
  } catch (notifyError) {
    console.error('Failed to send notification:', notifyError);
  }
}
