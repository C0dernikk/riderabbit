import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dayjs from "dayjs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  IconMapPinFilled,
  IconCalendarEvent,
  IconSearch,
  IconChevronRight,
} from "@tabler/icons-react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import { setAvailableVehicles, filterVehicles, searchNearbyVehicles } from "../../features/vehicles/vehiclesSlice";
import { setSearchParams } from "../../features/bookings/bookingsSlice";
import Button from "../../components/ui/Button";
import LocationAutocomplete from "../../components/ui/LocationAutocomplete";

const searchSchema = z
  .object({
    pickup: z.object({
      display_name: z.string(),
      lat: z.number(),
      lng: z.number()
    }).nullable().refine(val => val !== null, "Please search and select a pick-up location"),
    dropoff: z.object({
      display_name: z.string(),
      lat: z.number(),
      lng: z.number()
    }).nullable().optional(),
    pickuptime: z
      .any()
      .refine((val) => val && dayjs(val).isValid(), "Pick-up time is required"),
    dropofftime: z
      .any()
      .refine(
        (val) => val && dayjs(val).isValid(),
        "Drop-off time is required",
      ),
  })
  .refine(
    (data) => {
      return dayjs(data.dropofftime).isAfter(dayjs(data.pickuptime));
    },
    {
      message: "Drop-off must be after pick-up",
      path: ["dropofftime"],
    },
  );

const CarSearch = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { metadata } = useSelector((state) => state.vehicles);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      pickup: null,
      dropoff: null,
      pickuptime: dayjs().add(1, "hour"),
      dropofftime: dayjs().add(1, "day"),
    },
  });

  const onSearch = async (data) => {
    try {
      const pickUpDateObj = data.pickuptime.toDate ? data.pickuptime.toDate() : new Date(data.pickuptime);
      const dropOffDateObj = data.dropofftime.toDate ? data.dropofftime.toDate() : new Date(data.dropofftime);

      const formattedSearchParams = {
        ...data,
        pickup_location: data.pickup.display_name,
        pickup_district: data.pickup.display_name.split(',')[0],
        pickupDate: { humanReadable: pickUpDateObj.toISOString() },
        dropoffDate: { humanReadable: dropOffDateObj.toISOString() },
        dropoff_location: data.dropoff ? data.dropoff.display_name : undefined
      };

      dispatch(setSearchParams(formattedSearchParams));

      const searchData = {
        lat: data.pickup.lat,
        lng: data.pickup.lng,
        radiusInKm: 50,
        pickUpDate: data.pickuptime.toDate
          ? data.pickuptime.toDate()
          : data.pickuptime,
        dropOffDate: data.dropofftime.toDate
          ? data.dropofftime.toDate()
          : data.dropofftime,
      };

      const result = await dispatch(searchNearbyVehicles(searchData)).unwrap();

      if (result) {
        dispatch(setAvailableVehicles(result));
        toast.success(`Found ${result.length} available vehicles!`);
        navigate("/availableVehicles");
      } else {
        toast.error("No vehicles found for selected criteria");
      }
    } catch (error) {
      toast.error(error || "Search failed. Please try again.");
    }
  };

  const [isLocating, setIsLocating] = useState(false);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    const pickUpDate = watch("pickuptime").toDate ? watch("pickuptime").toDate() : watch("pickuptime");
    const dropOffDate = watch("dropofftime").toDate ? watch("dropofftime").toDate() : watch("dropofftime");

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const searchData = {
          lat: latitude,
          lng: longitude,
          radiusInKm: 50,
          pickUpDate,
          dropOffDate,
        };

        const result = await dispatch(searchNearbyVehicles(searchData)).unwrap();

        if (result && result.length > 0) {
          dispatch(setSearchParams({
             pickup_district: "Nearby",
             pickup_location: "Your Location",
             pickupDate: watch("pickuptime"),
             dropoffDate: watch("dropofftime")
          }));
          dispatch(setAvailableVehicles(result));
          toast.success(`Found ${result.length} vehicles near you!`);
          navigate("/availableVehicles");
        } else {
          toast.error("No vehicles found within 50km of your location.");
        }
      } catch (err) {
        toast.error(err || "Failed to fetch nearby vehicles");
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      setIsLocating(false);
      toast.error("Failed to get your location. Please check browser permissions.");
    });
  };



  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row lg:items-end gap-6">
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="pickup"
              control={control}
              render={({ field: { value, onChange } }) => (
                <LocationAutocomplete
                  value={value}
                  onChange={onChange}
                  label="Pick-up Location"
                  placeholder="Search a city, airport, or address..."
                  error={errors.pickup?.message}
                />
              )}
            />

            <Controller
              name="dropoff"
              control={control}
              render={({ field: { value, onChange } }) => (
                <LocationAutocomplete
                  value={value}
                  onChange={onChange}
                  label="Drop-off Location (Optional)"
                  placeholder="Same as pick-up..."
                  error={errors.dropoff?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                  Pick-up Date & Time
                </label>
                <Controller
                  name="pickuptime"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      className="w-full"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.pickuptime,
                          helperText: errors.pickuptime?.message,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "1rem",
                              backgroundColor: "#f8fafc",
                              height: "3.5rem",
                              "& fieldset": { borderColor: "#e2e8f0" },
                              "&:hover fieldset": {
                                borderColor: "#cbd5e1",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#10b981",
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                  Drop-off Date & Time
                </label>
                <Controller
                  name="dropofftime"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      className="w-full"
                      minDateTime={dayjs().add(1, "hour")}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.dropofftime,
                          helperText: errors.dropofftime?.message,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "1rem",
                              backgroundColor: "#f8fafc",
                              height: "3.5rem",
                              "& fieldset": { borderColor: "#e2e8f0" },
                              "&:hover fieldset": {
                                borderColor: "#cbd5e1",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#10b981",
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                />
              </div>
            </LocalizationProvider>
          </div>
        </div>
        <div className="flex flex-col gap-3 min-w-[200px]">
          <Button
            onClick={handleSubmit(onSearch)}
            isLoading={isSubmitting}
            className="lg:h-14 h-12 px-8 rounded-2xl text-lg font-black shadow-xl shadow-emerald-600/20 bg-emerald-600 text-white hover:bg-emerald-700 transition-all w-full"
          >
            Find Your Car
            <IconChevronRight className="ml-2" />
          </Button>
          <Button
            onClick={handleNearMe}
            isLoading={isLocating}
            type="button"
            className="lg:h-12 h-10 px-8 rounded-2xl text-sm font-bold shadow-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all w-full flex justify-center items-center gap-2"
          >
            <IconMapPinFilled size={16} className="text-accent-500" />
            Find Cars Near Me
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarSearch;
