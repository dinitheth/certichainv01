import React, { useMemo, useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { CERTIFICATE_NFT_ADDRESS_DEFAULT, CERTIFICATE_NFT_ABI } from '../constants';
import { History as HistoryIcon, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const History: React.FC = () => {
  const [issueEvents, setIssueEvents] = useState<any[]>([]);
  const [revokeEvents, setRevokeEvents] = useState<any[]>([]);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    const fetchEvents = async () => {
      try {
        const issues = await publicClient.getContractEvents({
          address: CERTIFICATE_NFT_ADDRESS_DEFAULT as `0x${string}`,
          abi: CERTIFICATE_NFT_ABI,
          eventName: 'CertificateIssued',
          fromBlock: 'earliest'
        });
        setIssueEvents(issues);

        const revokes = await publicClient.getContractEvents({
          address: CERTIFICATE_NFT_ADDRESS_DEFAULT as `0x${string}`,
          abi: CERTIFICATE_NFT_ABI,
          eventName: 'CertificateRevoked',
          fromBlock: 'earliest'
        });
        setRevokeEvents(revokes);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    fetchEvents();

    // Watch for new events
    const unwatchIssue = publicClient.watchContractEvent({
      address: CERTIFICATE_NFT_ADDRESS_DEFAULT as `0x${string}`,
      abi: CERTIFICATE_NFT_ABI,
      eventName: 'CertificateIssued',
      onLogs: (logs) => setIssueEvents(prev => [...logs, ...prev]),
    });

    const unwatchRevoke = publicClient.watchContractEvent({
      address: CERTIFICATE_NFT_ADDRESS_DEFAULT as `0x${string}`,
      abi: CERTIFICATE_NFT_ABI,
      eventName: 'CertificateRevoked',
      onLogs: (logs) => setRevokeEvents(prev => [...logs, ...prev]),
    });

    return () => {
      unwatchIssue();
      unwatchRevoke();
    };
  }, [publicClient]);

  const allHistory = useMemo(() => {
    const issues = issueEvents.map(e => ({
      type: 'ISSUE',
      tokenId: e.args.tokenId?.toString(),
      issuer: e.args.issuer,
      student: e.args.student,
      timestamp: Date.now(), // Real apps should fetch block timestamp
      txHash: e.transactionHash
    }));

    const revokes = revokeEvents.map(e => ({
      type: 'REVOKE',
      tokenId: e.args.tokenId?.toString(),
      reason: e.args.reason,
      timestamp: Date.now(),
      txHash: e.transactionHash
    }));

    return [...issues, ...revokes].sort((a, b) => b.timestamp - a.timestamp);
  }, [issueEvents, revokeEvents]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <HistoryIcon className="h-8 w-8 text-indigo-600" />
            Blockchain History
          </h1>
          <p className="text-slate-500 mt-2">Real-time audit log of all certificate actions on Polygon.</p>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium border border-indigo-100">
            <Clock className="h-4 w-4 animate-spin-slow" /> Live Monitoring Active
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Token ID</th>
                <th className="px-6 py-5">Details</th>
                <th className="px-6 py-5">Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                    <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No activity recorded yet</p>
                    <p className="text-sm">New events will appear here in real-time as they happen.</p>
                  </td>
                </tr>
              ) : (
                allHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.type === 'ISSUE' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <CheckCircle className="w-3.5 h-3.5" /> ISSUANCE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <XCircle className="w-3.5 h-3.5" /> REVOCATION
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        #{item.tokenId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.type === 'ISSUE' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400 w-16">Issuer:</span>
                            <span className="font-mono text-slate-700">{item.issuer?.slice(0, 6)}...{item.issuer?.slice(-4)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400 w-16">Student:</span>
                            <span className="font-mono text-slate-700">{item.student?.slice(0, 6)}...{item.student?.slice(-4)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <span className="text-slate-400">Reason:</span>
                          <span className="ml-2 text-red-600 font-medium italic">"{item.reason}"</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`https://amoy.polygonscan.com/tx/${item.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium group-hover:underline"
                      >
                        {item.txHash?.slice(0, 10)}...
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;