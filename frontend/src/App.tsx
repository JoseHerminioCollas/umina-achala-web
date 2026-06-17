import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Marketplace from "./components/Marketplace";
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
          <Route path="/marketplace" element={<Marketplace />} />
          {/* <Route path="/about" element={<AboutPage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<MintPage />} />
          <Route path="/compliance" element={<CompliancePage />} /> */}
        </Routes>
        <Footer />
      </main>
    </div>
  );
}

export default App;
