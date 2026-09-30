import mongoose from 'mongoose';

const merchantRuleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    merchantPattern: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure user doesn't have duplicate rules for the same merchant pattern
merchantRuleSchema.index({ userId: 1, merchantPattern: 1 }, { unique: true });

const MerchantRule = mongoose.model('MerchantRule', merchantRuleSchema);
export default MerchantRule;
