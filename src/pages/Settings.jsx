import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { ShieldAlert, Loader2, AlertTriangle, Save, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { userRole } = useAuth();
  const { showAlert, showConfirm } = useModal();
  
  // States for Settings forms
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [defaultAdminEmail, setDefaultAdminEmail] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // States for Danger Zone
  const [clearingOfferings, setClearingOfferings] = useState(false);
  const [clearingMembers, setClearingMembers] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setChurchName(data.churchName || '');
          setPastorName(data.pastorName || '');
          setDefaultAdminEmail(data.defaultAdminEmail || '');
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (userRole === 'Admin') {
      loadSettings();
    }
  }, [userRole]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setSaveSuccess(false);
      await setDoc(doc(db, 'settings', 'general'), {
        churchName,
        pastorName,
        defaultAdminEmail,
        updatedAt: new Date()
      }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      await showAlert('Error', 'Failed to save settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClearOfferings = async () => {
    const confirmed = await showConfirm(
      'Clear Offerings Data',
      'DANGER: Are you sure you want to delete ALL offerings data? This cannot be undone.',
      { danger: true, confirmText: 'Clear Offerings' }
    );
    if (!confirmed) return;
    
    try {
      setClearingOfferings(true);
      const querySnapshot = await getDocs(collection(db, 'offerings'));
      const deletePromises = querySnapshot.docs.map(document => deleteDoc(doc(db, 'offerings', document.id)));
      await Promise.all(deletePromises);
      await showAlert('Success', 'All offerings data has been successfully cleared.', 'success');
    } catch (err) {
      console.error(err);
      await showAlert('Error', 'Failed to clear offerings data.', 'error');
    } finally {
      setClearingOfferings(false);
    }
  };

  const handleClearMembers = async () => {
    const confirmed = await showConfirm(
      'Clear Members Data',
      'DANGER: Are you sure you want to delete ALL members data? This cannot be undone.',
      { danger: true, confirmText: 'Clear Members' }
    );
    if (!confirmed) return;
    
    try {
      setClearingMembers(true);
      const querySnapshot = await getDocs(collection(db, 'members'));
      const deletePromises = querySnapshot.docs.map(document => deleteDoc(doc(db, 'members', document.id)));
      await Promise.all(deletePromises);
      await showAlert('Success', 'All members data has been successfully cleared.', 'success');
    } catch (err) {
      console.error(err);
      await showAlert('Error', 'Failed to clear members data.', 'error');
    } finally {
      setClearingMembers(false);
    }
  };

  if (userRole !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500">
        <div className="h-24 w-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="h-12 w-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          You need Administrator privileges to access the System Settings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure global application settings and preferences.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 space-y-8">
          
          {/* Church Details Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Church Details</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">These details will be displayed across the application and reports.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Church Name
                </label>
                <input
                  type="text"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-all"
                  placeholder="e.g. Royal Apostolic Church"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Pastor's Name
                </label>
                <input
                  type="text"
                  value={pastorName}
                  onChange={(e) => setPastorName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-all"
                  placeholder="e.g. Rev. John Doe"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

          {/* Admin Configuration Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Access Control</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Strictly define who has ultimate administrative access to the system.</p>
            </div>
            
            <div className="space-y-2 max-w-md">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Default Admin Email
              </label>
              <input
                type="email"
                required
                value={defaultAdminEmail}
                onChange={(e) => setDefaultAdminEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-all"
                placeholder="admin@church.com"
              />
              <p className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-1">
                Warning: Only this exact email address will be granted the 'Admin' role. Changing this to an email you do not own will immediately lock you out of Settings and Staff Management.
              </p>
            </div>
          </div>
          
          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={savingSettings}
              className="flex items-center justify-center px-8 py-3 bg-royal-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {savingSettings ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Save Configuration
            </button>
            {saveSuccess && (
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-in fade-in duration-300">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Settings saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-500 mr-3" />
          <h2 className="text-xl font-bold text-rose-700 dark:text-rose-400">Danger Zone</h2>
        </div>
        <p className="text-rose-600/80 dark:text-rose-400/80 text-sm mb-6 max-w-2xl">
          The actions below are permanent and cannot be undone. Please be certain before proceeding. Clearing data will reset the respective dashboard statistics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleClearOfferings}
            disabled={clearingOfferings}
            className="flex items-center justify-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {clearingOfferings ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            Clear Offerings Data
          </button>
          
          <button
            onClick={handleClearMembers}
            disabled={clearingMembers}
            className="flex items-center justify-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {clearingMembers ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            Clear Members Data
          </button>
        </div>
      </div>
    </div>
  );
}
