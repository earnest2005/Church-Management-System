import React, { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [totalMembers, setTotalMembers] = useState(0);
  const [monthlyOfferings, setMonthlyOfferings] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true);
        // Fetch Members count
        const membersSnap = await getDocs(collection(db, 'members'));
        setTotalMembers(membersSnap.size);

        // Fetch Offerings for this month & build chart data
        const offeringsSnap = await getDocs(collection(db, 'offerings'));
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let total = 0;
        
        // Initialize 6 months of data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentYear, currentMonth - i, 1);
          last6Months.push({
            name: monthNames[d.getMonth()],
            monthIndex: d.getMonth(),
            year: d.getFullYear(),
            total: 0
          });
        }
        
        offeringsSnap.forEach(doc => {
          const data = doc.data();
          const d = data.date.toDate();
          
          // Add to current month's total if it matches
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            total += Number(data.amount);
          }
          
          // Add to chart data if it falls in the last 6 months
          const chartDataIndex = last6Months.findIndex(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
          if (chartDataIndex !== -1) {
            last6Months[chartDataIndex].total += Number(data.amount);
          }
        });
        
        setMonthlyOfferings(total);
        setChartData(last6Months);

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back to the Royal Apostolic Church portal.</p>
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
          User: <span className="text-royal-blue dark:text-blue-400">{currentUser?.email}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 transform duration-300">
            <Users className="h-16 w-16 text-royal-blue" />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Members</h3>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              {loading ? '...' : totalMembers}
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center">
              Active Congregation
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-royal-blue to-blue-900 p-6 rounded-3xl shadow-lg shadow-blue-900/20 dark:shadow-none relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 transform duration-300">
            <TrendingUp className="h-16 w-16 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Monthly Offerings</h3>
            <p className="text-4xl font-extrabold text-white mt-2">
              {loading ? '...' : formatCurrency(monthlyOfferings)}
            </p>
            <p className="text-sm text-royal-gold font-medium mt-2 flex items-center">
              Total received this month
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 transform duration-300">
            <Activity className="h-16 w-16 text-royal-gold" />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Active Groups</h3>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">12</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2">
              Across 3 main ministries
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px] flex flex-col transition-colors duration-300">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Offerings Trend (Last 6 Months)</h3>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Activity className="h-8 w-8 text-slate-400 dark:text-slate-500 animate-pulse mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Loading analytics...</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto mt-4">
            <div style={{ minWidth: '600px', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                    formatter={(value) => [formatCurrency(value), 'Offerings']}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#1d4ed8" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
