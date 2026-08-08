import NotedAttorneysPage from "./pages/noted_attorneys_page";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Analytics from "./components/Analytics";
import Layout from "./components/Layout";
import LandingSplash from "./components/LandingSplash";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import DownloadPage from "./pages/DownloadPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CounselHandoffPage from "./pages/CounselHandoffPage";
import EventsPage from "./pages/EventsPage";
import AccountPortalPage from "./pages/AccountPortalPage";
import DeclarationPage from "./pages/DeclarationPage";
import LexiconPage from "./pages/LexiconPage";
import PledgePage from "./pages/PledgePage";
import TermsPage from "./pages/TermsPage";
import PoliciesProceduresPage from "./pages/PoliciesProceduresPage";
import PrivacyPage from "./pages/PrivacyPage";
import WebsiteFloatingOrb from "./orb/WebsiteFloatingOrb";

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <LandingSplash />
      <WebsiteFloatingOrb />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<Navigate to="/access" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/access" element={<DownloadPage />} />
          <Route path="/download" element={<Navigate to="/access" replace />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/attorney-referral" element={<NotedAttorneysPage />} />
          <Route path="/counsel-handoff" element={<CounselHandoffPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/account" element={<AccountPortalPage />} />
          <Route path="/declaration" element={<DeclarationPage />} />
          <Route path="/pledge" element={<PledgePage />} />
          <Route path="/lexicon" element={<LexiconPage />} />
          <Route path="/lexicon/:slug" element={<LexiconPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/policies-procedures" element={<PoliciesProceduresPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
