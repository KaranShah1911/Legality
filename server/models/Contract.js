import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema({
  contractId: {
    type: String,
    required: true,
    unique: true
  },
  buyerWallet: {
    type: String,
    required: true
  },
  sellerWallet: {
    type: String
  },
  templateType: {
    type: String,
    required: true
  },
  formData: {
    type: Object,
    required: true
  },
  pdfUrl: {
    type: String
  },
  hash: {
    type: String
  },
  finalHash: {
    type: String
  },
  txHash: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Contract', ContractSchema);
