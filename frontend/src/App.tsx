import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
// import CollectionPage from "./pages/CollectionPage";
// import AboutPage from "./pages/AboutPage";
// import FAQsPage from "./pages/FAQsPage";
// import PrivacyPage from "./pages/PrivacyPage";
// import ContactPage from "./pages/ContactPage";
// import MintPage from "./pages/MintPage";
// import CompliancePage from "./pages/CompliancePage";

function App(): JSX.Element {
  return (
    <div>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Hero />} />
          {/* <Route path="/collection" element={<CollectionPage />} /> */}
          {/* <Route path="/about" element={<AboutPage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/mint" element={<MintPage />} />
          <Route path="/compliance" element={<CompliancePage />} /> */}
        </Routes>
        <footer className="site-footer">
          <div className="footer-links">
            {/* You can replace these <a> with <button> + useNavigate if you prefer */}
            <a href="/about">About</a>
            <a href="/faqs">FAQs</a>
            <a href="/privacy">Privacy & Cookies</a>
            <a href="/contact">Contact</a>
            <a href="/mint">Admin NFT</a>
            <a href="/compliance">Compliance Dashboard</a>
          </div>
          <div className="footer-copy">
            © 2026 Rumi Project. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
