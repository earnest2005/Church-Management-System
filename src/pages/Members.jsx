import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useModal } from '../contexts/ModalContext';
import { Search, UserPlus, Loader2, Trash2, Power, QrCode, Copy, Check, Printer, Download, ExternalLink, Church } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showAlert, showConfirm } = useModal();
  
  // Manual Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);

  // QR Code Modal state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    fetchMembers();
    // Default registration URL based on window location
    const host = window.location.host;
    const protocol = window.location.protocol;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Provide network IP alternative default if on localhost
      const port = window.location.port || '5173';
      setRegistrationUrl(`${protocol}//192.168.1.36:${port}/register`);
    } else {
      setRegistrationUrl(`${protocol}//${host}/register`);
    }
  }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      const q = query(collection(db, 'members'), orderBy('firstName'));
      const querySnapshot = await getDocs(q);
      const membersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await addDoc(collection(db, 'members'), {
        ...formData,
        createdAt: serverTimestamp(),
        source: 'Manual Registration'
      });
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', address: '', phone: '', status: 'Active' });
      fetchMembers(); // Refresh list
    } catch (error) {
      console.error("Error adding member:", error);
      await showAlert('Error', 'Failed to add member. Check console for details.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(memberId, currentStatus, memberName) {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const confirmed = await showConfirm(
      `${newStatus === 'Active' ? 'Activate' : 'Deactivate'} Member`,
      `Are you sure you want to change ${memberName}'s status to ${newStatus}?`,
      { confirmText: 'Yes, change status' }
    );
    if (!confirmed) return;

    try {
      await updateDoc(doc(db, 'members', memberId), { status: newStatus });
      setMembers(members.map(m => m.id === memberId ? { ...m, status: newStatus } : m));
    } catch (error) {
      console.error("Error updating status:", error);
      await showAlert('Error', 'Failed to update member status.', 'error');
    }
  }

  async function handleDeleteMember(memberId, memberName) {
    const confirmed = await showConfirm(
      'Delete Member',
      `Are you sure you want to permanently delete ${memberName} from the directory? This action cannot be undone.`,
      { danger: true, confirmText: 'Delete Member' }
    );
    
    if (!confirmed) return;
    
    try {
      await deleteDoc(doc(db, 'members', memberId));
      setMembers(members.filter(m => m.id !== memberId));
    } catch (error) {
      console.error("Error deleting member:", error);
      await showAlert('Error', 'Failed to delete member.', 'error');
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadQr() {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'church_registration_qr.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }

  function handlePrintQr() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgElement = qrRef.current?.querySelector('svg');
    const svgData = svgElement ? new XMLSerializer().serializeToString(svgElement) : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Church Registration QR Code</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 40px;
              box-sizing: border-box;
              text-align: center;
            }
            .card {
              border: 3px solid #1e3a8a;
              border-radius: 24px;
              padding: 48px;
              max-width: 480px;
              width: 100%;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header {
              font-size: 28px;
              font-weight: 900;
              color: #1e3a8a;
              margin-bottom: 8px;
            }
            .sub {
              font-size: 16px;
              color: #475569;
              margin-bottom: 32px;
            }
            .qr-wrapper {
              display: flex;
              justify-content: center;
              margin-bottom: 32px;
            }
            .instructions {
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 8px;
            }
            .url {
              font-size: 14px;
              color: #64748b;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">Royal Apostolic Church</div>
            <div class="sub">Congregation Member Registration</div>
            <div class="qr-wrapper">
              ${svgData}
            </div>
            <div class="instructions">Scan to Join & Register</div>
            <div class="url">${registrationUrl}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const filteredMembers = members.filter(member => 
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.address && member.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Member Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage, register, and view all congregation members.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-[0.98]"
          >
            <QrCode className="h-5 w-5 mr-2" />
            Registration QR Code
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-royal-blue hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors shadow-md shadow-blue-900/20"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Member (Manual)
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center transition-colors">
        <Search className="h-5 w-5 text-slate-400 ml-2" />
        <input 
          type="text"
          placeholder="Search by name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white ml-2 placeholder-slate-400"
        />
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-royal-blue mb-4" />
                    Loading members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-royal-gold to-yellow-200 flex items-center justify-center text-royal-dark font-bold mr-3 shrink-0">
                          {member.firstName ? member.firstName.charAt(0) : ''}{member.lastName ? member.lastName.charAt(0) : ''}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {member.firstName} {member.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      <div className="truncate max-w-[200px]" title={member.address}>{member.address || 'No address'}</div>
                      <div>{member.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                        ${member.status === 'Inactive' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : ''}
                        ${member.status === 'Visitor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                      `}>
                        {member.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">
                      {member.source === 'QR Registration' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                          <QrCode className="w-3 h-3 mr-1" /> QR Code
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Manual
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(member.id, member.status, `${member.firstName} ${member.lastName}`)}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                          title={member.status === 'Active' ? "Deactivate Member" : "Activate Member"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMember(member.id, `${member.firstName} ${member.lastName}`)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Member (Manual)</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input 
                    type="text" required
                    value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-royal-blue dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input 
                    type="text" required
                    value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-royal-blue dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Home Address</label>
                <input 
                  type="text" 
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-royal-blue dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-royal-blue dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select 
                  value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-royal-blue dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Visitor">Visitor</option>
                </select>
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
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-royal-blue to-blue-900 text-white">
              <div className="flex items-center space-x-2">
                <QrCode className="h-6 w-6 text-amber-400" />
                <h3 className="text-lg font-bold">Registration QR Code</h3>
              </div>
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 text-center space-y-5">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Display or print this QR Code. When scanned, members can self-register using their mobile phone.
              </p>

              {/* QR Code Container */}
              <div 
                ref={qrRef}
                className="bg-white p-6 rounded-2xl shadow-inner border border-slate-200 inline-block mx-auto relative group"
              >
                <QRCodeSVG 
                  value={registrationUrl} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* URL Input Box & Copy */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Registration Target URL
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={registrationUrl}
                    onChange={(e) => setRegistrationUrl(e.target.value)}
                    placeholder="https://yourdomain.com/register or http://192.168.1.36:5173/register"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors shrink-0 flex items-center justify-center"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors shrink-0"
                    title="Open Registration Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Local Wi-Fi / Domain Quick Selectors */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">Quick URL:</span>
                  <button
                    type="button"
                    onClick={() => setRegistrationUrl(`http://192.168.1.36:${window.location.port || '5173'}/register`)}
                    className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-medium rounded-lg transition-colors"
                  >
                    Local Wi-Fi IP (192.168.1.36)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationUrl(`${window.location.protocol}//${window.location.host}/register`)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[11px] font-medium rounded-lg transition-colors"
                  >
                    Browser Default
                  </button>
                </div>

                {/* Helpful tip for mobile scanning */}
                {registrationUrl.includes('localhost') && (
                  <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-300">
                    💡 <strong>Scanning from a phone?</strong> Phones on the same Wi-Fi network cannot open <code className="bg-amber-500/20 px-1 rounded">localhost</code>. Click <strong>Local Wi-Fi IP (192.168.1.36)</strong> above or enter your website domain so scanning works on smartphones!
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadQr}
                  className="flex items-center justify-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-sm transition-colors"
                >
                  <Download className="w-4 h-4 mr-2 text-royal-blue dark:text-amber-400" />
                  Download PNG
                </button>
                <button
                  onClick={handlePrintQr}
                  className="flex items-center justify-center px-4 py-2.5 bg-royal-blue hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-blue-900/20"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Poster
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
