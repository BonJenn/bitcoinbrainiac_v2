import { connectToDatabase } from './db';
import ErrorLog from '@/app/api/cron/newsletter/error-log';
import { sendNotification } from './notifications';

export async function logError(error: any, context: string, metadata?: any) {
  const errorLog = {
    timestamp: new Date(),
    error: error.message,
    context,
    stack: error.stack,
    metadata: JSON.stringify(metadata || {}),
    environment: process.env.NODE_ENV
  };

  try {
    await connectToDatabase();
    await ErrorLog.create(errorLog);
    
    if (process.env.NODE_ENV === 'production') {
      const priority = error.message.toLowerCase().includes('critical') ? 'critical' : 'high';
      
      await sendNotification({
        subject: `System Error - ${context}`,
        context,
        priority,
        error,
        metadata
      });
    }
    
    console.error(`[${context}] Error:`, {
      message: error.message,
      stack: error.stack,
      metadata
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}
