import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { GoPlus } from "react-icons/go";

import { Controller, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { applyLocalFilters } from "../features/vehicles/vehiclesSlice";
import { useState, useEffect } from "react";

const Filter = () => {
  const { control, handleSubmit, watch } = useForm();
  const { vehicles, variants } = useSelector((state) => state.vehicles);
  const { filters } = useSelector((state) => state.vehicles);

  const [filterOpen, setFilterOpen] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const subscription = watch((value) => {
      dispatch(applyLocalFilters(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  const handleClick = () => {
    if (window.innerWidth <= 924) {
      setFilterOpen(!filterOpen);
    }
  };

  
  return (
    <div className="bg-white sticky top-5 scroll-m-9">
      <div className="sticky top-0 left-0 right-0  ">
        <div className="filterComponent flex h-full max-w-[320px] lg:max-w-[350px]  flex-col  bg-white  shadow-xl mx-auto">
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            <button
              type="button"
              className="-mr-2  flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
              onClick={()=> setFilterOpen(!filterOpen) }
            >
             
              <div className={`plusicon ${filterOpen ? 'iconClose' : 'plusiconOpen'}`}><GoPlus className="plusicon"/></div>
            
            </button>
          </div>

          {/* <!-- Filters  form --> */}

         
          <div className={` border-t border-gray-200 dropdown-content ${filterOpen ? 'open opacity-100 fade-in' : 'opacity-0 fade-out'} `}>
            <h3 className="sr-only">Categories</h3>

            <div className="border-t border-gray-200 px-4 py-6">
              <div className="flex flex-col justify-center items-start gap-y-4 w-full">
                <form className="w-full">
                  <div className="w-full mb-7 ">
                    <div className="mb-5 flex justify-between items-center">
                      <div>Type</div>{" "}
                      <div>
                        <GoPlus color="gray" />
                      </div>
                    </div>
                    <div>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Controller
                              name="suv"
                              control={control}
                              render={({ field }) => (
                                <Checkbox
                                  {...field}
                                  checked={!!field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  sx={{ color: '#10b981', '&.Mui-checked': { color: '#10b981' } }}
                                />
                              )}
                            />
                          }
                          label="Suv"
                        />
                        <FormControlLabel
                          control={
                            <Controller
                              name="sedan"
                              control={control}
                              render={({ field }) => (
                                <Checkbox
                                  {...field}
                                  checked={!!field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  sx={{ color: '#10b981', '&.Mui-checked': { color: '#10b981' } }}
                                />
                              )}
                            />
                          }
                          label="Sedan"
                        />
                        <FormControlLabel
                          control={
                            <Controller
                              name="hatchback"
                              control={control}
                              render={({ field }) => (
                                <Checkbox
                                  {...field}
                                  checked={!!field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  sx={{ color: '#10b981', '&.Mui-checked': { color: '#10b981' } }}
                                />
                              )}
                            />
                          }
                          label="Hatchback"
                        />
                      </FormGroup>
                    </div>
                  </div>

                  <div className="w-full border-t border-t-gray-300 pt-7">
                    <div className="mb-5 flex justify-between items-center">
                      <div>Transmission</div>
                      <div>
                        <GoPlus color="gray" />
                      </div>
                    </div>
                    <div>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Controller
                              name="automatic"
                              control={control}
                              render={({ field }) => (
                                <Checkbox
                                  {...field}
                                  checked={!!field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  sx={{ color: '#10b981', '&.Mui-checked': { color: '#10b981' } }}
                                />
                              )}
                            />
                          }
                          label="Automatic"
                        />
                        <FormControlLabel
                          control={
                            <Controller
                              name="manual"
                              control={control}
                              render={({ field }) => (
                                <Checkbox
                                  {...field}
                                  checked={!!field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  sx={{ color: '#10b981', '&.Mui-checked': { color: '#10b981' } }}
                                />
                              )}
                            />
                          }
                          label="Manual"
                        />
                      </FormGroup>
                    </div>
                  </div>

                  <div className="mt-7 pt-7 border-t border-t-gray-300 hidden">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-md"
                      onClick={handleClick}
                    >
                      Apply
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;
