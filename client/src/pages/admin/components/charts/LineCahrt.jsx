import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const LineCahrt = ({ data, dataKeyName = "Bookings" }) => {
  // Map backend monthly stats to Recharts format
  // Fallback to empty array if no data
  const formattedData = data && data.length > 0 
    ? data.map((item) => ({
        name: monthNames[(item._id?.month || 1) - 1],
        [dataKeyName]: item.count || 0,
      }))
    : [
        { name: "Jan", [dataKeyName]: 0 },
        { name: "Feb", [dataKeyName]: 0 },
        { name: "Mar", [dataKeyName]: 0 },
        { name: "Apr", [dataKeyName]: 0 },
        { name: "May", [dataKeyName]: 0 },
      ]; // Mock fallback data if backend returns nothing initially

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
          dx={-10}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: "12px", 
            border: "none", 
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            fontWeight: "bold"
          }} 
        />
        <Line
          type="monotone"
          dataKey={dataKeyName}
          stroke="#10b981"
          strokeWidth={4}
          dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 8, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineCahrt;
