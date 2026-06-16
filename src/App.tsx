/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import LandingPage from './pages/LandingPage.tsx';
import DiscoverPage from './pages/DiscoverPage.tsx';
import ImpactDashboard from './pages/ImpactDashboard.tsx';
import OpportunityDetail from './pages/OpportunityDetail.tsx';
import ProfilePage from './pages/ProfilePage.tsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/impact" element={<ImpactDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/opportunity/:id" element={<OpportunityDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
