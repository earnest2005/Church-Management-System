import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { Shield, ShieldAlert, UserCheck, Loader2, Trash2 } from 'lucide-react';

export default function Staff() {
  const { userRole, currentUser } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [defaultAdminEmail, setDefaultAdminEmail] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch default admin email to know who is the absolute admin
        const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
        if (settingsSnap.exists()) {
          setDefaultAdminEmail(settingsSnap.data().defaultAdminEmail || '');
        }

        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  async function handleRoleChange(userId, newRole) {
    if (userRole !== 'Admin') {
      await showAlert('Access Denied', 'Only Admins can change user roles.', 'error');
      return;
    }
    
    try {
      setUpdating(true);
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
      await showAlert('Error', 'Failed to update user role.', 'error');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteUser(userId, userName) {
    if (userRole !== 'Admin') {
      await showAlert('Access Denied', 'Only Admins can delete users.', 'error');
      return;
    }
    
    const confirmed = await showConfirm(
      'Delete User',
      `Are you sure you want to permanently delete the user ${userName}? This action cannot be undone.`,
      { danger: true, confirmText: 'Delete User' }
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      setUpdating(true);
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      await showAlert('Error', 'Failed to delete user.', 'error');
    } finally {
      setUpdating(false);
    }
  }

  if (userRole !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500">
        <div className="h-24 w-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="h-12 w-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          You need Administrator privileges to access the Staff Management portal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Staff Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system access and assign roles to staff members.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Current Role</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-royal-blue mb-4" />
                    Loading staff data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isDefaultAdmin = user.email === defaultAdminEmail;
                  const isCurrentUser = user.id === currentUser?.uid;
                  
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-royal-gold to-yellow-200 flex items-center justify-center text-royal-dark font-bold mr-3 shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {user.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs font-semibold text-royal-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">You</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                          ${isDefaultAdmin ? 'bg-royal-blue/10 text-royal-blue dark:bg-royal-blue/20 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
                        `}>
                          {isDefaultAdmin ? <Shield className="w-3 h-3 mr-1" /> : <UserCheck className="w-3 h-3 mr-1" />}
                          {isDefaultAdmin ? 'Admin' : user.role || 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isDefaultAdmin ? (
                          <span className="text-xs text-slate-400 italic">Managed in Settings</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={updating || isDefaultAdmin}
                              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-royal-blue focus:border-royal-blue block p-2 transition-colors disabled:opacity-50"
                            >
                              <option value="Staff">Staff</option>
                              <option value="Member">Member</option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                              disabled={updating}
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
