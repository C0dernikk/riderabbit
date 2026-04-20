import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUsers,
  IconUser,
  IconMail,
  IconTrash,
  IconSearch,
  IconMoodSad,
  IconShieldCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { adminService } from "../../../services/admin";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data || []);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      !u.isAdmin &&
      !u.isVendor &&
      (u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            Registered <span className="text-primary-600">Customers</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Manage all registered customer accounts
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
          <IconUsers className="text-primary-600" size={20} />
          <span className="font-bold text-slate-700">
            {filteredUsers.length} Total Users
          </span>
        </div>
      </div>

      <div className="relative">
        <IconSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-primary-600/20 outline-none transition-all"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-2xl animate-pulse shadow-sm border border-slate-100"
            />
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <Card className="p-0 overflow-hidden border-none shadow-premium bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    User Info
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Email Address
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Joined Date
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredUsers.map((user, idx) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-600/10 flex items-center justify-center text-primary-600 overflow-hidden">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <IconUser size={20} />
                            )}
                          </div>
                          <div className="font-bold text-slate-900">
                            {user.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                          <IconMail size={16} className="text-slate-300" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-bold text-slate-600">
                          {new Date(
                            user.createdAt || Date.now(),
                          ).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete User"
                        >
                          <IconTrash size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-24 px-6 text-center border-none shadow-premium bg-white">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <IconMoodSad size={48} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            No Customers Found
          </h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            {searchTerm
              ? "No customers match your search."
              : "There are no registered customers in the system yet."}
          </p>
        </Card>
      )}
    </div>
  );
};

export default AllUsers;
