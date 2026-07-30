import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Church, CheckCircle2, Loader2, User, Phone, MapPin, Sparkles } from 'lucide-react';

export default function PublicRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, 'members'), {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        status: formData.status || 'Active',
        createdAt: serverTimestamp(),
        source: 'QR Registration'
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting registration:', err);
      setError('Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setFormData({
      firstName: '',
      lastName: '',
      address: '',
      phone: '',
      status: 'Active'
    });
    setSubmitted(false);
    setError('');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 relative z-10">
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-royal-blue to-blue-900 px-6 py-8 text-center border-b border-slate-700/50">
          <div className="inline-flex h-14 w-14 bg-royal-gold rounded-2xl items-center justify-center mb-3 shadow-lg shadow-amber-500/20 ring-4 ring-white/10">
            <Church className="h-8 w-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Royal Apostolic Church</h1>
          <p className="text-amber-300/90 text-sm font-semibold mt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" /> Congregation Registration
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-8 space-y-5 animate-in zoom-in-95 duration-300">
              <div className="h-20 w-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Welcome to the Family!</h2>
                <p className="text-slate-400 mt-2 text-sm">
                  Thank you, <span className="text-amber-400 font-semibold">{formData.firstName} {formData.lastName}</span>. Your registration has been successfully recorded in our system.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3.5 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-2xl transition-colors text-sm shadow-md"
                >
                  Register Another Member
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-sm text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  First Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/80 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Last Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/80 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/80 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Home Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Street, City, Area..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/80 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Member Type
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-400/80 transition-all text-sm"
                >
                  <option value="Active">Regular Member</option>
                  <option value="Visitor">First-Time Visitor</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700/40 text-center text-slate-500 text-xs">
          Royal Apostolic Church Management System
        </div>
      </div>
    </div>
  );
}
