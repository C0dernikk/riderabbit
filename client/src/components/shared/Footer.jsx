import { useState } from "react";
import { toast } from "sonner";
import api from "../../services/api";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const social = [
  { href: "https://www.linkedin.com/in/nikhil-gupta-540418290/", icon: IconBrandLinkedin, label: "LinkedIn" },
  { href: "#", icon: IconBrandTwitter, label: "Twitter" },
  { href: "https://www.instagram.com/i_m_.nikk_/", icon: IconBrandInstagram, label: "Instagram" },
];

function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter an email address");
    
    setIsLoading(true);
    try {
      const res = await api.post("/newsletter/subscribe", { email });
      if (res.success) {
        toast.success(res.message || "Successfully subscribed!");
        setEmail("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to subscribe. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 pt-24 pb-12 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6 relative z-10">
              <Link 
                to="/" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2.5 group w-fit"
              >
                <div className="relative w-12 h-12 flex items-center justify-center group-hover:rotate-6 transition-all duration-500">
                  <div className="absolute inset-0 bg-emerald-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-all duration-500 opacity-40 blur-sm" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
                    <span className="relative text-white font-black text-2xl italic tracking-tighter drop-shadow-md z-10 flex items-center">
                      R<span className="text-emerald-300 -ml-1.5">R</span>
                    </span>
                  </div>
                </div>
                <span className="text-3xl font-black tracking-tighter text-white">
                  Ride<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-emerald-500">Rabbit</span>
                </span>
              </Link>
              <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                Experience the future of mobility with our premium car rental network. 
                Seamless bookings, curated fleet, and exceptional service at your fingertips.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-black text-sm uppercase tracking-widest">Join our Newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  required
                  className="bg-transparent border-none outline-none px-4 py-2 flex-1 text-white placeholder:text-slate-600"
                />
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 h-auto text-sm bg-emerald-600 hover:bg-emerald-700 border-none shadow-xl shadow-emerald-500/20 disabled:opacity-70"
                >
                  {isLoading ? "..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-white font-black text-sm uppercase tracking-widest">Explore</h4>
            <ul className="space-y-4">
              {["Vehicles", "Enterprise", "Contact", "About Us"].map((item) => {
                const isAboutUs = item === "About Us";
                return (
                  <li key={item}>
                    <Link
                      to={isAboutUs ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                      onClick={isAboutUs ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : undefined}
                      className="group flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-600 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100" />
                      <span className="font-bold">{item}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-white font-black text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-4">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Help Center"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="group flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100" />
                    <span className="font-bold">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-white font-black text-sm uppercase tracking-widest">Connect</h4>
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <a href="mailto:dev.nikk37@gmail.com" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all">
                    <IconMail size={20} />
                  </div>
                  <span className="font-bold group-hover:text-white transition-colors">dev.nikk37@gmail.com</span>
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <IconPhone size={20} />
                  </div>
                  <span className="font-bold group-hover:text-white transition-colors">+1 (234) 567-890</span>
                </a>
              </div>
              <div className="flex gap-3">
                {social.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-gradient-to-br hover:from-primary-600 hover:to-emerald-500 hover:text-white hover:border-emerald-500 hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                  >
                    <Icon size={22} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-bold text-slate-500">
            © {currentYear} RideRabbit Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm font-bold hover:text-white transition-colors">English (US)</a>
            <a href="#" className="text-sm font-bold hover:text-white transition-colors flex items-center gap-1">
              Status <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
