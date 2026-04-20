import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  IconChevronRight,
  IconCar,
  IconShieldCheck,
  IconClock,
  IconStarFilled,
  IconArrowRight,
  IconCircleCheckFilled,
  IconUsers,
  IconMapPin,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { useSelector, useDispatch } from "react-redux";

import Herocar from "../../assets/homepage_car_copy.jpeg";
import CarSearch from "./CarSearch";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import VehicleCard from "../../components/shared/VehicleCard";
import { fetchAllVehicles } from "../../features/vehicles/vehiclesSlice";

function Home() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { vehicles, isLoading } = useSelector((state) => state.vehicles);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  useEffect(() => {
    dispatch(fetchAllVehicles()).then((res) => {
      if (res.payload) {
        setFeaturedVehicles(res.payload.slice(0, 3));
      }
    });
  }, [dispatch]);

  const scrollToBook = () =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  const stats = [
    { label: "Happy Customers", value: "2k+", icon: <IconUsers size={20} /> },
    { label: "Premium Vehicles", value: "500+", icon: <IconCar size={20} /> },
    { label: "Cities Covered", value: "50+", icon: <IconMapPin size={20} /> },
    {
      label: "Booking Done",
      value: "10k+",
      icon: <IconCalendarEvent size={20} />,
    },
  ];

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Hero Section - Balanced for Visual Harmony */}
      <section className="relative min-h-[95vh] flex items-center pt-32 pb-24 bg-slate-950 overflow-hidden">
        {/* Abstract Background elements */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-primary-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-accent-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        <div className="container-max relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-3xl text-center lg:text-left"
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-accent-500 text-[11px] font-black uppercase tracking-[0.2em] mb-10"
              >
                <span className="relative flex h-2 w-2 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                </span>
                The Future of Car Rentals
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-10"
              >
                DRIVE YOUR <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-emerald-400">DREAMS</span> TO
                REALITY
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-xl text-slate-400 leading-relaxed mb-12 max-w-lg font-medium mx-auto lg:mx-0"
              >
                Experience unparalleled luxury and performance. Curated premium
                fleet for those who demand excellence on every journey.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-wrap justify-center lg:justify-start gap-6 mb-16"
              >
                <Button
                  onClick={scrollToBook}
                  variant="accent"
                  className="px-12 py-6 text-xl shadow-2xl shadow-primary-600/20"
                >
                  Book Your Ride
                  <IconChevronRight className="ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/vehicles")}
                  variant="secondary"
                  className="px-12 py-6 text-xl bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md"
                >
                  Browse Fleet
                </Button>
              </motion.div>

              {/* Trust Badge */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md w-fit mx-auto lg:mx-0"
              >
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/150?u=${i + 10}`}
                      alt="user"
                      className="w-12 h-12 rounded-2xl border-2 border-slate-900 object-cover"
                    />
                  ))}
                  <div className="w-12 h-12 rounded-2xl border-2 border-slate-900 bg-primary-600 flex items-center justify-center text-xs font-black text-white">
                    +2k
                  </div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-left">
                  <div className="flex text-emerald-400 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <IconStarFilled key={i} size={14} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Trusted by 2,000+ happy riders
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-emerald-500 blur-[150px] opacity-10 animate-pulse" />
              <motion.img
                src={Herocar}
                alt="Luxury Car"
                className="relative z-10 w-full object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.5)]"
                style={{ y: y1 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Form - Refined Integration */}
      <div className="relative z-20 px-6 py-16 bg-slate-50" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <Card className="p-1 rounded-[3rem] bg-white shadow-premium overflow-hidden border-none">
            <div className="bg-slate-50 p-8 md:p-12 rounded-[2.8rem]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
                    <IconCar size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-none mb-2">
                      Find Your Perfect Ride
                    </h3>
                    <p className="text-slate-500 font-medium">
                      Premium vehicles at your fingertips. Book in seconds.
                    </p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-widest">
                  <IconCircleCheckFilled size={16} />
                  Available Now
                </div>
              </div>
              <CarSearch />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Stats Section - Polished and Aligned */}
      <section className="py-20 bg-slate-50">
        <div className="container-max">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 group hover:bg-primary-900 hover:border-primary-900 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 shadow-sm flex items-center justify-center mb-8 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    {stat.icon}
                  </div>
                  <h4 className="text-5xl font-black text-slate-900 mb-3 group-hover:text-emerald-400 transition-colors tracking-tighter">
                    {stat.value}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-300 transition-colors">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* How it Works - Modern Layout Refined */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-accent-500/5 rounded-[4rem] -rotate-2 scale-105 blur-2xl" />
              <div className="relative rounded-[4rem] overflow-hidden shadow-premium border border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1000&q=80"
                  alt="Booking App Experience"
                  className="w-full h-[650px] object-cover hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-transparent to-transparent" />
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-accent-500 flex items-center justify-center text-white shadow-2xl shadow-accent-500/30">
                      <IconCircleCheckFilled size={40} />
                    </div>
                    <h4 className="text-3xl font-black text-white leading-tight">
                      Seamless <br /> Experience
                    </h4>
                  </div>
                  <p className="text-lg text-slate-300 font-medium leading-relaxed">
                    We've refined every step of the process to ensure you spend
                    less time booking and more time driving.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-20 order-1 lg:order-2">
              <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
                <h2 className="text-sm font-black text-primary-600 tracking-[0.3em] uppercase mb-4">
                  How it works
                </h2>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-8">
                  THREE SIMPLE STEPS TO YOUR NEXT JOURNEY
                </h3>
              </div>

              <div className="space-y-12">
                {[
                  {
                    step: "01",
                    title: "SELECT VEHICLE",
                    desc: "Browse our premium collection and find the ride that matches your style and needs.",
                    icon: <IconCar size="24" />,
                  },
                  {
                    step: "02",
                    title: "INSTANT BOOKING",
                    desc: "Secure your vehicle with our transparent pricing and lightning-fast checkout process.",
                    icon: <IconClock size="24" />,
                  },
                  {
                    step: "03",
                    title: "PICK UP & DRIVE",
                    desc: "Collect your keys and hit the road. 24/7 support is always just a call away.",
                    icon: <IconCircleCheckFilled size="24" />,
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -60 : 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: idx * 0.15, type: "spring", stiffness: 80 }}
                    className="flex gap-10 group"
                  >
                    <div className="relative shrink-0 flex items-center justify-center">
                      <span className="text-7xl font-black text-slate-200 group-hover:text-emerald-500/30 transition-colors duration-500 leading-none">
                        {item.step}
                      </span>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white shadow-xl border border-slate-100 flex items-center justify-center text-emerald-500 scale-0 group-hover:scale-100 transition-all duration-500">
                        {item.icon}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-emerald-500 transition-colors uppercase">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Refined Design */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="container-max">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-sm font-black text-primary-600 tracking-[0.3em] uppercase mb-4">
              Testimonials
            </h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
              VOICES OF OUR <span className="text-primary-600">RIDERS</span>
            </h3>
            <p className="text-xl text-slate-400 font-medium">
              Don't just take our word for it. Join thousands of satisfied
              customers worldwide.
            </p>
          </div>

          {/* Infinite Marquee */}
          <div className="overflow-hidden mt-12 -mx-6 px-6 lg:mx-0 lg:px-0 relative">
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
            
            <motion.div
              animate={{ x: [0, -1296] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
              className="flex gap-8 w-max"
            >
              {[
                {
                  name: "Alexander Pierce",
                  role: "Business Executive",
                  text: "The service is absolutely impeccable. The Mercedes S-Class I rented was in pristine condition, and the delivery was right on time.",
                  avatar: "https://i.pravatar.cc/150?u=a",
                },
                {
                  name: "Sarah Jenkins",
                  role: "Travel Blogger",
                  text: "RideRabbit made my cross-country trip a dream. Transparent pricing and no hidden fees. I'll definitely be using them again!",
                  avatar: "https://i.pravatar.cc/150?u=b",
                },
                {
                  name: "Michael Chen",
                  role: "Tech Entrepreneur",
                  text: "The booking process is so smooth. It's refreshing to see a car rental company that actually values the user experience.",
                  avatar: "https://i.pravatar.cc/150?u=c",
                },
              ].map((testimony, idx) => (
                <Card key={`dup1-${idx}`} className="w-[400px] shrink-0 p-10 h-full border-slate-800 bg-slate-800/50 hover:bg-slate-800 shadow-card hover:shadow-hover transition-all duration-500 group">
                  <div className="flex text-emerald-400 mb-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <IconStarFilled key={i} size={18} />
                    ))}
                  </div>
                  <p className="text-lg text-slate-300 font-medium leading-relaxed mb-10 italic">
                    "{testimony.text}"
                  </p>
                  <div className="flex items-center gap-4 pt-8 border-t border-slate-700">
                    <img
                      src={testimony.avatar}
                      alt={testimony.name}
                      className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div>
                      <h4 className="text-lg font-black text-white leading-none mb-1">
                        {testimony.name}
                      </h4>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {testimony.role}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {[
                {
                  name: "Alexander Pierce",
                  role: "Business Executive",
                  text: "The service is absolutely impeccable. The Mercedes S-Class I rented was in pristine condition, and the delivery was right on time.",
                  avatar: "https://i.pravatar.cc/150?u=a",
                },
                {
                  name: "Sarah Jenkins",
                  role: "Travel Blogger",
                  text: "RideRabbit made my cross-country trip a dream. Transparent pricing and no hidden fees. I'll definitely be using them again!",
                  avatar: "https://i.pravatar.cc/150?u=b",
                },
                {
                  name: "Michael Chen",
                  role: "Tech Entrepreneur",
                  text: "The booking process is so smooth. It's refreshing to see a car rental company that actually values the user experience.",
                  avatar: "https://i.pravatar.cc/150?u=c",
                },
              ].map((testimony, idx) => (
                <Card key={`dup2-${idx}`} className="w-[400px] shrink-0 p-10 h-full border-slate-800 bg-slate-800/50 hover:bg-slate-800 shadow-card hover:shadow-hover transition-all duration-500 group">
                  <div className="flex text-emerald-400 mb-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <IconStarFilled key={i} size={18} />
                    ))}
                  </div>
                  <p className="text-lg text-slate-300 font-medium leading-relaxed mb-10 italic">
                    "{testimony.text}"
                  </p>
                  <div className="flex items-center gap-4 pt-8 border-t border-slate-700">
                    <img
                      src={testimony.avatar}
                      alt={testimony.name}
                      className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div>
                      <h4 className="text-lg font-black text-white leading-none mb-1">
                        {testimony.name}
                      </h4>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {testimony.role}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Impactful Design */}
      <section className="py-20 bg-slate-50">
        <div className="container-max">
          <div className="relative rounded-[4rem] bg-primary-900 overflow-hidden p-12 md:p-32 text-center shadow-2xl">
            <div className="absolute inset-0 bg-accent-gradient opacity-20" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-500/20 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-none"
              >
                READY TO START YOUR{" "}
                <span className="text-gradient">JOURNEY?</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-300 mb-16 font-medium"
              >
                Join thousands of satisfied customers and experience the
                absolute best car rental service today. Your premium ride is
                waiting.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap justify-center gap-6"
              >
                <Button
                  onClick={scrollToBook}
                  variant="accent"
                  className="px-12 py-6 text-xl shadow-2xl shadow-primary-600/40"
                >
                  Get Started Now
                </Button>
                <Button
                  onClick={() => navigate("/contact")}
                  variant="secondary"
                  className="px-12 py-6 text-xl bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md"
                >
                  Contact Support
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
