import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, UserPlus, Trash2, List, ShieldAlert, AlertCircle, School } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract, useConnect } from 'wagmi';
import { INSTITUTION_REGISTRY_ADDRESS_DEFAULT, INSTITUTION_REGISTRY_ABI } from '../constants';

const AdminDashboard: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const [newInstitution, setNewInstitution] = useState('');
  const [institutionName, setInstitutionName] = useState('');

  const ADMIN_WALLET = "0x1a1adAf0d507b1dd5D8edBc6782f953CaB63152B";
  const isAdmin = address?.toLowerCase() === ADMIN_WALLET.toLowerCase();

  const { data: owner } = useReadContract({
    address: INSTITUTION_REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'owner',
  });

  const { data: institutions = [] } = useReadContract({
    address: INSTITUTION_REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'getAllInstitutions',
  });

  const { 
    data: regHash, 
    writeContract: writeReg, 
    isPending: isRegPending 
  } = useWriteContract();

  const { isLoading: isRegConfirming, isSuccess: isRegSuccess } = useWaitForTransactionReceipt({
    hash: regHash,
  });

  const { 
    data: removeHash, 
    writeContract: writeRemove, 
    isPending: isRemovePending 
  } = useWriteContract();

  const { isLoading: isRemoveConfirming, isSuccess: isRemoveSuccess } = useWaitForTransactionReceipt({
    hash: removeHash,
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    writeReg({
      address: INSTITUTION_REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
      abi: INSTITUTION_REGISTRY_ABI as any,
      functionName: 'registerInstitution',
      args: [newInstitution as `0x${string}`, institutionName],
    });
  };

  const handleRemove = (instAddress: string) => {
    if (!isAdmin) return;
    
    writeRemove({
      address: INSTITUTION_REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
      abi: INSTITUTION_REGISTRY_ABI as any,
      functionName: 'removeInstitution',
      args: [instAddress as `0x${string}`],
    });
  };

  if (isConnected && !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            You do not have administrative privileges. Only the platform owner can manage the institution registry.
          </p>
          <button 
            onClick={() => setPage('home')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold mb-4">Connect Admin Wallet</h2>
          <p className="text-slate-600 mb-6">Please connect the authorized administrator wallet to manage institutions.</p>
          <button 
            onClick={() => connect({ connector: connectors[0] })}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
        <p className="text-slate-500 mt-2">Manage authorized educational institutions and platform security.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
          <Shield className="h-4 w-4" /> Platform Administrator
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-10">
            <div className="flex items-center gap-2 mb-6 text-indigo-600">
              <UserPlus className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Register Institution</h2>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="e.g. Poly University"
                  value={institutionName}
                  onChange={e => setInstitutionName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wallet Address</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono text-sm"
                  placeholder="0x..."
                  value={newInstitution}
                  onChange={e => setNewInstitution(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isRegPending || isRegConfirming}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isRegPending || isRegConfirming ? 'Authorizing...' : 'Authorize Institution'}
              </button>
              {isRegSuccess && (
                <p className="text-green-600 text-sm text-center font-medium">Successfully Registered!</p>
              )}
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-semibold">Security Note</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Adding an institution grants them the ability to mint certificates. Ensure the wallet address is verified before authorization.
                </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <List className="h-5 w-5" />
                <h2 className="font-semibold">Registered Institutions</h2>
              </div>
              <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                {(institutions as any).length} Total
              </span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {(institutions as any).length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <School className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No institutions registered yet.</p>
                </div>
              ) : (
                (institutions as any).map((inst: any, idx: number) => (
                  <div key={idx} className="px-6 py-4 hover:bg-slate-50 transition flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-mono text-sm text-slate-600 truncate max-w-[200px] sm:max-w-md">
                          {inst}
                        </p>
                        <span className="text-xs text-indigo-500 font-medium">Active Authorized Issuer</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(inst)}
                      disabled={isRemovePending || isRemoveConfirming}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Remove Authorization"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;