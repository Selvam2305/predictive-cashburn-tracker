import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Food',
        'Travel',
        'Subscriptions',
        'Utilities',
        'Shopping',
        'Transfers & Friend Loans',
        'General',
      ],
      default: 'General',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    protocol: {
      type: String,
      enum: ['P2P', 'P2M', 'DIRECT'],
      default: 'DIRECT',
    },
    isNeedsReview: {
      type: Boolean,
      default: false,
    },
    suggestedCategory: {
      type: String,
      default: '',
    },
    confidence: {
      type: Number,
      default: 1.0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast time-series queries (O(log N) retrieval)
expenseSchema.index({ userId: 1, timestamp: -1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
