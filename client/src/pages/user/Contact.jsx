import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "../../services/api";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandInstagram,
  IconSend,
  IconClock,
  IconMessageCircle,
  IconArrowRight,
} from "@tabler/icons-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post("/contact", formData);
      if (res.success) {
        toast.success("Message sent successfully!");
        setFormData({ firstName: "", lastName: "", email: "", message: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <IconMail size={24} />,
      title: "Email Us",
      value: "dev.nikk37@gmail.com",
      desc: "Our friendly team is here to help with any queries.",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <IconPhone size={24} />,
      title: "Call Us",
      value: "+1 (555) 000-0000",
      desc: "Mon-Fri from 8am to 5pm. Instant support.",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <IconMapPin size={24} />,
      title: "Visit Us",
      value: "123 Mobility Lane, Future City",
      desc: "Come say hello at our main office.",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Header Section - Modern Split Layout */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-700/10 opacity-20 animate-pulse" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4" />

        <div className="container-max relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] mb-10"
          >
            <IconMessageCircle size={14} className="mr-2" />
            GET IN TOUCH
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[0.9]"
          >
            WE'RE HERE TO <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-emerald-400">HELP</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Have questions about our fleet or services? Our team is ready to
            assist you on your journey.
          </motion.p>
        </div>
      </section>

      <section className="relative z-20 -mt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Contact Form - Clean SaaS Style */}
            <div className="lg:col-span-8">
              <Card className="p-8 md:p-16 border-none shadow-2xl rounded-[3rem] bg-white">
                <div className="mb-12">
                  <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                    Send us a message
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Fill out the form below and we'll get back to you within 24
                    hours.
                  </p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-8">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                      className="bg-slate-50 border-slate-100 focus:bg-white h-14"
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                      className="bg-slate-50 border-slate-100 focus:bg-white h-14"
                    />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="bg-slate-50 border-slate-100 focus:bg-white h-14"
                  />
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 min-h-[200px] font-medium"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-12 h-16 rounded-2xl text-lg font-black bg-emerald-600 hover:bg-emerald-700 border-none shadow-xl shadow-emerald-600/20 disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    {!isSubmitting && (
                      <IconSend
                        size={20}
                        className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                      />
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Sidebar Info - Engaging Cards */}
            <div className="lg:col-span-4 space-y-8">
              {contactInfo.map((info, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-10 border-none shadow-card hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-500 group rounded-[2.5rem] bg-white">
                    <div
                      className={`w-14 h-14 rounded-2xl ${info.color} group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-sm`}
                    >
                      {info.icon}
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">
                      {info.title}
                    </h4>
                    <p className="text-accent-500 font-black text-lg mb-2">
                      {info.value}
                    </p>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {info.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}

              {/* Social Connect Card */}
              <Card className="p-10 border-none bg-gradient-to-br from-primary-900 to-emerald-900 text-white shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <h4 className="text-2xl font-black mb-6 tracking-tight leading-tight">
                    Join Our Community
                  </h4>
                  <div className="flex gap-4">
                    {[
                      { icon: IconBrandLinkedin, url: "https://www.linkedin.com/in/nikhil-gupta-540418290/" },
                      { icon: IconBrandTwitter, url: "#" },
                      { icon: IconBrandInstagram, url: "https://www.instagram.com/i_m_.nikk_/" },
                    ].map((item, i) => (
                      <a
                        key={i}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:scale-110 transition-all duration-300"
                      >
                        <item.icon size={24} />
                      </a>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section or Additional Info */}
      <section className="py-32 bg-bg-secondary overflow-hidden">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="max-w-xl">
                <h2 className="text-sm font-black text-emerald-500 tracking-[0.3em] uppercase mb-4">
                  Availability
                </h2>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-8">
                  WE'RE ALWAYS{" "}
                  <span className="text-emerald-500">READY</span> TO DRIVE
                </h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                  Whether it's a quick question or a long-term partnership
                  inquiry, we're always just a message away.
                </p>
              </div>

              <div className="space-y-8">
                {[
                  {
                    icon: <IconClock />,
                    title: "24/7 Roadside Assistance",
                    desc: "Available for all our premium members.",
                  },
                  {
                    icon: <IconMessageCircle />,
                    title: "Instant Chat Support",
                    desc: "Average response time of under 5 minutes.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-center group">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 font-medium text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-[4rem] -rotate-3 scale-105" />
              <Card className="relative z-10 p-0 overflow-hidden border-none shadow-2xl rounded-[4rem]">
                <img
                  src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Office Space"
                  className="w-full h-[500px] object-cover"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
