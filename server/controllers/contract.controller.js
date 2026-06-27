import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import Contract from '../models/Contract.js';
import User from '../models/User.js';
import { generatePDFAndHash } from '../utils/pdfGenerator.js';

export const createContract = async (req, res) => {
  try {
    const { buyerWallet, templateType, formData, securityAnswers } = req.body;
    
    // Ensure buyer exists
    const user = await User.findOne({ walletAddress: buyerWallet.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!securityAnswers || securityAnswers.length !== user.securityQuestions.length) {
      return res.status(400).json({ error: 'Please answer all security questions to proceed.' });
    }

    let isAnswersValid = true;
    for (let i=0; i<securityAnswers.length; i++) {
      const hashedAns = crypto.createHash('sha256').update(securityAnswers[i].answer.toLowerCase().trim()).digest('hex');
      if (hashedAns !== user.securityQuestions[i].hashedAnswer) {
        isAnswersValid = false;
      }
    }
    if (!isAnswersValid) {
      return res.status(400).json({ error: 'Security answers incorrect' });
    }

    // Generate Initial PDF and Hash
    const { hash, pdfUrl } = await generatePDFAndHash(templateType, formData, false, null, buyerWallet.toLowerCase());

    const newContract = new Contract({
      contractId: uuidv4(),
      buyerWallet: buyerWallet.toLowerCase(),
      templateType,
      formData,
      pdfUrl,
      hash,
      status: 'Pending'
    });

    await newContract.save();
    res.status(201).json({ message: 'Contract created successfully', contract: newContract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getContracts = async (req, res) => {
  try {
    const { walletAddress } = req.query;
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress required' });
    
    const contracts = await Contract.find({
      $or: [
        { buyerWallet: walletAddress.toLowerCase() },
        { sellerWallet: walletAddress.toLowerCase() }
      ]
    }).sort({ createdAt: -1 });

    res.json({ contracts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const sendContract = async (req, res) => {
  try {
    const { contractId, sellerWallet } = req.body;
    
    const contract = await Contract.findOne({ contractId });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    contract.sellerWallet = sellerWallet.toLowerCase();
    await contract.save();

    res.json({ message: 'Contract sent to seller', contract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const signContract = async (req, res) => {
  try {
    const { contractId, signature, message, sellerWallet, securityAnswers } = req.body;
    
    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== sellerWallet.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    const contract = await Contract.findOne({ contractId });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    if (contract.sellerWallet !== sellerWallet.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized seller' });
    }

    // Optionally check security answers if needed
    const seller = await User.findOne({ walletAddress: sellerWallet.toLowerCase() });
    if (!seller) return res.status(404).json({ error: 'Seller account not found' });

    if (!securityAnswers || securityAnswers.length !== seller.securityQuestions.length) {
      return res.status(400).json({ error: 'Please answer all security questions to proceed.' });
    }

    let isAnswersValid = true;
    for (let i=0; i<securityAnswers.length; i++) {
      const hashedAns = crypto.createHash('sha256').update(securityAnswers[i].answer.toLowerCase().trim()).digest('hex');
      if (hashedAns !== seller.securityQuestions[i].hashedAnswer) {
        isAnswersValid = false;
      }
    }
    if (!isAnswersValid) {
      return res.status(400).json({ error: 'Security answers incorrect' });
    }

    // Generate Final Signed PDF
    const signatureData = { sellerWallet, signature };
    const { hash: finalHash, pdfUrl: finalPdfUrl } = await generatePDFAndHash(contract.templateType, contract.formData, true, signatureData, contract.buyerWallet);

    contract.finalHash = finalHash;
    contract.pdfUrl = finalPdfUrl; // Update to the new signed PDF URL
    contract.status = 'Completed';
    await contract.save();

    res.json({ message: 'Contract signed successfully', contract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const storeHash = async (req, res) => {
  try {
    const { contractId, txHash } = req.body;
    
    const contract = await Contract.findOne({ contractId });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    contract.txHash = txHash;
    await contract.save();

    res.json({ message: 'Transaction hash recorded', contract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
