import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { Search, Plus, TrendingUp, Calendar, CreditCard, Loader2 } from 'lucide-react';

export default function Offerings() {
  const { currentUser } = useAuth();
  const [offerings, setOfferings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const { showAlert } = useModal();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'General Offering',
    paymentMethod: 'Cash',
    memberId: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      // Fetch Offerings
      const q = query(collection(db, 'offerings'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const offeringsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOfferings(offeringsData);

      // Fetch Members for the dropdown
      const membersSnap = await getDocs(collection(db, 'members'));
      const membersData = membersSnap.docs.map(doc => ({
        id: doc.id,
        name: `${doc.data().firstName} ${doc.data().lastName}`
      }));
      setMembers(membersData);

      // Calculate this month's total
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthTotal = offeringsData.reduce((acc, curr) => {
        const d = curr.date.toDate();
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          return acc + Number(curr.amount);
        }
        return acc;
      }, 0);
      setTotalThisMonth(monthTotal);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOffering(e) {
    e.preventDefault();
    if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      await showAlert('Invalid Amount', 'Please enter a valid amount greater than 0.', 'warning');
      return;
    }
    
    try {
      setSubmitting(true);
      const dateObj = new Date(formData.date);
      
      const memberName = formData.memberId 
        ? members.find(m => m.id === formData.memberId)?.name || 'Unknown' 
        : 'Anonymous';

      await addDoc(collection(db, 'offerings'), {
        amount: Number(formData.amount),
        type: formData.type,
        paymentMethod: formData.paymentMethod,
        memberId: formData.memberId || null,
        memberName: memberName,
        date: Timestamp.fromDate(dateObj),
        recordedBy: currentUser?.email,
        createdAt: Timestamp.now()
      });
      
      setIsModalOpen(false);
      setFormData({
        amount: '',
        type: 'General Offering',
        paymentMethod: 'Cash',
        memberId: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error recording offering:", error);
      await showAlert('Error', 'Failed to record offering. Check console for details.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const filteredOfferings = offerings.filter(offering => {
    const search = searchQuery.toLowerCase();
    return (
      offering.type.toLowerCase().includes(search) ||
      offering.paymentMethod.toLowerCase().includes(search) ||
      (offering.memberName && offering.memberName.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Financial Records</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track tithes, general offerings, and special funds.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-2.5 bg-royal-blue hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors shadow-md shadow-blue-900/20"
        >
          <Plus className="h-5 w-5 mr-2" />
          Record Offering
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-royal-blue to-blue-900 p-6 rounded-3xl shadow-lg shadow-blue-900/20 relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 transform duration-300">
            <TrendingUp className="h-16 w-16 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Total Offerings (This Month)</h3>
            <p className="text-4xl font-extrabold text-white mt-2">{formatCurrency(totalThisMonth)}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Calendar className="h-16 w-16 text-slate-900 dark:text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Records</h3>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">{offerings.length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center transition-colors">
        <Search className="h-5 w-5 text-slate-400 ml-2" />
        <input 
          type="text"
          placeholder="Search by name, type, or payment method..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white ml-2 placeholder-slate-400"
        />
      </div>

      {/* Offerings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-royal-blue mb-4" />
                    Loading records...
                  </td>
                </tr>
              ) : filteredOfferings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredOfferings.map((offering) => (
                  <tr key={offering.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      {offering.date.toDate().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {offering.memberName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {offering.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {offering.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(offering.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Offering Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Record Manual Offering</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddOffering} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-500 font-bold">₹</span>
                  <input 
                    type="number" required min="1" step="any"
                    value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-royal-blue dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Offering Type</label>
                  <select 
                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-royal-blue dark:text-white"
                  >
                    <option value="Tithe">Tithe</option>
                    <option value="General Offering">General Offering</option>
                    <option value="Building Fund">Building Fund</option>
                    <option value="Missions">Missions</option>
                    <option value="Thanksgiving">Thanksgiving</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select 
                    value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-royal-blue dark:text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Manual Entry">Manual Entry (Other)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Linked Member (Optional)</label>
                <select 
                  value={formData.memberId} onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-royal-blue dark:text-white"
                >
                  <option value="">-- Anonymous / Walk-in --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input 
                  type="date" required
                  value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-royal-blue dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={submitting}
                  className="px-5 py-2 bg-royal-blue hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors shadow-md shadow-blue-900/20 disabled:opacity-50 flex items-center"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
