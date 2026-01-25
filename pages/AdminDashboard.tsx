import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, UserPlus, Trash2, List, ShieldAlert, AlertCircle, School, Clock, XCircle, Globe, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract, useConnect } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { parseGwei } from 'viem';
import { INSTITUTION_REGISTRY_ADDRESS_DEFAULT, INSTITUTION_REGISTRY_ABI } from '../constants';
import { getPendingRegistrations, updateRegistrationStatus, InstitutionRegistration } from '../src/api';

const AdminDashboard: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const [newInstitution, setNewInstitution] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [pendingRegistrations, setPendingRegistrations] = useState<InstitutionRegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<InstitutionRegistration | null>(null);
  const [isLoadingPending, setIsLoadingPending] = useState(true);

  const ADMIN_WALLET = "0x1a1adAf0d507b1dd5D8edBc6782f953CaB63152B";
  const isAdmin = address?.toLowerCase() === ADMIN_WALLET.toLowerCase();

  useEffect(() => {
    if (isAdmin) {
      loadPendingRegistrations();
    }
  }, [isAdmin]);

  const loadPendingRegistrations = async () => {
    setIsLoadingPending(true);
    try {
      const regs = await getPendingRegistrations();
      setPendingRegistrations(regs);
    } catch (error) {
      console.error('Failed to load pending registrations:', error);
    } finally {
      setIsLoadingPending(false);
    }
  };

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
    isPending: isRegPending,
    isSuccess: isRegWriteSuccess,
    error: regError
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

  // When blockchain registration succeeds, update DB status
  useEffect(() => {
    if (isRegSuccess && selectedRegistration) {
      updateRegistrationStatus(selectedRegistration.id, 'approved')
        .then(() => {
          loadPendingRegistrations();
          setSelectedRegistration(null);
          setNewInstitution('');
          setInstitutionName('');
        })
        .catch(console.error);
    }
  }, [isRegSuccess]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !address) return;
    
    writeReg({
      address: INSTITUTION_REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
      abi: INSTITUTION_REGISTRY_ABI as any,
      functionName: 'registerInstitution',
      args: [newInstitution as `0x${string}`, institutionName],
      chain: polygonAmoy,
      account: address,
      maxFeePerGas: parseGwei('50'),
      maxPriorityFeePerGas: parseGwei('30'),
    });
  };

  const handleApproveRegistration = (registration: InstitutionRegistration) => {
    if (!address) return;
    setSelectedRegistration(registration);
    setNewInstitution(registration.walletAddress);
    setInstitutionName(registration.name);
    
    writeReg({
      address: INSTITUTION_REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
      abi: INSTITUTION_REGISTRY_ABI as any,
      functionName: 'registerInstitution',
      args: [registration.walletAddress as `0x${string}`, registration.name],
      chain: polygonAmoy,
      account: address,
      maxFeePerGas: parseGwei('50'),
      maxPriorityFeePerGas: parseGwei('30'),
    });
  };

  const handleRejectRegistration = async (registration: InstitutionRegistration) => {
    try {
      await updateRegistrationStatus(registration.id, 'rejected');
      loadPendingRegistrations();
    } catch (error) {
      console.error('Failed to reject registration:', error);
    }
  };

  const handleRemove = (instAddress: string) => {
    if (!isAdmin || !address) return;
    
    writeRemove({
      address: INSTITUTION_REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
      abi: INSTITUTION_REGISTRY_ABI as any,
      functionName: 'removeInstitution',
      args: [instAddress as `0x${string}`],
      chain: polygonAmoy,
      account: address,
      maxFeePerGas: parseGwei('50'),
      maxPriorityFeePerGas: parseGwei('30'),
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
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
        <p className="text-slate-500 mt-2">Manage authorized educational institutions and registration requests.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
          <Shield className="h-4 w-4" /> Platform Administrator
        </div>
      </div>

      {/* Pending Registrations Section */}
      {pendingRegistrations.length > 0 && (
        <div className="mb-10">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between bg-amber-100/50">
              <div className="flex items-center gap-2 text-amber-800">
                <Clock className="h-5 w-5" />
                <h2 className="font-semibold">Pending Registration Requests</h2>
              </div>
              <span className="text-xs font-medium bg-amber-200 text-amber-800 px-2.5 py-1 rounded-full">
                {pendingRegistrations.length} Awaiting Review
              </span>
            </div>
            <div className="divide-y divide-amber-100">
              {pendingRegistrations.map((reg) => (
                <div key={reg.id} className="p-6 bg-white hover:bg-amber-50/50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{reg.name}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="truncate">{reg.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <a href={reg.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate flex items-center gap-1">
                            {reg.website.replace('https://', '').slice(0, 30)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{reg.location}</span>
                        </div>
                        <div className="font-mono text-xs bg-slate-100 px-2 py-1 rounded truncate">
                          {reg.walletAddress.slice(0, 10)}...{reg.walletAddress.slice(-8)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{reg.description}</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => handleApproveRegistration(reg)}
                        disabled={isRegPending || isRegConfirming}
                        className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {(isRegPending || isRegConfirming) && selectedRegistration?.id === reg.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectRegistration(reg)}
                        className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-medium hover:bg-red-100 transition border border-red-200 flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-10">
            <div className="flex items-center gap-2 mb-6 text-indigo-600">
              <UserPlus className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Manual Registration</h2>
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
              {isRegSuccess && !selectedRegistration && (
                <p className="text-green-600 text-sm text-center font-medium">Successfully Registered!</p>
              )}
              {regError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mt-2">
                  <p className="font-medium">Transaction Failed</p>
                  <p className="text-xs mt-1 break-words">{regError.message.slice(0, 200)}</p>
                </div>
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
                <h2 className="font-semibold">Registered Institutions (On-Chain)</h2>
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