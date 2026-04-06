import { ethers } from "ethers";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const ABI = [
  "function approveManufacturer(address _manufacturer) public",
  "function revokeManufacturer(address _manufacturer) public",
  "function registerProduct(uint256 _productId, string memory _name, string memory _batchNumber, string memory _manufacturingDate, string memory _description) public",
  "function verifyProduct(uint256 _productId) public view returns (string memory name, string memory batchNumber, string memory manufacturingDate, string memory description, address manufacturer, bool exists)",
  "function getManufacturerProducts(address _manufacturer) public view returns (uint256[] memory)",
  "function isApprovedManufacturer(address _manufacturer) public view returns (bool)",
  "function admin() public view returns (address)",
];

// Public RPC for read-only calls — works on phone without MetaMask
const PUBLIC_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to public RPC for phones without MetaMask
  return new ethers.JsonRpcProvider(PUBLIC_RPC);
};

export const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
};

export const getContract = async (withSigner = false) => {
  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }
  // Read-only — works on phone too
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
};
