import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Marketplace from "./components/Marketplace";
import styles from "./App.module.css";
import AboutPage from "./components/AboutPage";
import FAQ from "./components/FAQ";
import Privacy from "./components/Privacy";
// import ContactPage from "./pages/ContactPage";
// import MintPage from "./pages/MintPage";
// import CompliancePage from "./pages/CompliancePage";

function App(): JSX.Element {
  return (
    <div>
      <Header />
      <main className={styles.container}>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/about" element={<AboutPage />} />
           <Route path="/faqs" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<MintPage />} />
          <Route path="/compliance" element={<CompliancePage />} /> */}
        </Routes>
        <Footer />
      </main>
    </div>
  );
}

export default App;
