import React, { useState } from 'react';
import { School, CheckCircle, AlertCircle, Send, Globe, Mail, MapPin } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';

const RegisterInstitution: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    location: '',
    description: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connect({ connector: connectors[0] });
      return;
    }
    
    // In a production app, this would send to a database/backend
    // For now, we simulate a successful registration request
    console.log('Registration Request:', { ...formData, wallet: address });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
          <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Application Submitted!</h1>
          <p className="text-slate-600 mb-8">
            Thank you for registering <strong>{formData.name}</strong>. Our administrators will review your application and authorize your wallet address (<strong>{address?.slice(0, 6)}...{address?.slice(-4)}</strong>) shortly.
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

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4 text-indigo-600">
          <School className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Institution Registration</h1>
        <p className="text-slate-600">Join the CertiChain network to issue verified, tamper-proof academic credentials.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Institution Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="e.g. Global University of Technology"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="admin@university.edu"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="url"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="https://www.university.edu"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="e.g. London, UK"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Brief Description</label>
              <textarea
                rows={3}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                placeholder="Describe your institution..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">
                Registering will link your currently connected wallet (<strong>{isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not Connected'}</strong>) to your institution's profile.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition shadow-md hover:shadow-xl flex items-center justify-center gap-2"
            >
              {!isConnected ? 'Connect Wallet to Register' : (
                <>
                  <Send className="h-5 w-5" />
                  Submit Registration Request
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterInstitution;