# Legality ⚖️🔗

Legality is a decentralized, blockchain-backed application designed to create, sign, store, and verify legal contracts with absolute cryptographic certainty. 

By leveraging the **Ethereum Sepolia Testnet** for immutable record-keeping and **EIP-191 signatures** for cryptographically verifying user consent, Legality bridges the gap between traditional legal agreements and Web3 trustless architecture. The platform generates PDFs of contracts, hashes them, and stores the hash on-chain, ensuring that a document cannot be altered post-signing without detection.

### Core Features
- **Web3 Authentication:** Users authenticate seamlessly using their Ethereum wallets via Wagmi and RainbowKit.
- **Smart Contract Integration:** Contract hashes are permanently stored on the Sepolia testnet.
- **Document Generation & Storage:** PDFs are automatically generated via Puppeteer, securely stored, and their cryptographic hashes are verified on-chain.
- **Cryptographic Signatures:** Parties sign documents using EIP-191 standard wallet signatures, proving intent without exposing private keys.
- **Verification Portal:** Anyone can upload a contract PDF to instantly verify its authenticity against the blockchain ledger.

---

## 📂 Folder Structure

The project is structured as a full-stack monorepo:

```text
Legality/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, etc.)
│   │   ├── context/        # React Context providers (Theme, etc.)
│   │   ├── pages/          # Application routes (Home, Dashboard, CreateContract, etc.)
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx         # Main React component and Routing (AuthGuard)
│   │   └── main.jsx        # Entry point with Wagmi/RainbowKit providers
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── vite.config.js      # Vite bundler configuration
│
├── server/                 # Backend Node.js / Express API
│   ├── controllers/        # Business logic for routes
│   ├── models/             # MongoDB Mongoose schemas (Users, Contracts)
│   ├── routes/             # API route definitions (auth, contracts, verify)
│   ├── uploads/            # Local storage for generated PDF contracts
│   ├── utils/              # Server utilities
│   ├── index.js            # Express server entry point
│   ├── .env                # Server environment variables (MongoDB URI, etc.)
│   └── package.json        # Backend dependencies
│
├── contracts/              # Solidity Smart Contracts
│   └── LegalityStorage.sol # The core smart contract deployed on Sepolia
│
├── .gitignore              # Root-level git ignore rules
└── README.md               # Project documentation
```

---

## 🚀 How to Run the Project (Waking it up)

To run the complete application locally, you will need to start both the frontend client and the backend server.

### Prerequisites
- Node.js installed
- MongoDB instance running (local or Atlas)
- Metamask (or any Web3 wallet) configured for the Sepolia Testnet

### 1. Start the Backend Server

Open a terminal window and navigate to the `server` directory:

```bash
cd server

# Install dependencies (only needed the first time)
npm install

# Start the development server (uses nodemon)
npm run dev
```
*The server will start running on `http://localhost:5000` and connect to MongoDB.*

### 2. Start the Frontend Client

Open a **new** separate terminal window and navigate to the `client` directory:

```bash
cd client

# Install dependencies (only needed the first time)
npm install

# Start the Vite development server
npm run dev
```
*The client will start running. Open the provided `localhost` URL (usually `http://localhost:5173`) in your browser.*

### 3. Smart Contract Deployment (Optional)
If you need to redeploy the smart contract or run a local blockchain, navigate to the `contracts/` folder and use Hardhat/Foundry commands. Otherwise, the frontend is already configured to point to the deployed contract on the Sepolia network.
