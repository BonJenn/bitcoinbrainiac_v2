import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema({
  id: String,
  title: String,
  subtitle: String,
  content: String,
  sentAt: Date,
  bitcoinPrice: Number,
  priceChange: Number,
}, {
  timestamps: true
});

export default mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);