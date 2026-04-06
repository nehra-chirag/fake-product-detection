import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import ManufacturerPage from "./pages/ManufacturerPage";
import VerifyPage from "./pages/VerifyPage";
import "./App.css";

function App() {
  return (
    <Router>
      <nav style={styles.nav}>
        <span style={styles.logo}>🛡️ FakeGuard</span>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>
            Admin
          </Link>
          <Link to="/manufacturer" style={styles.link}>
            Manufacturer
          </Link>
          <Link to="/verify/0" style={styles.link}>
            Verify
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/manufacturer" element={<ManufacturerPage />} />
        <Route path="/verify/:productId" element={<VerifyPage />} />
      </Routes>
    </Router>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "#1a1a2e",
    color: "white",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "bold",
  },
  links: {
    display: "flex",
    gap: "24px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
  },
};

export default App;
