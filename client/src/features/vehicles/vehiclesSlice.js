import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vehicleService } from "../../services/vehicles";

export const fetchAllVehicles = createAsyncThunk(
  "vehicles/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await vehicleService.getAllVehicles(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const filterVehicles = createAsyncThunk(
  "vehicles/filter",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await vehicleService.searchVehicles(filters);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchNearbyVehicles = createAsyncThunk(
  "vehicles/searchNearby",
  async (geoData, { rejectWithValue }) => {
    try {
      const response = await vehicleService.searchNearbyVehicles(geoData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVehicleById = createAsyncThunk(
  "vehicles/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await vehicleService.getVehicleById(id);
      return response.vehicle || response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminVehicles = createAsyncThunk(
  "vehicles/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleService.adminGetVehicles();
      return response.vehicles || response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVendorVehicles = createAsyncThunk(
  "vehicles/fetchVendor",
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleService.getVendorVehicles();
      return response.vehicles || response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  vehicles: [],
  userAllVehicles: [],
  searchResults: [],
  availableVehicles: [],
  allVariants: [],
  filteredVehicles: [],
  adminVehicles: [],
  vendorVehicles: [],
  vendorRequests: [],
  singleVehicleDetail: null,
  variantMode: false,
  filters: {
    brand: "all",
    type: "all",
    transmission: "all",
    priceRange: [0, 10000],
    sort: "recommended"
  },
  metadata: {
    models: [],
    brands: [],
    locations: [],
    districts: []
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  },
  isLoading: false,
  error: null,
};

const vehiclesSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredVehicles = state.variantMode ? state.allVariants : state.vehicles;
    },
    setSingleVehicleDetail: (state, action) => {
      state.singleVehicleDetail = action.payload;
    },
    clearSingleVehicleDetail: (state) => {
      state.singleVehicleDetail = null;
    },
    setMetadata: (state, action) => {
      state.metadata = action.payload;
    },
    setAvailableVehicles: (state, action) => {
      // action.payload is { vehicles, currentPage, totalPages, count }
      if (action.payload.currentPage === 1) {
        state.availableVehicles = action.payload.vehicles || action.payload;
      } else if (action.payload.vehicles) {
        state.availableVehicles = [...state.availableVehicles, ...action.payload.vehicles];
      }
      
      if (action.payload.totalPages !== undefined) {
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.count
        };
      }
    },
    setVariants: (state, action) => {
      state.allVariants = action.payload;
      state.filteredVehicles = action.payload; // initially same
    },
    setVariantModeOrNot: (state, action) => {
      state.variantMode = action.payload;
    },
    setVendorVehicles: (state, action) => {
      state.vendorVehicles = action.payload;
    },
    applySorting: (state, action) => {
      state.filters.sort = action.payload;
      vehiclesSlice.caseReducers.applyAllFilters(state);
    },
    setSearchQuery: (state, action) => {
      state.filters.searchQuery = action.payload;
      vehiclesSlice.caseReducers.applyAllFilters(state);
    },
    applyLocalFilters: (state, action) => {
      state.filters.checkboxes = action.payload;
      vehiclesSlice.caseReducers.applyAllFilters(state);
    },
    applyAllFilters: (state) => {
      let result = state.variantMode ? [...state.allVariants] : [...state.vehicles];

      // 1. Search Query
      const query = state.filters.searchQuery?.toLowerCase();
      if (query) {
        result = result.filter(v => 
          v.brand?.toLowerCase().includes(query) || 
          v.model?.toLowerCase().includes(query) ||
          v.title?.toLowerCase().includes(query)
        );
      }

      // 2. Checkboxes
      const data = state.filters.checkboxes || {};
      const activeCarTypes = [];
      if (data.suv) activeCarTypes.push("suv");
      if (data.sedan) activeCarTypes.push("sedan");
      if (data.hatchback) activeCarTypes.push("hatchback");

      const activeTransmissions = [];
      if (data.automatic) activeTransmissions.push("automatic");
      if (data.manual) activeTransmissions.push("manual");

      if (activeCarTypes.length > 0) {
        result = result.filter(v => activeCarTypes.includes(v.carType?.toLowerCase()));
      }
      if (activeTransmissions.length > 0) {
        result = result.filter(v => activeTransmissions.includes(v.transmission?.toLowerCase()));
      }

      state.filteredVehicles = result;

      // 3. Sort
      const sort = state.filters.sort;
      if (sort && sort.field) {
        state.filteredVehicles.sort((a, b) => {
          if (sort.field === "price") {
            return sort.order === "asc" ? a.price - b.price : b.price - a.price;
          } else if (sort.field === "year") {
            return sort.order === "asc" ? a.yearMade - b.yearMade : b.yearMade - a.yearMade;
          }
          return 0;
        });
      }
    },

    setUserAllVehicles: (state, action) => {
      state.userAllVehicles = action.payload;
    },
    setVehicles: (state, action) => {
      state.vehicles = action.payload;
    },
    setVendorRequests: (state, action) => {
      state.vendorRequests = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Vehicles
      .addCase(fetchAllVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.currentPage === 1) {
          state.vehicles = action.payload.vehicles || action.payload;
        } else if (action.payload.vehicles) {
          state.vehicles = [...state.vehicles, ...action.payload.vehicles];
        }

        if (action.payload.totalPages !== undefined) {
          state.pagination = {
            currentPage: action.payload.currentPage,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.count
          };
        }

        state.filteredVehicles = state.vehicles;
      })
      .addCase(fetchAllVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Single Vehicle
      .addCase(fetchVehicleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singleVehicleDetail = action.payload;
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Filter Vehicles
      .addCase(filterVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(filterVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.currentPage === 1) {
          state.searchResults = action.payload.vehicles || action.payload;
        } else if (action.payload.vehicles) {
          state.searchResults = [...state.searchResults, ...action.payload.vehicles];
        }

        if (action.payload.totalPages !== undefined) {
          state.pagination = {
            currentPage: action.payload.currentPage,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.count
          };
        }
      })
      .addCase(filterVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search Nearby Vehicles
      .addCase(searchNearbyVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchNearbyVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchNearbyVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Admin Vehicles
      .addCase(fetchAdminVehicles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminVehicles = action.payload;
      })
      .addCase(fetchAdminVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Vendor Vehicles
      .addCase(fetchVendorVehicles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVendorVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendorVehicles = action.payload;
      })
      .addCase(fetchVendorVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, setSingleVehicleDetail, clearSingleVehicleDetail, setMetadata, setAvailableVehicles, setVariants, setVariantModeOrNot, setVendorVehicles, applySorting, applyLocalFilters, setSearchQuery, setUserAllVehicles, setVehicles, setVendorRequests } = vehiclesSlice.actions;

export default vehiclesSlice.reducer;
