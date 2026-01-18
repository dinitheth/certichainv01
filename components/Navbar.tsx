import React, { useEffect } from 'react';
import { ShieldCheck, Wallet, Menu, X, LogOut, AlertCircle } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';

interface NavbarProps {
  setPage: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  setPage, 
  currentPage,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Auto-switch to Amoy if connected to wrong network
  useEffect(() => {
    if (isConnected && chainId !== polygonAmoy.id) {
      switchChain({ chainId: polygonAmoy.id });
    }
  }, [isConnected, chainId, switchChain]);

  const handleConnect = () => {
    // Prefer Injected (MetaMask/OKX) or first available
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    } else {
      alert("No suitable wallet connector found. Please install MetaMask or OKX Wallet.");
    }
  };

  const NavLink = ({ page, label }: { page: string, label: string }) => (
    <button
      onClick={() => { setPage(page); setIsOpen(false); }}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentPage === page 
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button onClick={() => setPage('home')} className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl tracking-tight text-slate-900">CertiChain</span>
            </button>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <NavLink page="home" label="Home" />
              <NavLink page="issue" label="Institution" />
              <NavLink page="verify" label="Verify" />
              <NavLink page="admin" label="Admin" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && address ? (
              <div className="flex items-center gap-2">
                {chainId !== polygonAmoy.id && (
                  <button 
                    onClick={() => switchChain({ chainId: polygonAmoy.id })}
                    className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-medium hover:bg-amber-100 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Switch to Amoy
                  </button>
                )}
                <div className="hidden md:flex items-center gap-3 bg-slate-50 rounded-full pl-4 pr-2 py-1.5 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-sm font-mono font-medium text-slate-700">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                  <button 
                    onClick={() => disconnect()}
                    className="p-1.5 rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-slate-100 shadow-sm"
                    title="Disconnect"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg rounded-b-2xl">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            <NavLink page="home" label="Home" />
            <NavLink page="issue" label="Institution" />
            <NavLink page="verify" label="Verify" />
            <NavLink page="admin" label="Admin" />
            
            <div className="border-t border-gray-100 my-2 pt-3">
              {isConnected && address ? (
                <div className="space-y-3">
                  {chainId !== polygonAmoy.id && (
                    <button 
                      onClick={() => switchChain({ chainId: polygonAmoy.id })}
                      className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 px-4 py-3 rounded-xl border border-amber-200 font-medium"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Switch to Polygon Amoy
                    </button>
                  )}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-mono text-slate-700">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    </div>
                    <button 
                      onClick={() => disconnect()}
                      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      <LogOut className="w-4 h-4" /> Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium"
                >
                  <Wallet className="h-5 w-5" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;