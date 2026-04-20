import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IoMdClose } from "react-icons/io";
import { vendorService } from "../../../services/vendor";
import useFetchLocationsLov from "../../../hooks/useFetchLocationsLov";
import { useEffect } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import LocationAutocomplete from "../../../components/ui/LocationAutocomplete";

const VendorAddProductModal = () => {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { metadata } = useSelector((state) => state.vehicles);
  const {
    models: modelData = [],
    brands: companyData = [],
    locations: locationData = [],
    districts: districtData = [],
  } = metadata || {};
  const { currentUser } = useSelector((state) => state.auth);
  const { fetchLov } = useFetchLocationsLov();

  useEffect(() => {
    fetchLov();
  }, []);

  const onSubmit = async (addData) => {
    try {
      const formData = new FormData();
      formData.append("registrationNumber", addData.registeration_number);
      formData.append("brand", addData.company);

      if (addData.image) {
        for (let i = 0; i < addData.image.length; i++) {
          formData.append("image", addData.image[i]);
        }
      }

      formData.append("name", addData.title || addData.name); // Using title since our new form collects title
      formData.append("model", addData.model);
      formData.append("title", addData.title);
      formData.append("basePackage", addData.base_package);
      formData.append("price", addData.price);
      formData.append("description", addData.description);
      formData.append("yearMade", addData.year_made);
      formData.append("fuelType", addData.fuelType);
      formData.append("seats", addData.Seats);
      formData.append("transmission", addData.transmitionType);
      
      if (addData.insurance_end_date) formData.append("insuranceEndDate", new Date(addData.insurance_end_date).toISOString());
      if (addData.Registeration_end_date) formData.append("registrationEndDate", new Date(addData.Registeration_end_date).toISOString());
      if (addData.polution_end_date) formData.append("pollutionEndDate", new Date(addData.polution_end_date).toISOString());

      formData.append("carType", addData.carType);
      formData.append("location", addData.vehicleLocation?.display_name?.split(",")[0] || "Unknown");
      formData.append("district", addData.vehicleDistrict?.display_name?.split(",")[0] || "Unknown");
      formData.append("vendorId", currentUser._id);

      if (addData.vehicleLocation?.lat && addData.vehicleLocation?.lng) {
        formData.append("lat", addData.vehicleLocation.lat);
        formData.append("lng", addData.vehicleLocation.lng);
      }

      if (addData.insurance_image?.length) {
        for (let i=0; i<addData.insurance_image.length; i++) formData.append("insurance_image", addData.insurance_image[i]);
      }
      if (addData.rc_book_image?.length) {
        for (let i=0; i<addData.rc_book_image.length; i++) formData.append("rc_book_image", addData.rc_book_image[i]);
      }
      if (addData.polution_image?.length) {
        for (let i=0; i<addData.polution_image.length; i++) formData.append("polution_image", addData.polution_image[i]);
      }

      // Geocoding is handled seamlessly by the Autocomplete component
      const toastId = toast.loading("Adding vehicle...");

      const result = await vendorService.addVehicle(formData);

      if (result.success) {
        toast.success("Vehicle added! Pending admin approval.", {
          id: toastId,
        });
        reset();
        navigate("/vendorDashboard/vendorAllVehicles");
      } else {
        toast.error(result.message || "Failed to add vehicle", { id: toastId });
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleClose = () => {
    navigate("/vendorDashboard/vendorAllVehicles");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-10">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden relative my-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors z-10"
        >
          <IoMdClose size={24} />
        </button>
        
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">Add New Vehicle</h2>
          <p className="text-sm text-slate-500 mt-1">Enter the details of the vehicle you want to list.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Input
              label="Registration Number"
              placeholder="e.g. KL-01-AB-1234"
              error={errors.registeration_number?.message}
              {...register("registeration_number", { required: "Required" })}
            />

            <Controller
              control={control}
              name="company"
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  label="Brand/Company"
                  error={errors.company?.message}
                  options={companyData.map(c => ({ label: c, value: c }))}
                  {...field}
                />
              )}
            />

            <Input
              label="Listing Title"
              placeholder="e.g. Premium Sedan for Family Trips"
              error={errors.title?.message}
              {...register("title", { required: "Required" })}
            />

            <Controller
              control={control}
              name="model"
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  label="Model"
                  error={errors.model?.message}
                  options={modelData.map(m => ({ label: m, value: m }))}
                  {...field}
                />
              )}
            />

            <Input
              label="Base Package"
              placeholder="e.g. 100km/day"
              {...register("base_package")}
            />

            <Input
              type="number"
              label="Price per day (₹)"
              placeholder="e.g. 1500"
              error={errors.price?.message}
              {...register("price", { required: "Required" })}
            />

            <Input
              type="number"
              label="Manufacturing Year"
              placeholder="e.g. 2021"
              error={errors.year_made?.message}
              {...register("year_made", { required: "Required" })}
            />

            <Controller
              control={control}
              name="fuelType"
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  label="Fuel Type"
                  error={errors.fuelType?.message}
                  options={[
                    { label: "Petrol", value: "petrol" },
                    { label: "Diesel", value: "diesel" },
                    { label: "Electric", value: "electric" },
                    { label: "Hybrid", value: "hybrid" },
                  ]}
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="carType"
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  label="Car Type"
                  error={errors.carType?.message}
                  options={[
                    { label: "Sedan", value: "sedan" },
                    { label: "SUV", value: "suv" },
                    { label: "Hatchback", value: "hatchback" },
                  ]}
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="Seats"
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  label="Seats"
                  error={errors.Seats?.message}
                  options={[
                    { label: "5", value: "5" },
                    { label: "7", value: "7" },
                    { label: "8", value: "8" },
                  ]}
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="transmitionType"
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  label="Transmission Type"
                  error={errors.transmitionType?.message}
                  options={[
                    { label: "Automatic", value: "automatic" },
                    { label: "Manual", value: "manual" },
                  ]}
                  {...field}
                />
              )}
            />
            
            <Controller
              control={control}
              name="vehicleDistrict"
              rules={{ required: "Required" }}
              render={({ field: { value, onChange } }) => (
                <LocationAutocomplete
                  label="District"
                  placeholder="Search District (e.g. Ernakulam)"
                  error={errors.vehicleDistrict?.message}
                  value={value}
                  onChange={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="vehicleLocation"
              rules={{ required: "Required" }}
              render={({ field: { value, onChange } }) => (
                <LocationAutocomplete
                  label="Specific Location"
                  placeholder="Search Location (e.g. Kochi Airport)"
                  error={errors.vehicleLocation?.message}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 mb-2 block">
                Vehicle Description
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 resize-none h-32"
                placeholder="e.g. Well-maintained car with excellent mileage..."
                {...register("description")}
              />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Document Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Input
              type="date"
              label="Insurance End Date"
              {...register("insurance_end_date")}
            />
            <Input
              type="date"
              label="Registration End Date"
              {...register("Registeration_end_date")}
            />
            <Input
              type="date"
              label="Pollution End Date"
              {...register("polution_end_date")}
            />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Images & Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-sm font-semibold text-slate-700 ml-1 mb-2 block">Upload Vehicle Image(s)</label>
              <input
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer border border-slate-200 rounded-lg"
                type="file"
                multiple
                {...register("image")}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 ml-1 mb-2 block">Upload Insurance Image</label>
              <input
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-lg"
                type="file"
                multiple
                {...register("insurance_image")}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 ml-1 mb-2 block">Upload RC Book Image</label>
              <input
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-lg"
                type="file"
                multiple
                {...register("rc_book_image")}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 ml-1 mb-2 block">Upload Pollution Image</label>
              <input
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-lg"
                type="file"
                multiple
                {...register("polution_image")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Vehicle
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorAddProductModal;
