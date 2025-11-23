
import React from 'react';
import { Link } from 'react-router-dom';

const kpiData = [
  { title: 'Total Revenue', value: '₹1,25,430', change: '+12.5%', changeType: 'increase' },
  { title: 'Total Jobs', value: '842', change: '+5.2%', changeType: 'increase' },
  { title: 'Active Garages', value: '78', change: '+2', changeType: 'increase' },
  { title: 'Pending Payouts', value: '₹15,600', change: '-3.1%', changeType: 'decrease' },
];

const AdminDashboardPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold text-dark mb-8">Admin Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-accent">
              <h3 className="text-gray-500 text-sm font-medium uppercase">{kpi.title}</h3>
              <p className="text-3xl font-bold text-dark mt-2">{kpi.value}</p>
              <p className={`text-sm font-semibold mt-1 ${kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change} vs last month
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-dark mb-4">Quick Actions</h2>
                <div className="space-y-4">
                    <Link to="/admin/payouts" className="block w-full text-center bg-accent text-white font-bold py-3 px-6 rounded-2xl hover:bg-blue-700 transition-colors duration-300">
                        Manage Payouts
                    </Link>
                    <button className="w-full bg-gray-200 text-dark font-bold py-3 px-6 rounded-2xl hover:bg-gray-300 transition-colors">
                        Export Reports
                    </button>
                     <Link to="/admin/garages" className="block w-full text-center bg-gray-200 text-dark font-bold py-3 px-6 rounded-2xl hover:bg-gray-300 transition-colors">
                        Manage Garages
                    </Link>
                </div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-lg md:col-span-1 lg:col-span-2">
                <h2 className="text-2xl font-bold text-dark mb-4">Recent Activity</h2>
                 <ul className="divide-y divide-gray-200">
                    <li className="py-3">New payout request from "Speedy Services" for ₹2,500.</li>
                    <li className="py-3">"Rider John Doe" completed a job.</li>
                    <li className="py-3">"City Garages" registered as a new partner.</li>
                    <li className="py-3 text-gray-500">Payout of ₹1,800 approved for "Auto Experts".</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
