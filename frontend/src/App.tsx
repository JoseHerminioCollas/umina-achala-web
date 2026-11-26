import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Marketplace from "./components/Marketplace";
import styles from "./App.module.css";
import AboutPage from "./components/AboutPage";
import FAQ from "./components/FAQ";
import Privacy from "./components/Privacy";
import Contact from "./components/Contact";
import AdminNFT from "./components/AdminNFT";
import ComplianceDashboard from "./components/ComplianceDashboard";
import TestnetGuide from "./components/TestnetGuide";
import { WalletProvider } from "./wallet/WalletContext";

function App(): JSX.Element {
  return (
    <WalletProvider>
      <div>
        <Header />
        <main className={styles.container}>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faqs" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/testnet" element={<TestnetGuide />} />
            <Route path="/admin" element={<AdminNFT />} />
            <Route path="/compliance" element={<ComplianceDashboard />} />
          </Routes>
          <Footer />
        </main>
      </div>
    </WalletProvider>
  );
}

export default App;
