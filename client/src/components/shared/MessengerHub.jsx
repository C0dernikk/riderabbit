import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IconX, IconSend, IconChevronLeft, IconMessage, IconFileDescription } from "@tabler/icons-react";
import { useSocket } from "../../context/SocketContext";
import { closeGlobalChat, openGlobalChat, openInbox, setOrderModalOpen, setSingleOrderDetails } from "../../features/ui/uiSlice";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

const MessengerHub = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const { isGlobalChatOpen, globalChatData } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  const [inbox, setInbox] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  const isChatView = !!globalChatData?.bookingId;

  useEffect(() => {
    if (!currentUser) return;
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get("/messages/unread-count");
        setUnreadCount(res.count || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnreadCount();
  }, [currentUser]);

  const fetchInbox = async () => {
    try {
      setLoadingInbox(true);
      const res = await api.get("/messages/inbox/all");
      setInbox(res.inbox || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInbox(false);
    }
  };

  useEffect(() => {
    if (isGlobalChatOpen && !isChatView) {
      fetchInbox();
    }
  }, [isGlobalChatOpen, isChatView]);

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleReceiveMessage = (message) => {
      // If we are currently viewing THIS specific chat
      if (isGlobalChatOpen && isChatView && String(message.bookingId) === String(globalChatData?.bookingId)) {
        setMessages((prev) => [...prev, message]);
      } 
      // If the message is intended for us, but we aren't viewing this specific chat
      else if (String(message.receiverId) === String(currentUser._id)) {
        setUnreadCount((prev) => prev + 1);
        
        // If we are in the inbox view, refresh it to show the new message
        if (isGlobalChatOpen && !isChatView) {
          fetchInbox();
        }
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => { socket.off("receiveMessage", handleReceiveMessage); };
  }, [socket, currentUser, isGlobalChatOpen, isChatView, globalChatData]);

  useEffect(() => {
    if (!isGlobalChatOpen || !isChatView) return;

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/${globalChatData.bookingId}`);
        setMessages(response.messages || []);
        
        await api.put(`/messages/mark-read/${globalChatData.bookingId}`);
        
        const countRes = await api.get("/messages/unread-count");
        setUnreadCount(countRes.count || 0);

      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [isGlobalChatOpen, isChatView, globalChatData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGlobalChatOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const msgData = {
      bookingId: globalChatData.bookingId,
      senderId: currentUser._id,
      receiverId: globalChatData.otherPartyId,
      text: newMessage,
    };

    socket.emit("sendMessage", msgData);
    setNewMessage("");
  };

  const handleOpenDetails = () => {
    const inboxItem = inbox.find(i => i._id === globalChatData.bookingId);
    if (inboxItem?.bookingDetails) {
      const fullBooking = {
        ...inboxItem.bookingDetails,
        vehicleDetails: inboxItem.vehicleDetails,
        vehicle: inboxItem.vehicleDetails,
      };
      dispatch(setSingleOrderDetails(fullBooking));
      dispatch(setOrderModalOpen(true));
      dispatch(closeGlobalChat());
    } else {
      dispatch(closeGlobalChat());
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <AnimatePresence>
        {!isGlobalChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(openInbox())}
            className="fixed bottom-6 right-6 z-[9998] w-14 h-14 bg-gradient-to-tr from-primary-600 to-primary-500 rounded-full shadow-xl shadow-primary-500/30 flex items-center justify-center text-white cursor-pointer"
          >
            <IconMessage size={28} />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGlobalChatOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-end pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(closeGlobalChat())}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full md:w-[400px] bg-white h-full shadow-2xl flex flex-col relative z-10"
            >
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-lg z-10">
          <div className="flex items-center gap-3">
            {isChatView && (
              <button 
                onClick={() => dispatch(openGlobalChat(null))}
                className="p-1 hover:bg-slate-800 rounded-full transition-colors"
              >
                <IconChevronLeft size={24} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <IconMessage size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {isChatView ? globalChatData.otherPartyName : "Messages"}
                </h3>
                {isChatView && <p className="text-xs text-slate-400">Booking #{globalChatData.bookingId.slice(-6).toUpperCase()}</p>}
              </div>
            </div>
          </div>
          <button 
            onClick={() => dispatch(closeGlobalChat())} 
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"
          >
            <IconX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
          {!isChatView ? (
            /* Inbox View */
            <div className="flex-1 overflow-y-auto p-2">
              {loadingInbox ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : inbox.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <IconMessage size={48} className="mb-4 opacity-20" />
                  <p>No active conversations</p>
                </div>
              ) : (
                inbox.map((chat) => {
                  const displayName = currentUser.role === 'vendor'
                    ? `Booking #${chat._id.slice(-6).toUpperCase()}`
                    : (chat.otherParty?.username || chat.otherParty?.name || "User");
                  
                  return (
                    <div 
                      key={chat._id}
                      onClick={() => dispatch(openGlobalChat({
                        bookingId: chat._id,
                        otherPartyId: chat.otherParty?._id,
                        otherPartyName: displayName,
                      }))}
                      className="flex items-center gap-4 p-4 bg-white hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden shrink-0">
                        {chat.otherParty?.profilePicture ? (
                           <img src={chat.otherParty.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl uppercase">
                             {displayName[0]}
                           </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-slate-900 truncate">{displayName}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(chat.lastMessage?.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                           <p className="text-sm text-slate-500 truncate flex-1">{chat.lastMessage?.text}</p>
                           {currentUser.role !== 'vendor' && (
                             <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full shrink-0">
                               #{chat._id.slice(-4).toUpperCase()}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Chat View */
            <>
              {/* Action Bar */}
              <div className="bg-white border-b border-slate-100 p-2 flex justify-center shadow-sm z-10">
                 <button 
                   onClick={handleOpenDetails}
                   className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-full transition-colors"
                 >
                   <IconFileDescription size={16} />
                   View Booking Details
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                  const msgSenderId = msg.senderId?._id ? String(msg.senderId._id) : String(msg.senderId);
                  const isMe = msgSenderId === String(currentUser._id);
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-slate-900 text-white rounded-br-none"
                            : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent px-4 py-2 outline-none text-sm text-slate-700 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
                  >
                    <IconSend size={18} className="ml-1" />
                  </button>
                </form>
              </div>
            </>
          )}
          </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MessengerHub;
