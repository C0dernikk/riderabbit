import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IconUsers,
  IconCar,
  IconCalendarEvent,
  IconCurrencyRupee,
  IconTrendingUp,
  IconArrowUpRight,
  IconClock,
  IconCheck,
} from "@tabler/icons-react";
import { adminService } from "../../../services/admin";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import RevenueChart from "../../../components/shared/RevenueChart";
import BookingStatusChart from "../../../components/shared/BookingStatusChart";
import toast from "react-hot-toast";

const AdminHomeMain = () => {
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
      
      const reqData = await adminService.getVendorRequests();
      setPendingRequests(reqData?.count || 0);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportReport = () => {
    if (!stats) return;
    try {
      const doc = new jsPDF();
      
      // Add Title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("RideRabit Platform Report", 14, 22);
      
      // Add Date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`Generated on: ${dateStr}`, 14, 30);
      
      // Add Table
      const tableColumn = ["Metric", "Value"];
      const tableRows = [
        ["Total Vehicles", stats.totalVehicles?.toString() || "0"],
        ["Total Bookings", stats.totalBookings?.toString() || "0"],
        ["Active Bookings", stats.activeBookings?.toString() || "0"],
        ["Completed Bookings", stats.completedBookings?.toString() || "0"],
        ["Total Revenue", `Rs. ${stats.totalRevenue?.toLocaleString() || "0"}`],
      ];
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129] }, // Emerald 500
        styles: { fontSize: 12, cellPadding: 6 },
      });
      
      const fileName = `riderabit_admin_report_${new Date().toISOString().split("T")[0]}.pdf`;
      
      // Use Data URI to bypass Blob URL filename stripping in sandboxed environments
      const dataUri = doc.output('datauristring');
      const link = document.createElement("a");
      link.href = dataUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("PDF Report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF report");
      console.error(error);
    }
  };

  const handleSystemStatus = async () => {
    setIsStatusModalOpen(true);
    setStatusLoading(true);
    setSystemHealth(null);
    
    try {
      const startTime = Date.now();
      const healthData = await adminService.checkSystemHealth();
      const latency = Date.now() - startTime;
      
      setSystemHealth({
        ...healthData,
        latency: latency + "ms"
      });
    } catch (error) {
      setSystemHealth({
        dbStatus: "error",
        paymentStatus: "error",
        latency: "Timeout"
      });
      toast.error("Failed to reach diagnostic endpoints");
    } finally {
      setStatusLoading(false);
    }
  };

  const statCards = stats
    ? [
        {
          title: "Total Vehicles",
          amount: stats.totalVehicles,
          icon: <IconCar size={24} />,
          color: "bg-primary-500",
          lightColor: "bg-primary-50",
          textColor: "text-primary-600",
          trend: "+12%",
        },
        {
          title: "Total Bookings",
          amount: stats.totalBookings,
          icon: <IconCalendarEvent size={24} />,
          color: "bg-emerald-500",
          lightColor: "bg-emerald-50",
          textColor: "text-emerald-600",
          trend: "+8%",
        },
        {
          title: "Active Bookings",
          amount: stats.activeBookings,
          icon: <IconClock size={24} />,
          color: "bg-primary-500",
          lightColor: "bg-primary-50",
          textColor: "text-primary-600",
          trend: "+5%",
        },
        {
          title: "Completed",
          amount: stats.completedBookings,
          icon: <IconCheck size={24} />,
          color: "bg-slate-500",
          lightColor: "bg-slate-100",
          textColor: "text-slate-600",
          trend: "+15%",
        },
      ]
    : [];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            Admin <span className="text-primary-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            className="bg-white border-slate-200"
            onClick={handleExportReport}
          >
            Export Report
          </Button>
          <Button
            variant="primary"
            className="shadow-lg shadow-primary-600/20"
            onClick={handleSystemStatus}
          >
            System Status
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm"
              />
            ))
          : statCards.map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 hover:shadow-hover transition-all duration-300 border-none bg-white group">
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-2xl ${stat.lightColor} ${stat.textColor} group-hover:scale-110 transition-transform`}
                    >
                      {stat.icon}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                      <IconTrendingUp size={14} />
                      {stat.trend}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">
                      {stat.amount}
                    </h3>
                  </div>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Overview */}
        <div className="lg:col-span-2">
          <Card className="p-8 border-none bg-white shadow-premium overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Revenue Overview
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Platform earnings this month
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Total Revenue
                </p>
                <div className="flex items-center justify-end text-2xl font-black text-slate-900">
                  <IconCurrencyRupee size={24} className="text-emerald-500" />
                  {stats?.totalRevenue?.toLocaleString() || "0"}
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full mt-4">
              <RevenueChart data={stats?.monthlyRevenue || []} />
            </div>

            <div className="absolute top-0 right-0 p-8 opacity-5">
              <IconTrendingUp size={120} />
            </div>
          </Card>

          {/* Booking Distribution */}
          <div className="h-[400px]">
            <BookingStatusChart data={stats?.bookingStatusDistribution || []} />
          </div>
        </div>

        {/* Quick Actions / Recent Activity Placeholder */}
        <div className="space-y-6">
          <Card className="p-6 border-none bg-primary-900 text-white shadow-premium overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Ready for more?</h3>
              <p className="text-slate-300 text-sm mb-6">
                Explore detailed analytics and download system reports.
              </p>
              <button className="flex items-center gap-2 bg-white text-primary-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all">
                View Reports
                <IconArrowUpRight size={18} />
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-110 transition-transform duration-500">
              <IconTrendingUp size={160} />
            </div>
          </Card>

          <Card className="p-6 border-none bg-white shadow-premium">
            <h3 className="text-lg font-black text-slate-900 mb-4">
              System Alerts
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Database Backup
                  </p>
                  <p className="text-xs text-slate-500">
                    Completed successfully at 04:00 AM
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`w-2 h-2 rounded-full ${pendingRequests > 0 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-primary-500 shadow-[0_0_8px_rgba(37,99,235,0.5)]"} mt-1.5`} />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Vendor Requests
                  </p>
                  <p className="text-xs text-slate-500">
                    {pendingRequests === 0 
                      ? "All caught up! No pending requests." 
                      : `${pendingRequests} pending request${pendingRequests > 1 ? 's' : ''} require${pendingRequests === 1 ? 's' : ''} review`}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* System Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">System Status</h2>
              <button 
                onClick={() => setIsStatusModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <IconCheck className="text-slate-500" size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Database Connection</p>
                  <p className="text-xs text-slate-500">MongoDB Cluster</p>
                </div>
                {statusLoading ? (
                  <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
                ) : systemHealth?.dbStatus === "connected" ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <IconCheck size={16} /> Online
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                    Disconnected
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Payment Gateway</p>
                  <p className="text-xs text-slate-500">Razorpay Configuration</p>
                </div>
                {statusLoading ? (
                  <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
                ) : systemHealth?.paymentStatus === "configured" ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <IconCheck size={16} /> Configured
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                    Missing Keys
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Server Health</p>
                  <p className="text-xs text-slate-500">Response Latency</p>
                </div>
                {statusLoading ? (
                  <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
                ) : (
                  <div className={`font-black text-sm ${systemHealth?.latency === 'Timeout' ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {systemHealth?.latency || "N/A"}
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              className="w-full mt-8" 
              onClick={() => setIsStatusModalOpen(false)}
            >
              Close Diagnostics
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminHomeMain;
