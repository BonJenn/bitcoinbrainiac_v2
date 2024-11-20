export interface ErrorLog {
  _id: string;
  timestamp: Date;
  error: string;
  context: string;
  stack?: string;
  metadata?: string;
  environment: string;
}
