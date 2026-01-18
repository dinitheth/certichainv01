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
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            The Future of <span className="text-purple-300">Academic Trust</span>
          </h1>
          <p className="text-lg md:text-2xl text-indigo-100 mb-10 max-w-2xl mx-auto px-2">
            Issue, verify, and manage tamper-proof academic certificates on the Polygon blockchain. 
            Secure, transparent, and immutable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <button 
              onClick={() => setPage('verify')}
              className="bg-white text-indigo-700 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition transform w-full sm:w-auto text-center"
            >
              Verify a Certificate
            </button>
            <button 
              onClick={() => setPage('issue')}
              className="bg-indigo-600 border border-indigo-400 text-white font-bold py-4 px-8 rounded-full hover:bg-indigo-500 transition transform w-full sm:w-auto text-center"
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

    </div>
  );
};

export default Home;