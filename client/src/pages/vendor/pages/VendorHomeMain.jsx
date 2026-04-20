import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IconCar,
  IconCalendarEvent,
  IconCurrencyRupee,
  IconTrendingUp,
  IconArrowUpRight,
  IconClock,
  IconCheck,
} from "@tabler/icons-react";
import { vendorService } from "../../../services/vendor";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import RevenueChart from "../../../components/shared/RevenueChart";
import BookingStatusChart from "../../../components/shared/BookingStatusChart";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const VendorHomeMain = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await vendorService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching vendor stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const exportReport = () => {
    if (!stats) return;
    try {
      const doc = new jsPDF();
      
      // Add Title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("RideRabit Vendor Earnings Report", 14, 22);
      
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
        ["My Vehicles", stats.totalVehicles?.toString() || "0"],
        ["Total Bookings", stats.totalBookings?.toString() || "0"],
        ["Active Bookings", stats.activeBookings?.toString() || "0"],
        ["Completed Bookings", stats.completedBookings?.toString() || "0"],
        ["Total Earnings", `Rs. ${stats.totalRevenue?.toLocaleString() || "0"}`],
      ];
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] }, // Blue 500 for vendor
        styles: { fontSize: 12, cellPadding: 6 },
      });
      
      const fileName = `riderabit_vendor_report_${new Date().toISOString().split("T")[0]}.pdf`;
      
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

  const statCards = stats
    ? [
        {
          title: "My Vehicles",
          amount: stats.totalVehicles,
          icon: <IconCar size={24} />,
          color: "bg-primary-500",
          lightColor: "bg-primary-50",
          textColor: "text-primary-600",
        },
        {
          title: "Total Bookings",
          amount: stats.totalBookings,
          icon: <IconCalendarEvent size={24} />,
          color: "bg-emerald-500",
          lightColor: "bg-emerald-50",
          textColor: "text-emerald-600",
        },
        {
          title: "Active Bookings",
          amount: stats.activeBookings,
          icon: <IconClock size={24} />,
          color: "bg-primary-500",
          lightColor: "bg-primary-50",
          textColor: "text-primary-600",
        },
        {
          title: "Completed",
          amount: stats.completedBookings,
          icon: <IconCheck size={24} />,
          color: "bg-slate-500",
          lightColor: "bg-slate-100",
          textColor: "text-slate-600",
        },
      ]
    : [];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            Vendor <span className="text-primary-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your fleet and track your earnings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="bg-white border-slate-200" onClick={exportReport}>
            Download Report
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
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 border-none bg-white shadow-premium overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Earnings Overview
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Your revenue from completed trips
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Total Earnings
                </p>
                <div className="flex items-center justify-end text-2xl font-black text-slate-900">
                  <IconCurrencyRupee size={24} className="text-emerald-500" />
                  {stats?.totalRevenue?.toLocaleString() || "0"}
                </div>
              </div>
            </div>

            <div className="h-[300px] mt-4">
              <RevenueChart data={stats?.monthlyEarnings || []} />
            </div>
          </Card>

          {/* Booking Distribution */}
          <div className="h-[400px]">
            <BookingStatusChart data={stats?.bookingStatusDistribution || []} />
          </div>
        </div>

        {/* Quick Tips */}
        <div className="space-y-6">
          <Card className="p-6 border-none bg-primary-900 text-white shadow-premium overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Boost your sales!</h3>
              <p className="text-slate-300 text-sm mb-6">
                Add more vehicles to your fleet to increase your chances of
                getting booked.
              </p>
              <button className="flex items-center gap-2 bg-white text-primary-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all">
                Add Vehicle
                <IconArrowUpRight size={18} />
              </button>
            </div>
          </Card>

          <Card className="p-6 border-none bg-white shadow-premium">
            <h3 className="text-lg font-black text-slate-900 mb-4">
              Vendor Tips
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 shrink-0">
                  <IconCheck size={14} />
                </div>
                <p className="text-sm text-slate-600">
                  Keep your vehicle images high quality.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 shrink-0">
                  <IconCheck size={14} />
                </div>
                <p className="text-sm text-slate-600">
                  Respond quickly to booking requests.
                </p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorHomeMain;
