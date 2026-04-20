import { useState } from "react";
import { useDispatch } from "react-redux";
import { setMetadata } from "../features/vehicles/vehiclesSlice";
import { vehicleService } from "../services/vehicles";

const useFetchLocationsLov = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [locationsByDistrict, setLocationsByDistrict] = useState({});

  const fetchLov = async () => {
    try {
      setIsLoading(true);
      const data = await vehicleService.getMasterData();

      if (data) {
        // getting models from data
        const models = data
          .filter((cur) => cur.type === "car")
          .map((cur) => cur.model);
        const uniqueModels = [...new Set(models)];

        // getting brands from data
        const brands = data
          .filter((cur) => cur.type === "car")
          .map((cur) => cur.brand);
        const uniqueBrands = [...new Set(brands)];

        // getting locations from data
        const locations = data
          .filter((cur) => cur.type === "location")
          .map((cur) => cur.location);
        const uniqueLocations = [...new Set(locations)];

        // getting districts from data
        const districts = data
          .filter((cur) => cur.type === "location")
          .map((cur) => cur.district);
        const uniqueDistricts = [...new Set(districts)];

        // setting locations by district for easy lookup
        const locByDist = data
          .filter((cur) => cur.type === "location")
          .reduce((acc, curr) => {
            if (!acc[curr.district]) {
              acc[curr.district] = [];
            }
            if (!acc[curr.district].includes(curr.location)) {
              acc[curr.district].push(curr.location);
            }
            return acc;
          }, {});

        setLocationsByDistrict(locByDist);

        dispatch(
          setMetadata({
            models: uniqueModels,
            brands: uniqueBrands,
            locations: uniqueLocations,
            districts: uniqueDistricts,
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchLov, isLoading, locationsByDistrict };
};

export default useFetchLocationsLov;
