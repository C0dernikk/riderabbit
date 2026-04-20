import { motion } from "framer-motion";
import {
  IconCar,
  IconCurrencyRupee,
  IconShieldCheck,
  IconTrendingUp,
  IconArrowRight,
  IconBuildingSkyscraper,
  IconUsers,
  IconHeadset,
  IconCircleCheckFilled,
  IconChartBar,
  IconLock,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

function Enterprise() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  const handleVendorAction = () => {
    if (isAuthenticated) {
      if (currentUser?.role === "user") {
        toast.error("Please log out of your customer account to login as a Vendor.", { duration: 4000 });
      } else if (currentUser?.role === "admin") {
        toast.error("Admins cannot access the vendor portal. Please logout first.");
      } else if (currentUser?.role === "vendor") {
        navigate("/vendorDashboard");
      }
    } else {
      navigate("/vendorSignin");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <div className="bg-white">
      {/* Hero Section - High-end B2B feel */}
      <section className="relative pt-32 pb-48 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-700/10 opacity-20 animate-pulse" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4" />

        <div className="container-max relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] mb-10"
            >
              <IconBuildingSkyscraper size={14} className="mr-2" />
              FOR BUSINESS PARTNERS
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[0.9]"
            >
              SCALE YOUR <span className="text-emerald-400">RENTAL</span> EMPIRE
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed"
            >
              Join the RideRabbit network and turn your fleet into a high-growth
              revenue engine. Professional tools for professional vendors.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <Button
                onClick={handleVendorAction}
                variant="accent"
                className="px-12 py-6 text-xl shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 border-none"
              >
                Start Listing Now
                <IconArrowRight className="ml-2" />
              </Button>
              <Button
                onClick={handleVendorAction}
                variant="secondary"
                className="px-12 py-6 text-xl bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md"
              >
                Vendor Login
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section for Enterprise */}
      <section className="relative z-20 -mt-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="max-w-6xl mx-auto"
        >
          <Card className="p-10 rounded-[3rem] bg-white shadow-2xl border-none grid md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="text-center p-4">
              <div className="text-4xl font-black text-slate-900 mb-2">35%</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Avg. Revenue Increase
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-black text-slate-900 mb-2">2k+</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Active Monthly Riders
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-black text-slate-900 mb-2">0%</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Listing Fees
              </p>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Benefits Grid - Refined visuals */}
      <section className="py-32 bg-white">
        <div className="container-max">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-sm font-black text-emerald-500 tracking-[0.3em] uppercase mb-4">
              The Advantage
            </h2>
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              BUILT FOR <span className="text-emerald-500">GROWTH</span> &
              EFFICIENCY
            </h3>
            <p className="text-xl text-slate-500 font-medium mt-8">
              We provide the platform, you provide the ride. Together, we
              deliver excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <IconTrendingUp size={32} />,
                title: "Higher Revenue",
                desc: "Access thousands of active riders and maximize your vehicle utilization rates effortlessly.",
              },
              {
                icon: <IconLock size={32} />,
                title: "Secure Payments",
                desc: "Automated billing and secure payouts directly to your business account every week.",
              },
              {
                icon: <IconChartBar size={32} />,
                title: "Fleet Analytics",
                desc: "Powerful dashboard to track, manage, and scale your vehicle inventory with data-driven insights.",
              },
              {
                icon: <IconHeadset size={32} />,
                title: "24/7 Support",
                desc: "Dedicated account managers and technical support to ensure your business never stops.",
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.15, type: "spring", stiffness: 120, damping: 14 }}
              >
                <Card className="p-10 h-full border border-transparent hover:border-emerald-200 shadow-card hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-500 group rounded-[2.5rem] bg-white">
                  <div
                    className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-sm"
                  >
                    {benefit.icon}
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
                    {benefit.title}
                  </h4>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {benefit.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - Visual split */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />

        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="max-w-xl">
                <h2 className="text-sm font-black text-emerald-500 tracking-[0.3em] uppercase mb-4">
                  Process
                </h2>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-8">
                  SIMPLE 3-STEP ONBOARDING
                </h3>
              </div>

              <div className="space-y-10">
                {[
                  {
                    step: "01",
                    title: "CREATE YOUR ACCOUNT",
                    desc: "Register as a vendor and complete your business profile in minutes.",
                  },
                  {
                    step: "02",
                    title: "LIST YOUR VEHICLES",
                    desc: "Upload high-quality images and set your pricing and availability.",
                  },
                  {
                    step: "03",
                    title: "START EARNING",
                    desc: "Your vehicles go live on our platform and you start receiving bookings.",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="flex gap-8 group"
                  >
                    <span className="text-5xl font-black text-slate-300 group-hover:text-emerald-500/50 transition-colors duration-500 leading-none">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-[4rem] rotate-3 scale-105" />
              <Card className="relative z-10 p-0 overflow-hidden border-none shadow-2xl rounded-[4rem]">
                <img
                  src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Modern Office"
                  className="w-full h-[600px] object-cover hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/60 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                    <IconCircleCheckFilled size={24} />
                  </div>
                  <p className="text-white font-bold text-lg">
                    Trusted by 500+ global partners
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Impactful */}
      <section className="py-32 bg-white">
        <div className="container-max">
          <Card className="bg-emerald-600 p-12 md:p-32 text-center border-none shadow-2xl overflow-hidden relative rounded-[4rem]">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-20" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-[0.95]">
                READY TO TRANSFORM YOUR BUSINESS?
              </h2>
              <p className="text-xl text-slate-300 mb-16 font-medium">
                Join the RideRabbit family today and start reaching more
                customers than ever before. Your fleet's future starts here.
              </p>
              <Button
                onClick={handleVendorAction}
                variant="accent"
                className="px-12 py-6 text-xl shadow-2xl shadow-emerald-500/40 bg-white text-emerald-600 hover:bg-emerald-50 border-none"
              >
                Become a Partner Now
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default Enterprise;
