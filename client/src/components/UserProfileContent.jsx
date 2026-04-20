import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCamera,
  IconShieldCheck,
} from "@tabler/icons-react";

import { setUpdated, updateUser } from "../features/auth/authSlice";
import Card from "./ui/Card";
import { userService } from "../services/user";
import { vendorService } from "../services/vendor";

const UserProfileContent = () => {
  const currentUser = useSelector((state) => state.auth.currentUser) || {};
  const { email, username, profilePicture, phoneNumber, address } = currentUser;
  const dispatch = useDispatch();
  const isUpdated = useSelector((state) => state.auth.isUpdated);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isUpdated) {
      toast.success("Profile updated successfully!");
      dispatch(setUpdated(false));
    }
  }, [isUpdated, dispatch]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      let result;
      if (currentUser.role === "vendor") {
        result = await vendorService.editProfile(currentUser._id, formData);
      } else {
        result = await userService.editProfile(currentUser._id, formData);
      }
      
      if (result && result.success) {
        dispatch(updateUser(result.user));
        toast.success("Avatar updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update avatar.");
      console.log(error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 leading-tight">
          My <span className="text-primary-600">Profile</span>
        </h1>
        <p className="text-slate-500 font-medium">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1 p-0 overflow-hidden border-none shadow-premium bg-white">
          <div className="h-32 bg-premium-gradient relative">
            <div className="absolute inset-0 bg-accent-gradient opacity-20" />
          </div>
          <div className="px-8 pb-8 flex flex-col items-center">
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white bg-white shadow-xl overflow-hidden">
                <img
                  src={profilePicture || "https://i.pravatar.cc/150"}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-10 h-10 rounded-xl bg-primary-600 text-white border-4 border-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer"
              >
                <IconCamera size={18} />
              </button>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-1">
              {username}
            </h3>
            <p className="text-slate-500 font-bold text-sm mb-6">{email}</p>

            <div className="w-full pt-6 border-t border-slate-50 flex flex-col gap-3">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 text-slate-600">
                <IconShieldCheck size={18} className="text-accent-500" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Verified Member
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Details Form */}
        <Card className="lg:col-span-2 p-8 border-none shadow-premium bg-white">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">
              Personal Information
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-bold">
                  <IconUser size={18} className="text-primary-600" />
                  {username}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-bold">
                  <IconMail size={18} className="text-primary-600" />
                  {email}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Phone Number
                </label>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-bold">
                  <IconPhone size={18} className="text-primary-600" />
                  {phoneNumber || "Not provided"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Living Address
                </label>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-bold">
                  <IconMapPin size={18} className="text-primary-600" />
                  <span className="truncate">{address || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <IconShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-sm mb-1">
                  Security Tip
                </h4>
                <p className="text-emerald-700 text-xs leading-relaxed">
                  Keep your personal information up to date to ensure smooth
                  bookings and accurate insurance coverage for all your rentals.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserProfileContent;
