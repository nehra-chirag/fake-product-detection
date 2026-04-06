import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContract } from "../utils/contract";

function VerifyPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (productId && productId !== "0") {
      setSearchId(productId);
      verifyProduct(productId);
    }
  }, [productId]);

  const verifyProduct = async (id) => {
    try {
      setLoading(true);
      setError("");
      setProduct(null);
      setSearched(true);
      const contract = await getContract(false);
      const result = await contract.verifyProduct(id);
      if (result.exists) {
        setProduct({
          name: result.name,
          batchNumber: result.batchNumber,
          manufacturingDate: result.manufacturingDate,
          description: result.description,
          manufacturer: result.manufacturer,
        });
      } else {
        setError("fake");
      }
    } catch (err) {
      setError("fake");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchId.trim()) return;
    navigate(`/verify/${searchId.trim()}`);
    verifyProduct(searchId.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleReset = () => {
    setSearchId("");
    setProduct(null);
    setError("");
    setSearched(false);
    navigate("/verify/0");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔍 Product Verification</h1>
      <p style={styles.subtitle}>
        Enter a Product ID or scan a QR code to verify authenticity
      </p>

      {/* Search Box */}
      <div style={styles.searchCard}>
        <div style={styles.searchRow}>
          <input
            style={styles.searchInput}
            type="number"
            placeholder="Enter Product ID (e.g. 1001)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            style={{
              ...styles.searchBtn,
              opacity: loading || !searchId ? 0.6 : 1,
              cursor: loading || !searchId ? "not-allowed" : "pointer",
            }}
            onClick={handleSearch}
            disabled={loading || !searchId}
          >
            {loading ? "Searching..." : "🔍 Verify"}
          </button>
          {searched && (
            <button style={styles.resetBtn} onClick={handleReset}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.centered}>
          <p style={styles.loadingText}>
            🔄 Verifying product on blockchain...
          </p>
        </div>
      )}

      {/* Genuine Product */}
      {!loading && product && (
        <div style={styles.genuineCard}>
          <div style={styles.genuineIcon}>✅</div>
          <h2 style={styles.genuineTitle}>GENUINE PRODUCT</h2>
          <p style={styles.genuineSubtitle}>
            Verified on the Ethereum blockchain
          </p>
          <div style={styles.detailsBox}>
            {[
              { label: "Product Name", value: product.name },
              { label: "Batch Number", value: product.batchNumber },
              { label: "Manufacturing Date", value: product.manufacturingDate },
              { label: "Description", value: product.description },
              { label: "Manufacturer Address", value: product.manufacturer },
            ].map((item) => (
              <div key={item.label} style={styles.detailRow}>
                <span style={styles.detailLabel}>{item.label}</span>
                <span style={styles.detailValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fake Product */}
      {!loading && error === "fake" && searched && (
        <div style={styles.fakeCard}>
          <div style={styles.fakeIcon}>❌</div>
          <h2 style={styles.fakeTitle}>FAKE OR UNREGISTERED PRODUCT</h2>
          <p style={styles.fakeSubtitle}>
            Product ID <strong>{searchId}</strong> could not be found on the
            blockchain.
          </p>
          <p style={styles.fakeWarning}>⚠️ Do not trust this product.</p>
          <button style={styles.tryAgainBtn} onClick={handleReset}>
            🔍 Search Again
          </button>
        </div>
      )}

      {/* Default State */}
      {!loading && !searched && (
        <div style={styles.defaultState}>
          <p style={styles.defaultIcon}>📦</p>
          <p style={styles.defaultText}>
            Enter a Product ID above to verify authenticity
          </p>
          <p style={styles.defaultSubText}>
            Or scan a QR code from a product package
          </p>
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
  searchCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "700px",
    margin: "0 auto 32px auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  searchRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: "14px",
    borderRadius: "8px",
    border: "2px solid #1a1a2e",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  },
  searchBtn: {
    padding: "14px 24px",
    backgroundColor: "#1a1a2e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    whiteSpace: "nowrap",
  },
  resetBtn: {
    padding: "14px 16px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  centered: {
    textAlign: "center",
    padding: "40px",
  },
  loadingText: {
    fontSize: "18px",
    color: "#666",
  },
  genuineCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "700px",
    margin: "0 auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    border: "3px solid #2ecc71",
  },
  genuineIcon: {
    fontSize: "56px",
    marginBottom: "12px",
  },
  genuineTitle: {
    fontSize: "26px",
    color: "#2ecc71",
    marginBottom: "8px",
  },
  genuineSubtitle: {
    color: "#666",
    marginBottom: "24px",
  },
  detailsBox: {
    textAlign: "left",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "20px",
  },
  detailRow: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
    borderBottom: "1px solid #eee",
    paddingBottom: "12px",
  },
  detailLabel: {
    fontSize: "11px",
    color: "#888",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  detailValue: {
    fontSize: "15px",
    color: "#333",
    fontWeight: "bold",
    wordBreak: "break-all",
  },
  fakeCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "40px",
    maxWidth: "700px",
    margin: "0 auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    border: "3px solid #e74c3c",
  },
  fakeIcon: {
    fontSize: "56px",
    marginBottom: "12px",
  },
  fakeTitle: {
    fontSize: "26px",
    color: "#e74c3c",
    marginBottom: "8px",
  },
  fakeSubtitle: {
    color: "#666",
    marginBottom: "12px",
  },
  fakeWarning: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: "24px",
  },
  tryAgainBtn: {
    padding: "12px 24px",
    backgroundColor: "#1a1a2e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  defaultState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  defaultIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  defaultText: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "8px",
  },
  defaultSubText: {
    fontSize: "14px",
    color: "#888",
  },
};

export default VerifyPage;
