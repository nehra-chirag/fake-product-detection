import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getContract } from "../utils/contract";

function ManufacturerPage() {
  const [form, setForm] = useState({
    productId: "",
    name: "",
    batchNumber: "",
    manufacturingDate: "",
    description: "",
  });
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [registeredProducts, setRegisteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [activeTab, setActiveTab] = useState("register");

  const showStatus = (msg, type) => {
    setStatus(msg);
    setStatusType(type);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.productId) return "Product ID is required.";
    if (!form.name) return "Product Name is required.";
    if (!form.batchNumber) return "Batch Number is required.";
    if (!form.manufacturingDate) return "Manufacturing Date is required.";
    if (!form.description) return "Description is required.";
    return null;
  };

  const registerProduct = async () => {
    const validationError = validateForm();
    if (validationError) {
      showStatus(`❌ ${validationError}`, "error");
      return;
    }
    if (!window.ethereum) {
      showStatus("❌ MetaMask not found. Please install MetaMask.", "error");
      return;
    }
    try {
      setLoading(true);
      setQrValue("");
      showStatus("🔄 Connecting to MetaMask...", "info");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const contract = await getContract(true);
      const existing = await contract.verifyProduct(form.productId);
      if (existing.exists) {
        showStatus(
          "❌ Product ID already exists! Please use a different Product ID.",
          "error",
        );
        return;
      }
      showStatus("🔄 Sending transaction...", "info");
      const tx = await contract.registerProduct(
        form.productId,
        form.name,
        form.batchNumber,
        form.manufacturingDate,
        form.description,
      );
      showStatus("⏳ Waiting for blockchain confirmation...", "info");
      await tx.wait();
      const verifyUrl = `${window.location.origin}/verify/${form.productId}`;
      setQrValue(verifyUrl);
      showStatus("✅ Product registered successfully!", "success");
    } catch (err) {
      if (err.message.includes("Product ID already exists")) {
        showStatus(
          "❌ Product ID already exists! Please use a different ID.",
          "error",
        );
      } else if (err.message.includes("Not an approved manufacturer")) {
        showStatus(
          "❌ Your wallet is not an approved manufacturer. Contact admin.",
          "error",
        );
      } else if (err.message.includes("user rejected")) {
        showStatus(
          "❌ Transaction cancelled. You rejected the request.",
          "error",
        );
      } else if (err.message.includes("insufficient funds")) {
        showStatus(
          "❌ Insufficient Sepolia ETH. Please get more from the faucet.",
          "error",
        );
      } else {
        showStatus(`❌ Error: ${err.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMyProducts = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }
    try {
      setLoadingProducts(true);
      setRegisteredProducts([]);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const contract = await getContract(true);
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const productIds = await contract.getManufacturerProducts(accounts[0]);
      const productDetails = await Promise.all(
        productIds.map(async (id) => {
          const p = await contract.verifyProduct(id);
          return {
            productId: id.toString(),
            name: p.name,
            batchNumber: p.batchNumber,
            manufacturingDate: p.manufacturingDate,
            description: p.description,
          };
        }),
      );
      setRegisteredProducts(productDetails);
    } catch (err) {
      alert(`Error loading products: ${err.message}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector("#qr-code-box svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 50, 50, 200, 200);
      const link = document.createElement("a");
      link.download = `product-${form.productId}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
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
      <h1 style={styles.title}>🏭 Manufacturer Dashboard</h1>
      <p style={styles.subtitle}>
        Register products and view your registered products
      </p>

      {/* Tabs */}
      <div style={styles.tabRow}>
        <button
          style={activeTab === "register" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("register")}
        >
          📦 Register Product
        </button>
        <button
          style={activeTab === "myproducts" ? styles.tabActive : styles.tab}
          onClick={() => {
            setActiveTab("myproducts");
            loadMyProducts();
          }}
        >
          📋 My Products
        </button>
      </div>

      {/* Register Tab */}
      {activeTab === "register" && (
        <div style={styles.card}>
          {[
            {
              field: "productId",
              label: "Product ID (number)",
              type: "number",
              placeholder: "e.g. 1001",
            },
            {
              field: "name",
              label: "Product Name",
              type: "text",
              placeholder: "e.g. Nike Air Max",
            },
            {
              field: "batchNumber",
              label: "Batch Number",
              type: "text",
              placeholder: "e.g. B-2024",
            },
            {
              field: "manufacturingDate",
              label: "Manufacturing Date",
              type: "text",
              placeholder: "e.g. 01-01-2024",
            },
            {
              field: "description",
              label: "Description",
              type: "text",
              placeholder: "e.g. Sports Shoes Size 10",
            },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field} style={styles.fieldGroup}>
              <label style={styles.label}>{label}</label>
              <input
                style={styles.input}
                type={type}
                name={field}
                placeholder={placeholder}
                value={form[field]}
                onChange={handleChange}
              />
            </div>
          ))}

          <button
            style={{
              ...styles.registerBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={registerProduct}
            disabled={loading}
          >
            {loading ? "Processing..." : "📦 Register Product"}
          </button>

          {status && <p style={getStatusStyle()}>{status}</p>}

          {qrValue && (
            <div style={styles.qrContainer}>
              <div style={styles.qrDivider} />
              <h3 style={styles.qrTitle}>📱 Product QR Code</h3>
              <p style={styles.qrSubtitle}>
                Download and print this on the product packaging
              </p>
              <div id="qr-code-box" style={styles.qrBox}>
                <QRCodeSVG value={qrValue} size={200} />
              </div>
              <button style={styles.downloadBtn} onClick={handleDownloadQR}>
                ⬇️ Download QR Code
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Products Tab */}
      {activeTab === "myproducts" && (
        <div style={styles.card}>
          <div style={styles.myProductsHeader}>
            <h3 style={styles.myProductsTitle}>📋 My Registered Products</h3>
            <button style={styles.refreshBtn} onClick={loadMyProducts}>
              🔄 Refresh
            </button>
          </div>

          {loadingProducts && (
            <p style={styles.loadingText}>
              🔄 Loading your products from blockchain...
            </p>
          )}

          {!loadingProducts && registeredProducts.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📭</p>
              <p style={styles.emptyText}>No products registered yet.</p>
              <p style={styles.emptySubText}>
                Switch to Register tab to add your first product.
              </p>
            </div>
          )}

          {!loadingProducts && registeredProducts.length > 0 && (
            <div>
              <p style={styles.productCount}>
                Total: <strong>{registeredProducts.length} product(s)</strong>
              </p>
              {registeredProducts.map((product) => (
                <div key={product.productId} style={styles.productCard}>
                  <div style={styles.productHeader}>
                    <span style={styles.productName}>{product.name}</span>
                    <span style={styles.productId}>
                      ID: {product.productId}
                    </span>
                  </div>
                  <div style={styles.productDetails}>
                    <div style={styles.productRow}>
                      <span style={styles.productLabel}>Batch Number</span>
                      <span style={styles.productValue}>
                        {product.batchNumber}
                      </span>
                    </div>
                    <div style={styles.productRow}>
                      <span style={styles.productLabel}>
                        Manufacturing Date
                      </span>
                      <span style={styles.productValue}>
                        {product.manufacturingDate}
                      </span>
                    </div>
                    <div style={styles.productRow}>
                      <span style={styles.productLabel}>Description</span>
                      <span style={styles.productValue}>
                        {product.description}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "32px",
  },
  tabRow: {
    display: "flex",
    maxWidth: "600px",
    margin: "0 auto 24px auto",
    gap: "12px",
  },
  tab: {
    flex: 1,
    padding: "12px",
    backgroundColor: "white",
    color: "#1a1a2e",
    border: "2px solid #1a1a2e",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
  },
  tabActive: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#1a1a2e",
    color: "white",
    border: "2px solid #1a1a2e",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "600px",
    margin: "0 auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  fieldGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },
  registerBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#1a1a2e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    marginTop: "8px",
  },
  status: {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
  qrContainer: {
    marginTop: "24px",
    textAlign: "center",
  },
  qrDivider: {
    borderTop: "1px solid #eee",
    marginBottom: "24px",
  },
  qrTitle: {
    fontSize: "20px",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  qrSubtitle: {
    color: "#666",
    marginBottom: "20px",
    fontSize: "14px",
  },
  qrBox: {
    display: "inline-block",
    padding: "16px",
    backgroundColor: "white",
    border: "2px solid #1a1a2e",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  downloadBtn: {
    padding: "12px 32px",
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
  },
  myProductsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  myProductsTitle: {
    fontSize: "18px",
    color: "#1a1a2e",
  },
  refreshBtn: {
    padding: "8px 16px",
    backgroundColor: "#f0f4f8",
    color: "#1a1a2e",
    border: "1px solid #1a1a2e",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    padding: "20px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "8px",
  },
  emptySubText: {
    fontSize: "14px",
    color: "#888",
  },
  productCount: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "16px",
  },
  productCard: {
    border: "1px solid #eee",
    borderRadius: "10px",
    marginBottom: "16px",
    overflow: "hidden",
  },
  productHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    padding: "12px 16px",
  },
  productName: {
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
  },
  productId: {
    color: "#aaa",
    fontSize: "13px",
  },
  productDetails: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
  },
  productRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    paddingBottom: "8px",
    borderBottom: "1px solid #eee",
  },
  productLabel: {
    fontSize: "13px",
    color: "#888",
  },
  productValue: {
    fontSize: "13px",
    color: "#333",
    fontWeight: "bold",
  },
};

export default ManufacturerPage;
