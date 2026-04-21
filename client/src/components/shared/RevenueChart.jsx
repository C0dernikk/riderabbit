import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RevenueChart = ({ data = [] }) => {
  const chartData = data.map(item => {
    const monthIndex = item?._id?.month ? item._id.month - 1 : 0;
    return {
      name: MONTHS[monthIndex] || `Month`,
      Revenue: item.revenue || item.count || 0
    };
  });

  if (chartData.length === 0) {
    return (
      <Card className="flex items-center justify-center h-[350px] border-none shadow-premium bg-white">
        <p className="text-slate-500 font-bold">No revenue data available yet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-none shadow-premium bg-white">
      <h3 className="text-lg font-black text-slate-800 mb-6">Revenue Over Time</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} tickFormatter={(value) => `₹${value}`} />
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              formatter={(value) => [`₹${value}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RevenueChart;
