import mongoose from 'mongoose';

const ErrorLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  error: String,
  context: String,
  stack: String
}, {
  timestamps: true
});

export default mongoose.models.ErrorLog || mongoose.model('ErrorLog', ErrorLogSchema);
