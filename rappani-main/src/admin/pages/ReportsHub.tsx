import React from 'react';
import { Download, FileText, BarChart2, Users, ShoppingBag, Truck, Calendar } from 'lucide-react';

const REPORTS = [
  { id: 'RPT-01', title: 'Sales Summary', description: 'Overview of total sales, discounts, and net revenue.', icon: BarChart2 },
  { id: 'RPT-02', title: 'Inventory & Stock', description: 'Current stock levels, low stock alerts, and product performance.', icon: ShoppingBag },
  { id: 'RPT-03', title: 'Customer Analytics', description: 'New vs returning customers, average order value, and top spenders.', icon: Users },
  { id: 'RPT-04', title: 'Order Fulfillment', description: 'Delivery times, pending shipments, and shipping costs.', icon: Truck },
  { id: 'RPT-05', title: 'Monthly Tax Report', description: 'Tax collected per order, GST breakdowns, and financial summaries.', icon: FileText },
];

export default function ReportsHub() {
  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Export your store data for accounting, analysis, and auditing.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm text-sm font-medium text-gray-700">
            <Calendar size={16} className="text-gray-400" />
            Last 30 Days
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full group hover:border-gray-200 transition-colors">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 mb-4 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-grow">{report.description}</p>
              
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md py-2 hover:bg-gray-100 transition-colors">
                  <Download size={14} />
                  CSV
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md py-2 hover:bg-gray-100 transition-colors">
                  <Download size={14} />
                  PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
