import React from 'react';
import { Shield, Lock, Globe, Zap } from 'lucide-react';

interface Props {
  setPage: (page: string) => void;
}

const Home: React.FC<Props> = ({ setPage }) => {
  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white py-24 px-4 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            The Future of <span className="text-purple-300">Academic Trust</span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Issue, verify, and manage tamper-proof academic certificates on the Polygon blockchain. 
            Secure, transparent, and immutable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setPage('verify')}
              className="bg-white text-indigo-700 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition transform"
            >
              Verify a Certificate
            </button>
            <button 
              onClick={() => setPage('issue')}
              className="bg-indigo-600 border border-indigo-400 text-white font-bold py-4 px-8 rounded-full hover:bg-indigo-500 transition transform"
            >
              For Institutions
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Tamper-Proof</h3>
            <p className="text-slate-600 leading-relaxed">
              Certificates are minted as Soulbound NFTs. Once issued, they cannot be altered or transferred, ensuring absolute integrity.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition">
             <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Global Verification</h3>
            <p className="text-slate-600 leading-relaxed">
              Employers worldwide can instantly verify credentials without intermediaries, fees, or waiting periods using the blockchain.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition">
             <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Revocation</h3>
            <p className="text-slate-600 leading-relaxed">
              Institutions retain control. If a degree needs to be rescinded, the smart contract status updates instantly across the network.
            </p>
          </div>
        </div>
      </div>

      {/* Code Preview Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">Built on Polygon & Solidity</h2>
            <p className="text-slate-400 mb-6">
              Powered by robust smart contracts ensuring Role-Based Access Control and ERC-721 standards compliance.
            </p>
            <button onClick={() => setPage('contracts')} className="text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-2">
              View Smart Contracts &rarr;
            </button>
          </div>
          <div className="flex-1 w-full bg-slate-800 rounded-lg p-4 font-mono text-sm overflow-hidden opacity-90 shadow-inner border border-slate-700">
            <p className="text-purple-400">function</p>
            <p className="pl-4 text-white">issueCertificate(address student, ...)</p>
            <p className="pl-4 text-purple-400">external onlyAuthorized</p>
            <p className="pl-4 text-white">{'{'}</p>
            <p className="pl-8 text-slate-400">// Mint Soulbound Token</p>
            <p className="pl-8 text-white">_safeMint(student, tokenId);</p>
            <p className="pl-4 text-white">{'}'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;