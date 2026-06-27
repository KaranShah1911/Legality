import { ethers } from 'ethers';
import crypto from 'crypto';
import User from '../models/User.js';

export const verifyWallet = async (req, res) => {
  try {
    const { address, message, signature } = req.body;

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Check if user exists
    const user = await User.findOne({ walletAddress: address.toLowerCase() });
    
    if (user) {
      return res.json({ exists: true, user });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const signup = async (req, res) => {
  try {
    const { walletAddress, name, email, securityQuestions, message, signature } = req.body;

    // Verify signature to prove ownership before signup
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash security answers
    const hashedQuestions = securityQuestions.map(sq => {
      const hashedAnswer = crypto.createHash('sha256').update(sq.answer.toLowerCase().trim()).digest('hex');
      return { question: sq.question, hashedAnswer };
    });

    const newUser = new User({
      walletAddress: walletAddress.toLowerCase(),
      name,
      email,
      securityQuestions: hashedQuestions
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
