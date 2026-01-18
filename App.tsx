import React, { useState, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { config, queryClient } from './wagmiConfig';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import IssueCertificate from './pages/IssueCertificate';
import VerifyCertificate from './pages/VerifyCertificate';
import ContractsPage from './pages/ContractsPage';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const [page, setPage] = useState('home');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home setPage={setPage} />;
      case 'issue':
        return <IssueCertificate />;
      case 'verify':
        return <VerifyCertificate />;
      case 'admin':
        return <AdminDashboard setPage={setPage} />;
      default:
        return <Home setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar setPage={setPage} currentPage={page} />
      <main>
        {renderPage()}
      </main>
      <footer className="bg-slate-900 text-slate-400 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 CertiChain. Built on Polygon.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;