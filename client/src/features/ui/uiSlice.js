import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light", // or 'dark'
  isSidebarOpen: false,
  isLoading: false,
  modals: {
    addVehicle: false,
    editVehicle: false,
    deleteVehicle: false,
    checkout: false,
  },
  activeModalData: null,
  isOrderModalOpen: false,
  singleOrderDetails: null,
  isAddVehicleClicked: false,
  isGlobalChatOpen: false,
  globalChatData: null,
  sweetAlert: null,
  pageLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    setGlobalLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    openModal: (state, action) => {
      const { modalName, data } = action.payload;
      if (state.modals[modalName] !== undefined) {
        state.modals[modalName] = true;
        state.activeModalData = data || null;
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals[modalName] !== undefined) {
        state.modals[modalName] = false;
        state.activeModalData = null;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });
      state.activeModalData = null;
    },
    setOrderModalOpen: (state, action) => {
      state.isOrderModalOpen = action.payload;
    },
    setSingleOrderDetails: (state, action) => {
      state.singleOrderDetails = action.payload;
    },
    setAddVehicleClicked: (state, action) => {
      state.isAddVehicleClicked = action.payload;
    },
    showSidebarOrNot: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    setSweetAlert: (state, action) => {
      state.sweetAlert = action.payload;
    },
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
      state.isLoading = action.payload;
    },
    openGlobalChat: (state, action) => {
      state.isGlobalChatOpen = true;
      state.globalChatData = action.payload;
    },
    openInbox: (state) => {
      state.isGlobalChatOpen = true;
      state.globalChatData = null;
    },
    closeGlobalChat: (state) => {
      state.isGlobalChatOpen = false;
      state.globalChatData = null;
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  setGlobalLoading,
  openModal,
  closeModal,
  closeAllModals,
  setOrderModalOpen,
  setSingleOrderDetails,
  setAddVehicleClicked,
  showSidebarOrNot,
  setSweetAlert,
  setPageLoading,
  openGlobalChat,
  openInbox,
  closeGlobalChat,
} = uiSlice.actions;

export default uiSlice.reducer;
