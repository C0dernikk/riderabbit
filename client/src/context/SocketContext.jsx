import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { openGlobalChat } from "../features/ui/uiSlice";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { currentUser } = useSelector((state) => state.auth);
  const { isGlobalChatOpen, globalChatData } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", {
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        newSocket.emit("register", currentUser._id);
      });

      if (newSocket.connected) {
        newSocket.emit("register", currentUser._id);
      }

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      const isChatOpenForBooking = isGlobalChatOpen && globalChatData?.bookingId === message.bookingId;
      const amIReceiver = String(message.receiverId) === String(currentUser?._id);

      if (!isChatOpenForBooking && amIReceiver) {
        toast("💬 New Message", {
          description: `Booking #${message.bookingId.slice(-6).toUpperCase()}: ${message.text}`,
          duration: 6000,
          action: {
            label: "Open Chat",
            onClick: () => {
              dispatch(
                openGlobalChat({
                  bookingId: message.bookingId,
                  otherPartyId: message.senderId,
                  otherPartyName: "Chat",
                })
              );
            },
          },
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, isGlobalChatOpen, globalChatData, currentUser, dispatch]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
