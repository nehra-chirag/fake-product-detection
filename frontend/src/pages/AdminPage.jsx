import { useState } from "react";
import { getContract } from "../utils/contract";

function AdminPage() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" | "error" | "info"
  const [loading, setLoading] = useState(false);
  const [isAlreadyApproved, setIsAlreadyApproved] = useState(false);

  const showStatus = (msg, type) => {
    setStatus(msg);
    setStatusType(type);
  };

  const validateAddress = (addr) => {
    if (!addr) return "Please enter a wallet address.";
    if (!addr.startsWith("0x")) return "Address must start with 0x.";
    if (addr.length !== 42) return "Address must be 42 characters long.";
    return null;
  };

  const checkIfApproved = async (addr) => {
    try {
      const contract = await getContract(false);
      const approved = await contract.isApprovedManufacturer(addr);
      setIsAlreadyApproved(approved);
      if (approved) {
        showStatus(
          "⚠️ This address is already an approved manufacturer.",
          "warning",
        );
      } else {
        showStatus("", "");
      }
    } catch (err) {
      // silently ignore check errors
    }
  };

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    setStatus("");
    if (val.length === 42) {
      checkIfApproved(val);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      showStatus(
        "❌ MetaMask not found. Please install MetaMask extension.",
        "error",
      );
      return false;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      return true;
    } catch (err) {
      showStatus(
        "❌ MetaMask connection rejected. Please allow access.",
        "error",
      );
      return false;
    }
  };

  const approveManufacturer = async () => {
    const validationError = validateAddress(address);
    if (validationError) {
      showStatus(`❌ ${validationError}`, "error");
      return;
    }

    if (isAlreadyApproved) {
      showStatus(
        "⚠️ This address is already an approved manufacturer.",
        "warning",
      );
      return;
    }

    const connected = await connectMetaMask();
    if (!connected) return;

    try {
      setLoading(true);
      showStatus("🔄 Sending approval transaction...", "info");

      const contract = await getContract(true);

      // Check if caller is admin
      const admin = await contract.admin();
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts[0].toLowerCase() !== admin.toLowerCase()) {
        showStatus(
          "❌ Only the admin wallet can approve manufacturers. Please switch to Admin account in MetaMask.",
          "error",
        );
        return;
      }

      const tx = await contract.approveManufacturer(address);
      showStatus("⏳ Waiting for blockchain confirmation...", "info");
      await tx.wait();
      showStatus("✅ Manufacturer approved successfully!", "success");
      setAddress("");
      setIsAlreadyApproved(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const revokeManufacturer = async () => {
    const validationError = validateAddress(address);
    if (validationError) {
      showStatus(`❌ ${validationError}`, "error");
      return;
    }

    if (!isAlreadyApproved) {
      showStatus(
        "⚠️ This address is not an approved manufacturer. Nothing to revoke.",
        "warning",
      );
      return;
    }

    const connected = await connectMetaMask();
    if (!connected) return;

    try {
      setLoading(true);
      showStatus("🔄 Sending revoke transaction...", "info");

      const contract = await getContract(true);

      // Check if caller is admin
      const admin = await contract.admin();
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts[0].toLowerCase() !== admin.toLowerCase()) {
        showStatus(
          "❌ Only the admin wallet can revoke manufacturers. Please switch to Admin account in MetaMask.",
          "error",
        );
        return;
      }

      const tx = await contract.revokeManufacturer(address);
      showStatus("⏳ Waiting for blockchain confirmation...", "info");
      await tx.wait();
      showStatus("✅ Manufacturer revoked successfully!", "success");
      setAddress("");
      setIsAlreadyApproved(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    if (err.message.includes("user rejected")) {
      showStatus(
        "❌ Transaction cancelled. You rejected the request in MetaMask.",
        "error",
      );
    } else if (err.message.includes("Only admin")) {
      showStatus("❌ Only the admin wallet can perform this action.", "error");
    } else if (err.message.includes("insufficient funds")) {
      showStatus(
        "❌ Insufficient Sepolia ETH. Please get more from the faucet.",
        "error",
      );
    } else if (err.message.includes("network")) {
      showStatus(
        "❌ Wrong network. Please switch MetaMask to Sepolia testnet.",
        "error",
      );
    } else {
      showStatus(`❌ Error: ${err.message}`, "error");
    }
  };

  const getStatusStyle = () => {
    const base = { ...styles.status };
    if (statusType === "success")
      return {
        ...base,
        backgroundColor: "#d4edda",
        color: "#155724",
        border: "1px solid #c3e6cb",
      };
    if (statusType === "error")
      return {
        ...base,
        backgroundColor: "#f8d7da",
        color: "#721c24",
        border: "1px solid #f5c6cb",
      };
    if (statusType === "warning")
      return {
        ...base,
        backgroundColor: "#fff3cd",
        color: "#856404",
        border: "1px solid #ffc107",
      };
    if (statusType === "info")
      return {
        ...base,
        backgroundColor: "#d1ecf1",
        color: "#0c5460",
        border: "1px solid #bee5eb",
      };
    return base;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔐 Admin Dashboard</h1>
      <p style={styles.subtitle}>Approve or revoke manufacturers</p>

      <div style={styles.card}>
        <label style={styles.label}>Manufacturer Wallet Address</label>
        <input
          style={{
            ...styles.input,
            borderColor: isAlreadyApproved ? "#ffc107" : "#ddd",
          }}
          type="text"
          placeholder="0x... (42 characters)"
          value={address}
          onChange={handleAddressChange}
        />

        {isAlreadyApproved && (
          <p style={styles.approvedBadge}>✅ Currently approved manufacturer</p>
        )}

        <div style={styles.buttonRow}>
          <button
            style={{
              ...styles.approveBtn,
              opacity: loading || !address ? 0.6 : 1,
              cursor: loading || !address ? "not-allowed" : "pointer",
            }}
            onClick={approveManufacturer}
            disabled={loading || !address}
          >
            {loading ? "Processing..." : "✅ Approve Manufacturer"}
          </button>
          <button
            style={{
              ...styles.revokeBtn,
              opacity: loading || !address ? 0.6 : 1,
              cursor: loading || !address ? "not-allowed" : "pointer",
            }}
            onClick={revokeManufacturer}
            disabled={loading || !address}
          >
            {loading ? "Processing..." : "❌ Revoke Manufacturer"}
          </button>
        </div>

        {status && <p style={getStatusStyle()}>{status}</p>}

        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>ℹ️ Instructions</p>
          <p style={styles.infoText}>
            1. Make sure MetaMask is on <strong>Sepolia</strong> network
          </p>
          <p style={styles.infoText}>
            2. Make sure you are on <strong>Admin</strong> account
          </p>
          <p style={styles.infoText}>
            3. Paste the manufacturer wallet address above
          </p>
          <p style={styles.infoText}>4. Click Approve or Revoke</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    fontSize: "32px",
    color: "#1a1a2e",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "40px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "600px",
    margin: "0 auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    marginBottom: "8px",
    boxSizing: "border-box",
  },
  approvedBadge: {
    color: "#856404",
    backgroundColor: "#fff3cd",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
  },
  approveBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  revokeBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  status: {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
  infoBox: {
    marginTop: "24px",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    borderLeft: "4px solid #1a1a2e",
  },
  infoTitle: {
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#1a1a2e",
  },
  infoText: {
    color: "#555",
    fontSize: "13px",
    marginBottom: "4px",
  },
};

export default AdminPage;
