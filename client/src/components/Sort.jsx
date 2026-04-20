import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";

import { MenuItem } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useEffect } from "react";
import { applySorting } from "../features/vehicles/vehiclesSlice";

const Sort = () => {
  const { vehicles, filteredVehicles } = useSelector((state) => state.vehicles);
  const dispatch = useDispatch();
  const { handleSubmit, control } = useForm({
    defaultValues: {
      price: "",
      year: "",
    },
  });

  const handleInputChange = (field, value) => {
    if (value === "lowtohigh") {
      dispatch(applySorting({ field: "price", order: "asc" }));
    } else if (value === "hightolow") {
      dispatch(applySorting({ field: "price", order: "desc" }));
    } else if (value === "yearAscending") {
      dispatch(applySorting({ field: "year", order: "asc" }));
    } else if (value === "yearDecending") {
      dispatch(applySorting({ field: "year", order: "desc" }));
    }
  };

  return (
    <div className=" drop-shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-center gap-1 md:gap-3 md:justify-start mx-auto md:mx-[80px] lg:mx-0">
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <TextField
                {...field}
                id="price"
                select
                label="Price"
                // error={Boolean(field.value == "")}
                sx={{ m: 1, width: 150, borderRadius: "400px" }}
                onChange={(event) => {
                  field.onChange(event);
                  handleInputChange("price", event.target.value);
                }}
              >
                <MenuItem className="bg-gray-100">None</MenuItem>
                <MenuItem value={"lowtohigh"}>Low to High</MenuItem>

                <MenuItem value={"hightolow"}>High to Low</MenuItem>
              </TextField>
            )}
          ></Controller>

          <Controller
            control={control}
            name="year"
            render={({ field }) => (
              <TextField
                {...field}
                id="year"
                select
                label="Year"
                // error={Boolean(field.value == "")}
                sx={{ m: 1, width: 150 }}
                onChange={(event) => {
                  field.onChange(event);
                  handleInputChange("year", event.target.value);
                }}
              >
                <MenuItem className="bg-gray-100">None</MenuItem>
                <MenuItem value={"yearAscending"}>low to high</MenuItem>

                <MenuItem value={"yearDecending"}>high to low</MenuItem>
              </TextField>
            )}
          ></Controller>
        </div>
      </form>
    </div>
  );
};

export default Sort;
