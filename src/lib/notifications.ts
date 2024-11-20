import mailchimp from '@mailchimp/mailchimp_marketing';

type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

interface NotificationOptions {
  subject: string;
  context: string;
  priority?: NotificationPriority;
  error?: any;
  metadata?: any;
}

export async function sendNotification({
  subject,
  context,
  priority = 'medium',
  error,
  metadata
}: NotificationOptions) {
  try {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    const priorityColors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#f44336',
      critical: '#b71c1c'
    };

    const html = `
      <div style="font-family: sans-serif;">
        <h1 style="color: ${priorityColors[priority]};">${subject}</h1>
        <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
        <p><strong>Context:</strong> ${context}</p>
        ${error ? `
          <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid ${priorityColors[priority]};">
            <p><strong>Error:</strong> ${error.message}</p>
            <p><strong>Stack:</strong></p>
            <pre style="overflow-x: auto;">${error.stack}</pre>
          </div>
        ` : ''}
        ${metadata ? `
          <div style="margin-top: 20px;">
            <p><strong>Additional Information:</strong></p>
            <pre style="background: #f5f5f5; padding: 15px; overflow-x: auto;">
              ${JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        ` : ''}
        <p style="color: #666; margin-top: 30px;">
          Sent from Bitcoin Brainiac Newsletter System
        </p>
      </div>
    `;

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
