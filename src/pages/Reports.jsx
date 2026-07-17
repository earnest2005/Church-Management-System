import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';

export default function Reports() {
  const [downloadingOfferings, setDownloadingOfferings] = useState(false);
  const [downloadingMembers, setDownloadingMembers] = useState(false);
  const [error, setError] = useState('');

  const generateCSV = (data, filename) => {
    if (!data || data.length === 0) {
      setError('No data found to download.');
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadOfferings = async () => {
    try {
      setDownloadingOfferings(true);
      setError('');
      
      const querySnapshot = await getDocs(collection(db, 'offerings'));
      const data = [];
      querySnapshot.forEach((doc) => {
        const item = doc.data();
        data.push({
          id: doc.id,
          amount: item.amount,
          date: item.date ? item.date.toDate().toLocaleDateString() : '',
          type: item.type || '',
          notes: item.notes || '',
        });
      });
      
      generateCSV(data, `offerings_report_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (err) {
      console.error(err);
      setError('Failed to generate offerings report.');
    } finally {
      setDownloadingOfferings(false);
    }
  };

  const handleDownloadMembers = async () => {
    try {
      setDownloadingMembers(true);
      setError('');
      
      const querySnapshot = await getDocs(collection(db, 'members'));
      const data = [];
      querySnapshot.forEach((doc) => {
        const item = doc.data();
        data.push({
          id: doc.id,
          firstName: item.firstName || '',
          lastName: item.lastName || '',
          email: item.email || '',
          phone: item.phone || '',
          joinDate: item.joinDate ? item.joinDate.toDate().toLocaleDateString() : '',
          status: item.status || '',
        });
      });
      
      generateCSV(data, `members_report_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (err) {
      console.error(err);
      setError('Failed to generate members report.');
    } finally {
      setDownloadingMembers(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reports & Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Export your congregation and financial data.</p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center shadow-sm">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offerings Report Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="h-14 w-14 bg-gradient-to-br from-royal-blue to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md shadow-blue-900/20">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financial Offerings</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed mb-6">
            Download a comprehensive CSV report of all recorded offerings, including amounts, dates, and associated notes.
          </p>
          
          <button
            onClick={handleDownloadOfferings}
            disabled={downloadingOfferings}
            className="w-full flex items-center justify-center px-6 py-3 bg-royal-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {downloadingOfferings ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            Download Offerings CSV
          </button>
        </div>

        {/* Members Report Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md shadow-emerald-900/20">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Congregation Members</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed mb-6">
            Export your entire member directory including contact details, join dates, and membership status to a CSV file.
          </p>
          
          <button
            onClick={handleDownloadMembers}
            disabled={downloadingMembers}
            className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {downloadingMembers ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            Download Members CSV
          </button>
        </div>
      </div>
    </div>
  );
}
