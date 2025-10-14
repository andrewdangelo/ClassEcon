import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ForStudentsPage from './pages/ForStudentsPage';
import ForTeachersPage from './pages/ForTeachersPage';
import PricingPage from './pages/PricingPage';
import WaitlistPage from './pages/WaitlistPage';
import ContactPage from './pages/ContactPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/for-students" element={<ForStudentsPage />} />
            <Route path="/for-teachers" element={<ForTeachersPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
