import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IconX, IconSend } from "@tabler/icons-react";
import Button from "../ui/Button";
import api from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { closeGlobalChat } from "../../features/ui/uiSlice";

const ChatModal = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const { isGlobalChatOpen, globalChatData } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const { socket } = useSocket();

  const isOpen = isGlobalChatOpen;
  const bookingId = globalChatData?.bookingId;
  const otherPartyId = globalChatData?.otherPartyId;
  const otherPartyName = globalChatData?.otherPartyName || "Chat";

  const onClose = () => {
    dispatch(closeGlobalChat());
  };

  useEffect(() => {
    if (!isOpen || !socket || !bookingId) return;

    const handleReceiveMessage = (message) => {
      if (message.bookingId === bookingId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [isOpen, socket, bookingId]);

  useEffect(() => {
    if (!isOpen || !bookingId) return;

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/${bookingId}`);
        setMessages(response.data?.messages || response.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [isOpen, bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const msgData = {
      bookingId,
      senderId: currentUser._id,
      receiverId: otherPartyId,
      text: newMessage,
    };

    socket.emit("sendMessage", msgData);
    setNewMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col h-[600px] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-900">Chat with {otherPartyName}</h3>
            <p className="text-xs text-slate-500 font-bold">Booking #{bookingId.slice(-6).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.senderId === currentUser._id || msg.senderId?._id === currentUser._id;
              return (
                <div
                  key={msg._id || index}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      isMine
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span
                      className={`text-[10px] mt-1 block ${
                        isMine ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all"
            >
              <IconSend size={20} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
