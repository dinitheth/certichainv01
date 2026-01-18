import React, { useState } from 'react';
import { Shield, FileText, CheckCircle, AlertCircle, Calendar, Mail, Download, Hash } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect } from 'wagmi';
import { keccak256, toHex, encodePacked } from 'viem';
import { CERTIFICATE_NFT_ADDRESS_DEFAULT, CERTIFICATE_NFT_ABI } from '../constants';

const IssueCertificate: React.FC = () => {
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();

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
    enrollmentDate: '',
    ipfsHash: ''
  });

  const [revokeData, setRevokeData] = useState({
    id: '',
    reason: ''
  });

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connect({ connector: connectors[0] });
      return;
    }

    try {
      const enrollmentTimestamp = Math.floor(new Date(formData.enrollmentDate).getTime() / 1000);
      const emailHash = keccak256(toHex(formData.studentEmail));
      const nameHash = keccak256(toHex(formData.studentName));

      // ✅ FIXED: Compute privacy-preserving Data Hash for verification lookup
      // hash(nameHash + emailHash + course + enrollmentDate)
      const dataHash = keccak256(encodePacked(
        ['bytes32', 'bytes32', 'string', 'uint256'],
        [nameHash, emailHash, formData.course, BigInt(enrollmentTimestamp)]
      ));

      writeIssue({
        address: CERTIFICATE_NFT_ADDRESS_DEFAULT as `0x${string}`,
        abi: CERTIFICATE_NFT_ABI,
        functionName: 'issueCertificate',
        args: [
          formData.studentAddress as `0x${string}`,
          nameHash,
          emailHash,
          formData.course,
          BigInt(enrollmentTimestamp),
          formData.ipfsHash || "QmPlaceholder",
          dataHash
        ],
      });
    } catch (err) {
      console.error('Error issuing certificate:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connect({ connector: connectors[0] });
      return;
    }

    try {
      writeRevoke({
        address: CERTIFICATE_NFT_ADDRESS_DEFAULT as `0x${string}`,
        abi: CERTIFICATE_NFT_ABI,
        functionName: 'revokeCertificate',
        args: [BigInt(revokeData.id), revokeData.reason],
      });
    } catch (err) {
      console.error('Error revoking certificate:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    }
  };

  const generateMetadata = () => {
    if(!formData.studentName || !formData.course) {
        alert("Please fill in Student Name and Course first.");
        return;
    }

    const enrollmentTimestamp = Math.floor(new Date(formData.enrollmentDate).getTime() / 1000);
    const metadata = {
        name: `Certificate: ${formData.course}`,
        description: `Academic Certificate for ${formData.course}`,
        image: "ipfs://QmPlaceholderImage", // In real app, user uploads image first
        attributes: [
            { trait_type: "Student Name Hash", value: keccak256(toHex(formData.studentName)) },
            { trait_type: "Course", value: formData.course },
            { trait_type: "Enrollment Date", value: enrollmentTimestamp }
        ]
    };

    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metadata.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Institution Dashboard</h1>
        <p className="text-slate-500 mt-2">Issue tamper-proof certificates on the Polygon blockchain.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Issue Form */}
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

             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IPFS Metadata</label>
              <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-mono text-sm"
                    placeholder="Paste CID after upload..."
                    value={formData.ipfsHash}
                    onChange={e => setFormData({...formData, ipfsHash: e.target.value})}
                />
                <button 
                    type="button" 
                    onClick={generateMetadata}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition border border-slate-300 flex items-center gap-1"
                    title="Generate JSON to upload to IPFS"
                >
                    <Download className="h-4 w-4" /> <span className="text-xs">JSON</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Upload the generated JSON to IPFS (e.g. Pinata) and paste CID.</p>
            </div>

            <button
              type="submit"
              disabled={isIssuePending || isIssueConfirming}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isIssuePending || isIssueConfirming ? 'Minting...' : 'Mint Certificate'}
            </button>
            {issueError && (
              <p className="text-red-500 text-sm mt-2">Error: {issueError.message.slice(0, 100)}...</p>
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

        {/* Revoke Form & Status */}
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
                disabled={isRevokePending || isRevokeConfirming}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 rounded-xl border border-red-200 transition-all disabled:opacity-50"
              >
                {isRevokePending || isRevokeConfirming ? 'Revoking...' : 'Revoke Permanently'}
              </button>
              {revokeError && (
                <p className="text-red-500 text-sm mt-2">Error: {revokeError.message.slice(0, 100)}...</p>
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
