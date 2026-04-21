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
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const socketUrl = import.meta.env.VITE_BACKEND_URL || (apiUrl ? apiUrl.replace("/api", "") : "http://localhost:3000");
      
      const newSocket = io(socketUrl, {
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
    // Toast notification removed as per user request. 
    // MessengerHub.jsx handles all background receiving and badge updates.
  }, [socket, currentUser, dispatch]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
