import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  module: { type: String, required: true },
  action: { type: String, enum: ['create', 'update', 'status_change', 'report'], required: true },
  triggeredBy: { type: String, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  sentAt: Date,
  errorMessage: String
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);