import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../ui/Card';

const COLORS = {
  BOOKED: '#3b82f6', // Blue
  PICKED_UP: '#f59e0b', // Amber
  ON_TRIP: '#8b5cf6', // Purple
  TRIP_ENDED: '#14b8a6', // Teal
  TRIP_COMPLETED: '#10b981', // Green
  CANCELED: '#ef4444', // Red
  OVERDUE: '#f43f5e' // Rose
};

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const BookingStatusChart = ({ data = [] }) => {
  // Format data: data comes as { _id: "TRIP_COMPLETED", count: 5 }
  const chartData = data.map(item => ({
    name: formatStatus(item._id),
    value: item.count,
    color: COLORS[item._id] || '#cbd5e1'
  }));

  if (chartData.length === 0) {
    return (
      <Card className="flex items-center justify-center h-[350px] border-none shadow-premium bg-white">
        <p className="text-slate-500 font-bold">No bookings data available yet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-none shadow-premium bg-white h-full">
      <h3 className="text-lg font-black text-slate-800 mb-6">Booking Distribution</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default BookingStatusChart;
