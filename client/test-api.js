import axios from 'axios';
import { ethers } from 'ethers';

async function test() {
  try {
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    const message = "Sign in to Legality with wallet: " + address + "\nTimestamp: " + Date.now();
    const signature = await wallet.signMessage(message);

    console.log("Testing POST /api/auth/verify-wallet");
    const res = await axios.post('http://localhost:5000/api/auth/verify-wallet', {
      address, message, signature
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("Error Response Data:", err.response.data);
      console.error("Error Status:", err.response.status);
    } else {
      console.error("Error:", err.message);
    }
  }
}

test();
