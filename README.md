# 🛡️ FakeGuard — Blockchain Based Fake Product Detection System

A decentralized application (DApp) built on Ethereum blockchain that allows manufacturers to register products and customers to verify product authenticity by scanning a QR code.

---

## 📌 Project Overview

Counterfeit products are a massive problem globally — fake medicines, branded goods, spare parts, and food products cause harm to consumers every year. FakeGuard solves this by recording product information on the blockchain, making it **immutable**, **transparent**, and **verifiable by anyone**.

---

## 🎯 Features

- ✅ **Admin Dashboard** — Approve or revoke manufacturer wallets
- ✅ **Manufacturer Dashboard** — Register products on blockchain and download QR codes
- ✅ **My Products** — View all products registered by the connected wallet
- ✅ **Verify Page** — Search by Product ID or scan QR code to verify authenticity
- ✅ **Genuine/Fake Detection** — Instant result with product details or fake alert
- ✅ **Error Handling** — Clean, user-friendly error messages throughout

---

## 🛠️ Tech Stack

| Layer              | Technology               |
| ------------------ | ------------------------ |
| Smart Contract     | Solidity ^0.8.20         |
| Blockchain Network | Ethereum Sepolia Testnet |
| Frontend           | React.js + Vite          |
| Wallet Integration | MetaMask + Ethers.js v6  |
| QR Code            | qrcode.react             |
| Routing            | React Router DOM         |
| Dev Environment    | Hardhat                  |
| Deployment         | Vercel (Frontend)        |

---

## 🏗️ Project Structure

```
fake-product-detection/
│
├── blockchain/
│   ├── contracts/
│   │   └── ProductRegistry.sol       # Main smart contract
│   ├── scripts/
│   │   └── deploy.js                 # Deployment script
│   ├── test/
│   │   └── ProductRegistry.test.js   # Contract tests
│   ├── hardhat.config.js
│   ├── .env                          # RPC URL + Private Key (not pushed)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx         # Approve/revoke manufacturers
│   │   │   ├── ManufacturerPage.jsx  # Register products + QR
│   │   │   └── VerifyPage.jsx        # Verify product authenticity
│   │   ├── utils/
│   │   │   └── contract.js           # ABI + contract connection
│   │   ├── App.jsx                   # Routing
│   │   └── main.jsx
│   ├── .env                          # Contract address (not pushed)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 👥 Roles in the System

| Role             | Permissions                                         |
| ---------------- | --------------------------------------------------- |
| **Admin**        | Deploy contract, approve/revoke manufacturers       |
| **Manufacturer** | Register products, view own products, download QR   |
| **Customer**     | Scan QR or search Product ID to verify authenticity |

---

## ⚙️ How It Works

```
MANUFACTURER SIDE
1. Admin approves manufacturer wallet
2. Manufacturer fills product details
3. Product registered on Ethereum blockchain
4. QR code generated and downloaded
5. QR printed on physical product packaging

CUSTOMER SIDE
1. Customer scans QR code on product
2. Browser opens verify page automatically
3. Smart contract queried for product details
4. GENUINE ✅ — shows all product details
   FAKE ❌    — shows warning alert
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Git

### 1. Clone the Repository

```bash
git clone url
cd fake-product-detection
```

### 2. Set Up Blockchain

```bash
cd blockchain
npm install
```

Create `.env` file in `blockchain/` folder:

```
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
PRIVATE_KEY=your-admin-wallet-private-key
```

### 3. Compile and Deploy Smart Contract

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract address from the terminal output.

### 4. Set Up Frontend

```bash
cd ../frontend
npm install
```

Create `.env` file in `frontend/` folder:

```
VITE_CONTRACT_ADDRESS=your-deployed-contract-address
```

### 5. Run Frontend

```bash
npm run dev
```

Open browser and go to `https://localhost:5173`

---

## 🔑 MetaMask Setup

1. Install MetaMask from `metamask.io`
2. Create two wallets — **Admin** and **Manufacturer**
3. Switch to **Sepolia testnet**
4. Get free Sepolia ETH from `cloud.google.com/application/web3/faucet/ethereum/sepolia`

---

## 📱 Demo Flow

### Step 1 — Approve Manufacturer

- Connect Admin wallet in MetaMask
- Go to Admin Dashboard
- Paste Manufacturer wallet address
- Click Approve Manufacturer

### Step 2 — Register Product

- Switch to Manufacturer wallet in MetaMask
- Go to Manufacturer Dashboard
- Fill product details and click Register Product
- Download the generated QR code

### Step 3 — Verify Product

- Go to Verify page
- Enter Product ID OR scan the QR code
- See GENUINE ✅ or FAKE ❌ result instantly

---

## 📜 Smart Contract Functions

| Function                           | Access                 | Description                      |
| ---------------------------------- | ---------------------- | -------------------------------- |
| `approveManufacturer(address)`     | Admin only             | Approve a manufacturer wallet    |
| `revokeManufacturer(address)`      | Admin only             | Revoke a manufacturer wallet     |
| `registerProduct(...)`             | Approved manufacturers | Register a new product           |
| `verifyProduct(productId)`         | Public                 | Verify product authenticity      |
| `getManufacturerProducts(address)` | Public                 | Get all products by manufacturer |
| `isApprovedManufacturer(address)`  | Public                 | Check if address is approved     |

---

## 🔒 Security Features

- Only admin can approve manufacturers
- Only approved manufacturers can register products
- Product records are immutable once registered
- No central authority controls the data
- All transactions are publicly verifiable on Etherscan

---

## 📄 License

This project is built for educational purposes as part of a Blockchain Technology course project.

---
