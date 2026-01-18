import React, { useState } from 'react';
import { Search, Check, X, Building, Calendar, UserCheck, Clock, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { fetchCertificate, fetchCertificateIdByHash } from '../services/web3Service';
import { CertificateData } from '../types';
import { keccak256, toHex, encodePacked } from 'viem';

const VerifyCertificate: React.FC = () => {
  const [mode, setMode] = useState<'ID' | 'HASH'>('ID');
  
  // ID Search State
  const [searchId, setSearchId] = useState('');
  
  // Hash Search State
  const [hashFormData, setHashFormData] = useState({
      studentName: '',
      studentEmail: '',
      course: '',
      enrollmentDate: ''
  });

  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchIPFSData = async (cid: string) => {
    if (!cid || cid.startsWith("QmPlaceholder")) return;
    try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
        const json = await response.json();
        setMetadata(json);
    } catch (e) {
        console.error("Failed to fetch IPFS metadata", e);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCertData(null);
    setMetadata(null);
    setLoading(true);
    setHasSearched(true);

    try {
      let tokenId = searchId;

      if (mode === 'HASH') {
          // Reconstruct the DataHash from user inputs
          const enrollmentTimestamp = Math.floor(new Date(hashFormData.enrollmentDate).getTime() / 1000);
          const nameHash = keccak256(toHex(hashFormData.studentName));
          const emailHash = keccak256(toHex(hashFormData.studentEmail));
          
          const dataHash = keccak256(encodePacked(
            ['string', 'string', 'string', 'uint256'],
            [nameHash, emailHash, hashFormData.course, BigInt(enrollmentTimestamp)]
          ));

          const fetchedId = await fetchCertificateIdByHash(dataHash);
          if (fetchedId && fetchedId !== '0') {
              tokenId = fetchedId;
          } else {
              throw new Error("No certificate found for this data.");
          }
      }

      const data = await fetchCertificate(tokenId);

      if (data && data.studentName) {
        setCertData(data);
        if (data.ipfsHash) {
            fetchIPFSData(data.ipfsHash);
        }
      } else {
        setError("Certificate not found on chain.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Verify Credential</h1>
        <p className="text-slate-500 mt-2">Instant, trustless verification directly from the Polygon blockchain.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8 bg-slate-50 border-b border-slate-200">
          <div className="flex gap-4 justify-center mb-6">
            <button 
                onClick={() => { setMode('ID'); setHasSearched(false); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${mode === 'ID' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
                By Certificate ID
            </button>
            <button 
                onClick={() => { setMode('HASH'); setHasSearched(false); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${mode === 'HASH' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
                By Data (Privacy Mode)
            </button>
          </div>

          <form onSubmit={handleVerify} className="relative space-y-4">
            {mode === 'ID' ? (
                <div className="relative">
                    <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none text-lg transition"
                    placeholder="Enter Certificate ID (e.g. 1)"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    required
                    />
                    <Search className="absolute left-4 top-5 text-slate-400 h-6 w-6" />
                </div>
            ) : (
                <div className="grid gap-3">
                    <input
                        type="text"
                        placeholder="Student Name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        value={hashFormData.studentName}
                        onChange={e => setHashFormData({...hashFormData, studentName: e.target.value})}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Student Email"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        value={hashFormData.studentEmail}
                        onChange={e => setHashFormData({...hashFormData, studentEmail: e.target.value})}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Course Name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        value={hashFormData.course}
                        onChange={e => setHashFormData({...hashFormData, course: e.target.value})}
                        required
                    />
                    <input
                        type="date"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        value={hashFormData.enrollmentDate}
                        onChange={e => setHashFormData({...hashFormData, enrollmentDate: e.target.value})}
                        required
                    />
                </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify on Blockchain'}
            </button>
          </form>
        </div>

        <div className="p-8 min-h-[300px] flex flex-col justify-center items-center">
          {!hasSearched && (
             <div className="text-center text-slate-400">
               <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-20" />
               <p>Enter details above to verify authenticity.</p>
             </div>
          )}

          {error && (
            <div className="text-red-500 flex flex-col items-center">
               <X className="h-12 w-12 mb-2" />
               <p className="font-medium">{error}</p>
            </div>
          )}

          {certData && (
            <div className="w-full animate-fade-in-up">
              <div className={`flex flex-col items-center justify-center mb-8 p-4 rounded-xl border ${
                  !certData.isValid 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : !certData.isInstitutionActive 
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                {!certData.isValid ? (
                   <>
                    <div className="flex items-center">
                        <X className="h-6 w-6 mr-2" />
                        <span className="font-bold text-lg">Revoked / Invalid</span>
                    </div>
                    {certData.revokeReason && (
                        <p className="text-sm mt-1 font-medium">Reason: {certData.revokeReason}</p>
                    )}
                  </>
                ) : !certData.isInstitutionActive ? (
                    <>
                    <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 mr-2" />
                        <span className="font-bold text-lg">Certificate Valid (Issuer Inactive)</span>
                    </div>
                    <p className="text-sm mt-1">The certificate is valid, but the issuing institution is no longer authorized.</p>
                   </>
                ) : (
                  <>
                    <div className="flex items-center">
                        <Check className="h-6 w-6 mr-2" />
                        <span className="font-bold text-lg">Valid Certificate</span>
                    </div>
                  </>
                )}
              </div>

              <div className="grid gap-6">
                 <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Building className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Issuer</h3>
                    <p className="text-lg font-semibold text-slate-900 break-all font-mono text-base">{certData.issuer}</p>
                    <div className="mt-1">
                        {certData.isInstitutionActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                <CheckCircle className="h-3 w-3" /> Active Institution
                            </span>
                        ) : (
                             <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                <XCircle className="h-3 w-3" /> Inactive/Removed
                            </span>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <UserCheck className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Student Name Hash</h3>
                    <p className="text-lg font-semibold text-slate-900 break-all">{certData.studentName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Building className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Course</h3>
                    <p className="text-lg font-semibold text-slate-900">{certData.course}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Enrolled</h3>
                      <p className="text-lg font-semibold text-slate-900">
                        {new Date(certData.enrollmentDate * 1000).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Issued</h3>
                      <p className="text-lg font-semibold text-slate-900">
                        {new Date(certData.issueDate * 1000).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                {metadata && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                        <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Download className="h-4 w-4" /> IPFS Metadata
                        </h3>
                        <pre className="text-xs text-slate-500 overflow-auto max-h-40 bg-white p-2 rounded border border-slate-100">
                            {JSON.stringify(metadata, null, 2)}
                        </pre>
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;