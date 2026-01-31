import React from 'react';
import { Shield, Lock, Globe, Zap, CheckCircle2, Award, Users, Search } from 'lucide-react';

interface Props {
  setPage: (page: string) => void;
}

const Home: React.FC<Props> = ({ setPage }) => {
  return (
    <div className="pb-20 bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900"></div>

        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-200 text-sm font-medium mb-6 animate-fade-in">
              <Shield className="h-4 w-4" />
              <span>Enterprise-Grade Blockchain Security</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              The Standard for <span className="text-indigo-400">Digital Credentials</span>
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-10 leading-relaxed">
              Issue, verify, and manage tamper-proof academic certificates on the Polygon blockchain.
              We bridge the gap between education and employment with immutable trust.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setPage('verify')}
                className="bg-white text-indigo-900 font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                Verify Certificate
              </button>
              <button
                onClick={() => setPage('issue')}
                className="bg-indigo-600 border border-indigo-400 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-500 hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <Award className="h-5 w-5" />
                Institution Access
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8 text-indigo-200/60 border-t border-white/10 pt-8">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">100%</span>
                <span className="text-xs uppercase tracking-wider">Immutable</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">Instant</span>
                <span className="text-xs uppercase tracking-wider">Verification</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">Global</span>
                <span className="text-xs uppercase tracking-wider">Recognition</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-slate-400 font-semibold text-sm uppercase tracking-[0.2em] mb-8">Trusted by Leading Institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale transition-all hover:opacity-50">
            <div className="flex items-center gap-2 font-black text-2xl md:text-3xl text-slate-600 tracking-tighter">UNIVERSITY</div>
            <div className="flex items-center gap-2 font-black text-2xl md:text-3xl text-slate-600 tracking-tighter">COLLEGE</div>
            <div className="flex items-center gap-2 font-black text-2xl md:text-3xl text-slate-600 tracking-tighter">ACADEMY</div>
            <div className="flex items-center gap-2 font-black text-2xl md:text-3xl text-slate-600 tracking-tighter">INSTITUTE</div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Why CertiChain?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Traditional paper certificates are prone to fraud and slow to verify.
            CertiChain leverages Polygon L2 technology to solve these challenges.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white p-10 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300">
            <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Lock className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Tamper-Proof Security</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              Certificates are minted as Soulbound NFTs. Once issued, they cannot be altered or transferred, ensuring absolute integrity of the student's records.
            </p>
          </div>

          <div className="group bg-white p-10 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300">
            <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Globe className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Global Recognition</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              Employers worldwide can instantly verify credentials without intermediaries or waiting periods using our decentralized verification engine.
            </p>
          </div>

          <div className="group bg-white p-10 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300">
            <div className="bg-amber-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Zap className="h-7 w-7 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Instant Lifecycle</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              From issuance to verification and even revocation, every action happens in seconds on the blockchain, providing real-time data transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="bg-white py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-bold mb-6">
                FOR INSTITUTIONS
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                Empower Your Students with Digital Portability
              </h2>
              <ul className="space-y-6">
                {[
                  "Batch issuance of certificates with low gas fees",
                  "Verified institution registry for cryptographic proof",
                  "Private data hashing for GDPR compliance",
                  "Direct student wallet delivery"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700 text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setPage('issue')}
                className="mt-10 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Register as Institution
              </button>
            </div>
            <div className="flex-1 relative">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-12 text-white shadow-2xl">
                <h3 className="text-3xl font-bold mb-6 italic opacity-50">CERTIFICATE PREVIEW</h3>
                <div className="border-4 border-white/20 p-8 rounded-xl backdrop-blur-sm bg-white/5">
                  <Award className="h-16 w-16 mb-6 opacity-80" />
                  <div className="h-4 w-3/4 bg-white/20 rounded mb-4"></div>
                  <div className="h-4 w-1/2 bg-white/20 rounded mb-8"></div>
                  <div className="flex justify-between items-end">
                    <div className="h-12 w-12 bg-white/10 rounded-full"></div>
                    <div className="h-8 w-32 bg-white/30 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 hidden md:block border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">5,000+</div>
                    <div className="text-slate-500 text-sm">Graduates Secured</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8">
              Ready to Secure the Future?
            </h2>
            <p className="text-indigo-100 text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
              Whether you are an employer looking to verify a candidate or an institution wanting to modernize,
              CertiChain is the platform of choice.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => setPage('verify')}
                className="bg-white text-indigo-700 px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-2xl"
              >
                Start Verification
              </button>
              <button
                onClick={() => setPage('issue')}
                className="bg-indigo-500/30 backdrop-blur-md border border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-500/40 transition"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;