import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  content: { type: String, required: true },
  sentAt: { type: Date, required: true },
  bitcoinPrice: { type: Number, required: true },
  priceChange: { type: Number, required: true },
  campaignId: { type: String }
}, {
  timestamps: true
});

// Add pre-save middleware for logging
newsletterSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = new mongoose.Types.ObjectId().toString();
  }
  console.log('Attempting to save newsletter:', this);
  next();
});

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;