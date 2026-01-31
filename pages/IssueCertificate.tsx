import React, { useState, useEffect } from 'react';
import { Shield, FileText, CheckCircle, AlertCircle, Calendar, Mail, Lock, Clock } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect, useReadContract, useEstimateGas } from 'wagmi';
import { keccak256, toHex, encodePacked } from 'viem';
import { CERTIFICATE_NFT_ADDRESS_DEFAULT, CERTIFICATE_NFT_ABI, INSTITUTION_REGISTRY_ADDRESS_DEFAULT, INSTITUTION_REGISTRY_ABI } from '../constants';
import { checkRegistration, InstitutionRegistration } from '../src/api';

const IssueCertificate: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const [dbRegistration, setDbRegistration] = useState<InstitutionRegistration | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(true);

  // Check database registration status
  useEffect(() => {
    if (address) {
      setIsCheckingDb(true);
      checkRegistration(address)
        .then(reg => setDbRegistration(reg))
        .catch(console.error)
        .finally(() => setIsCheckingDb(false));
    } else {
      setIsCheckingDb(false);
    }
  }, [address]);

  // Check if the connected address is a registered institution on-chain
  const { data: institutionInfo, isLoading: isCheckingAuth } = useReadContract({
    address: INSTITUTION_REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'getInstitution',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  });

  const isAuthorized = institutionInfo && (institutionInfo as any)[1] === true;

  // Issuance State
  const { 
    data: issueHash, 
    writeContract: writeIssue, 
    isPending: isIssuePending, 
    error: issueError 
  } = useWriteContract();

  const { isLoading: isIssueConfirming, isSuccess: isIssueSuccess } = useWaitForTransactionReceipt({
    hash: issueHash,
  });

  // Revoke State
  const { 
    data: revokeHash, 
    writeContract: writeRevoke, 
    isPending: isRevokePending,
    error: revokeError
  } = useWriteContract();

  const { isLoading: isRevokeConfirming, isSuccess: isRevokeSuccess } = useWaitForTransactionReceipt({
    hash: revokeHash,
  });

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentAddress: '',
    course: '',
    enrollmentDate: ''
  });

  const [revokeData, setRevokeData] = useState({
    id: '',
    reason: ''
  });

  const [issueErrorMsg, setIssueErrorMsg] = useState('');
  const [revokeErrorMsg, setRevokeErrorMsg] = useState('');

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueErrorMsg('');
    
    if (!isConnected) {
      connect({ connector: connectors[0] });
      return;
    }

    if (!isAuthorized) {
      setIssueErrorMsg("Unauthorized: Only registered institutions can issue certificates.");
      return;
    }

    try {
      const enrollmentTimestamp = Math.floor(new Date(formData.enrollmentDate).getTime() / 1000);
      const emailHash = keccak256(toHex(formData.studentEmail));
      const nameHash = keccak256(toHex(formData.studentName));

      const dataHash = keccak256(encodePacked(
        ['bytes32', 'bytes32', 'string', 'uint256'],
        [nameHash, emailHash, formData.course, BigInt(enrollmentTimestamp)]
      ));

      writeIssue({
        address: CERTIFICATE_NFT_ADDRESS_DEFAULT as `0x${string}`,
        abi: CERTIFICATE_NFT_ABI as any,
        functionName: 'issueCertificate',
        args: [
          formData.studentAddress as `0x${string}`,
          nameHash,
          emailHash,
          formData.course,
          BigInt(enrollmentTimestamp),
          "QmPlaceholder",
          dataHash
        ],
        gas: BigInt(500000), // Set gas limit to prevent failed transactions
      });
    } catch (err) {
      console.error('Error issuing certificate:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setIssueErrorMsg('Transaction cancelled. You rejected the wallet request.');
      } else if (errorMessage.includes('insufficient funds')) {
        setIssueErrorMsg('Insufficient funds to complete the transaction.');
      } else {
        setIssueErrorMsg(`Error: ${errorMessage.slice(0, 100)}`);
      }
    }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevokeErrorMsg('');
    
    if (!isConnected) {
      connect({ connector: connectors[0] });
      return;
    }

    if (!isAuthorized) {
      setRevokeErrorMsg("Unauthorized: Only registered institutions can revoke certificates.");
      return;
    }

    try {
      writeRevoke({
        address: CERTIFICATE_NFT_ADDRESS_DEFAULT as `0x${string}`,
        abi: CERTIFICATE_NFT_ABI as any,
        functionName: 'revokeCertificate',
        args: [BigInt(revokeData.id), revokeData.reason],
        gas: BigInt(200000), // Set gas limit to prevent failed transactions
      });
    } catch (err) {
      console.error('Error revoking certificate:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setRevokeErrorMsg('Transaction cancelled. You rejected the wallet request.');
      } else if (errorMessage.includes('insufficient funds')) {
        setRevokeErrorMsg('Insufficient funds to complete the transaction.');
      } else {
        setRevokeErrorMsg(`Error: ${errorMessage.slice(0, 100)}`);
      }
    }
  };



  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Connect Your Wallet</h1>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            Please connect your wallet to access the Institution Dashboard and manage certificates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Connect Wallet
            </button>
            <button 
              onClick={() => setPage('home')}
              className="bg-slate-100 text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking
  if (isCheckingAuth || isCheckingDb) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Verifying institution status...</p>
      </div>
    );
  }

  // If not authorized on-chain
  if (isConnected && !isAuthorized) {
    // Check if they have a pending registration
    if (dbRegistration && dbRegistration.status === 'pending') {
      return (
        <div className="max-w-4xl mx-auto py-20 px-4 text-center">
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
            <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Application Pending</h1>
            <p className="text-slate-600 max-w-md mx-auto mb-8">
              Your registration for <strong>{dbRegistration.name}</strong> is currently under review. 
              You'll gain access to the Institution Dashboard once approved.
            </p>
            <button 
              onClick={() => setPage('home')}
              className="bg-slate-100 text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    // No registration - redirect to registration page
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Institution Registration Required</h1>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            To issue certificates, your institution must first be registered and approved on the CertiChain network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setPage('register')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Register Your Institution
            </button>
            <button 
              onClick={() => setPage('home')}
              className="bg-slate-100 text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Institution Dashboard</h1>
        <p className="text-slate-500 mt-2">Issue tamper-proof certificates on the Polygon blockchain.</p>
        {isAuthorized && institutionInfo && (
          <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium border border-green-100">
            <CheckCircle className="h-4 w-4" />
            {(institutionInfo as any)[0] || 'Registered Institution'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <FileText className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Issue New Certificate</h2>
          </div>

          <form onSubmit={handleIssue} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="e.g. John Doe"
                value={formData.studentName}
                onChange={e => setFormData({...formData, studentName: e.target.value})}
              />
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Hashed on-chain for privacy
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="student@university.edu"
                  value={formData.studentEmail}
                  onChange={e => setFormData({...formData, studentEmail: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student Wallet Address</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-mono text-sm"
                placeholder="0x..."
                value={formData.studentAddress}
                onChange={e => setFormData({...formData, studentAddress: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course / Degree</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="e.g. Bachelor of Computer Science"
                value={formData.course}
                onChange={e => setFormData({...formData, course: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Enrollment Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={formData.enrollmentDate}
                  onChange={e => setFormData({...formData, enrollmentDate: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isIssuePending || isIssueConfirming || !isAuthorized}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {!isConnected ? 'Connect Wallet' : isIssuePending || isIssueConfirming ? 'Minting...' : 'Mint Certificate'}
            </button>
            {(issueError || issueErrorMsg) && (
              <div className="mt-2 text-red-600 flex items-start gap-2 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{issueErrorMsg || (issueError?.message.includes('User rejected') || issueError?.message.includes('user rejected') ? 'Transaction cancelled. You rejected the wallet request.' : `Error: ${issueError?.message.slice(0, 100)}`)}</span>
              </div>
            )}
            {isIssueSuccess && (
              <div className="mt-2 text-green-600 flex items-center gap-1 text-sm bg-green-50 p-2 rounded">
                <CheckCircle className="h-4 w-4" /> 
                <div className="flex flex-col">
                    <span>Issued! TX: {issueHash?.slice(0, 10)}...</span>
                    <a href={`https://amoy.polygonscan.com/tx/${issueHash}`} target="_blank" rel="noreferrer" className="underline text-xs">View on Explorer</a>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-2 mb-6 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Revoke Certificate</h2>
            </div>
            <form onSubmit={handleRevoke} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Certificate ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  placeholder="Token ID to revoke"
                  value={revokeData.id}
                  onChange={e => setRevokeData({...revokeData, id: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Revocation</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  placeholder="e.g. Plagiarism, Data Error"
                  value={revokeData.reason}
                  onChange={e => setRevokeData({...revokeData, reason: e.target.value})}
                />
              </div>
              <button
                type="submit"
                disabled={isRevokePending || isRevokeConfirming || !isAuthorized}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 rounded-xl border border-red-200 transition-all disabled:opacity-50"
              >
                {isRevokePending || isRevokeConfirming ? 'Revoking...' : 'Revoke Permanently'}
              </button>
              {(revokeError || revokeErrorMsg) && (
                <div className="mt-2 text-red-600 flex items-start gap-2 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{revokeErrorMsg || (revokeError?.message.includes('User rejected') || revokeError?.message.includes('user rejected') ? 'Transaction cancelled. You rejected the wallet request.' : `Error: ${revokeError?.message.slice(0, 100)}`)}</span>
                </div>
              )}
            </form>
          </div>

          {isRevokeSuccess && (
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-800">Revocation Successful</h3>
              </div>
              <p className="text-sm text-green-700 mb-2">The certificate has been invalidated.</p>
              {revokeHash && (
                <a 
                    href={`https://amoy.polygonscan.com/tx/${revokeHash}`}
                    target="_blank"
                    rel="noreferrer" 
                    className="bg-white p-3 rounded border border-green-100 font-mono text-xs text-slate-500 break-all block hover:text-indigo-600"
                >
                  TX: {revokeHash}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCertificate;