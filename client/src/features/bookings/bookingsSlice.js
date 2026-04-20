import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingService } from "../../services/bookings";

export const fetchUserBookings = createAsyncThunk(
  "bookings/fetchUserBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.getUserBookings();
      return response.bookings || response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVendorBookings = createAsyncThunk(
  "bookings/fetchVendorBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.getVendorBookings();
      return response.bookings || response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminBookings = createAsyncThunk(
  "bookings/fetchAdminBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.adminGetBookings();
      return response.bookings || response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  userBookings: [],
  vendorBookings: [],
  adminBookings: [],
  currentBookingDetails: null, // Used during checkout
  searchParams: {}, // Used for vehicle search and booking flow
  latestBooking: null,
  isPaymentDone: false,
  isLoading: false,
  error: null,
};

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setCurrentBookingDetails: (state, action) => {
      state.currentBookingDetails = action.payload;
    },
    clearCurrentBookingDetails: (state) => {
      state.currentBookingDetails = null;
    },
    setSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setLatestBooking: (state, action) => {
      state.latestBooking = action.payload;
    },
    setPaymentStatus: (state, action) => {
      state.isPaymentDone = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // User Bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userBookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Vendor Bookings
      .addCase(fetchVendorBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVendorBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendorBookings = action.payload;
      })
      .addCase(fetchVendorBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Admin Bookings
      .addCase(fetchAdminBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminBookings = action.payload;
      })
      .addCase(fetchAdminBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentBookingDetails, clearCurrentBookingDetails, setSearchParams, setLatestBooking, setPaymentStatus } = bookingsSlice.actions;

export default bookingsSlice.reducer;
