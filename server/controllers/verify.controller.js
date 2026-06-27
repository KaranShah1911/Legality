import crypto from 'crypto';
import Contract from '../models/Contract.js';

export const verifyContract = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    // Compute SHA-256 of the uploaded file buffer
    const uploadedHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    // Search DB for a contract matching either the pre-sign hash or the final hash
    const contract = await Contract.findOne({
      $or: [
        { hash: uploadedHash },
        { finalHash: uploadedHash }
      ]
    });

    if (!contract) {
      return res.json({
        verified: false,
        uploadedHash,
        message: 'No matching contract found in the database for this PDF.'
      });
    }

    res.json({
      verified: true,
      uploadedHash,
      contract: {
        contractId: contract.contractId,
        templateType: contract.templateType,
        buyerWallet: contract.buyerWallet,
        sellerWallet: contract.sellerWallet,
        status: contract.status,
        txHash: contract.txHash,
        createdAt: contract.createdAt
      },
      isFinalSigned: contract.finalHash === uploadedHash,
      message: contract.finalHash === uploadedHash
        ? 'This is the final signed & blockchain-verified contract.'
        : 'This is the original unsigned draft of the contract.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
