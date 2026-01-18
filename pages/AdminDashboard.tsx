import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect, useReadContract, useReadContracts } from 'wagmi';
import { Building, Plus, Trash2, CheckCircle, ShieldAlert, Lock, Activity, XCircle, Search } from 'lucide-react';
import { INSTITUTION_REGISTRY_ABI, REGISTRY_ADDRESS_DEFAULT } from '../constants';

const AdminDashboard: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const [newInstAddress, setNewInstAddress] = useState('');

  // 1. Fetch Owner
  const { data: ownerAddress, isLoading: isOwnerLoading } = useReadContract({
    address: REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'owner',
  });

  // 2. Fetch All Registered Institutions
  const { data: allInstitutions, refetch: refetchList } = useReadContract({
    address: REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'getAllInstitutions',
  });

  // 3. Check if CURRENT wallet is authorized
  const { data: isCurrentAuthorized } = useReadContract({
    address: REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'isAuthorized',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const institutionList = (allInstitutions as string[]) || [];

  // 4. Fetch Status for each institution in the list
  const { data: statuses, refetch: refetchStatuses } = useReadContracts({
    contracts: institutionList.map((instAddr) => ({
      address: REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
      abi: INSTITUTION_REGISTRY_ABI,
      functionName: 'isAuthorized',
      args: [instAddr],
    })),
  });

  // Write Hooks
  const { writeContract: writeRegister, isPending: isRegPending, data: regHash } = useWriteContract();
  const { writeContract: writeRemove, isPending: isRemPending, data: remHash } = useWriteContract();

  const { isLoading: isRegConfirming } = useWaitForTransactionReceipt({ 
    hash: regHash, 
  });
  
  const { isLoading: isRemConfirming } = useWaitForTransactionReceipt({ 
    hash: remHash, 
  });

  // Since we can't easily trigger refetch on receipt success inside hook config in this version,
  // we rely on user refresh or optimistic updates, but let's try a simple effect or manual refetch button?
  // For simplicity, we assume the user will reload or we can add a refresh button.

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstAddress) return;
    writeRegister({
      address: REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
      abi: INSTITUTION_REGISTRY_ABI,
      functionName: 'registerInstitution',
      args: [newInstAddress],
    });
  };

  const handleToggleStatus = (targetAddress: string, currentStatus: boolean) => {
    if (currentStatus) {
      // Remove (Deactivate)
      writeRemove({
        address: REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
        abi: INSTITUTION_REGISTRY_ABI,
        functionName: 'removeInstitution',
        args: [targetAddress],
      });
    } else {
      // Register (Activate)
      writeRegister({
        address: REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
        abi: INSTITUTION_REGISTRY_ABI,
        functionName: 'registerInstitution',
        args: [targetAddress],
      });
    }
  };

  // --- Render Logic ---

  if (isOwnerLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-slate-500">Loading Access Control...</div>;
  }

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <Lock className="h-16 w-16 mx-auto text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
        <p className="text-slate-500 mb-8">Please connect your wallet to access the institution registry.</p>
        <button
          onClick={() => connect({ connector: connectors[0] })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full transition shadow-lg"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const isOwner = address && ownerAddress && (address.toLowerCase() === (ownerAddress as string).toLowerCase());
  const isAuthorizedInstitution = !!isCurrentAuthorized;
  const isLoading = isOwnerLoading || isCurrentAuthorized === undefined;

  if (isLoading && isConnected) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium animate-pulse">Verifying Authorization...</p>
      </div>
    );
  }

  if (isConnected && !isOwner && !isAuthorizedInstitution) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-10 w-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Institution Access</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            This administrative dashboard is reserved for authorized educational institutions and platform administrators.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setPage('home')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg"
            >
              Return to Homepage
            </button>
            <button
              onClick={() => setPage('verify')}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3.5 rounded-2xl transition-all border border-slate-200"
            >
              Verify a Certificate
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-8 bg-slate-50 p-2 rounded-lg border border-slate-100">
            Connected: {address?.slice(0,6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="h-8 w-8 text-indigo-600" />
            Institution Registry
          </h1>
          <p className="text-slate-500 mt-2">Manage authorized certificate issuers.</p>
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> Authenticated as Owner
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add New Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" /> Add Institution
            </h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Wallet Address</label>
                <input 
                  type="text" 
                  placeholder="0x..." 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm transition"
                  value={newInstAddress}
                  onChange={e => setNewInstAddress(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={!newInstAddress || isRegPending || isRegConfirming}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {isRegPending || isRegConfirming ? 'Authorizing...' : 'Authorize Access'}
              </button>
            </form>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
               <p className="text-xs text-slate-500 leading-relaxed">
                 <strong>Note:</strong> Added institutions can issue certificates immediately. You can revoke their access at any time using the list on the right.
               </p>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Registered Accounts</h2>
                <button 
                  onClick={() => { refetchList(); refetchStatuses(); }}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Refresh List
                </button>
             </div>
             
             {institutionList.length === 0 ? (
               <div className="p-12 text-center text-slate-400">
                 <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                 <p>No institutions found.</p>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                       <th className="px-6 py-4">Institution Address</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {institutionList.map((instAddr, idx) => {
                        // Safe check for status array
                        const isActive = statuses?.[idx]?.result as boolean;
                        const isThisLoading = (isRegPending || isRemPending || isRegConfirming || isRemConfirming);

                        return (
                          <tr key={instAddr} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-sm text-slate-700">
                              {instAddr}
                            </td>
                            <td className="px-6 py-4">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleToggleStatus(instAddr, isActive)}
                                disabled={isThisLoading}
                                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                  isActive 
                                    ? 'text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100' 
                                    : 'text-green-600 hover:bg-green-50 border border-transparent hover:border-green-100'
                                }`}
                              >
                                {isActive ? 'Revoke' : 'Re-Activate'}
                              </button>
                            </td>
                          </tr>
                        );
                     })}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;