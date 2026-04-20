import { useDispatch, useSelector } from "react-redux";
import { setOrderModalOpen, openGlobalChat } from "../../../features/ui/uiSlice";
import { IconMessage } from "@tabler/icons-react";

const VendorBookingDetailModal = () => {
  const { isOrderModalOpen: isVendorOderModalOpen, singleOrderDetails: cur } = useSelector(
    (state) => state.ui,
  );

  const dispatch = useDispatch();

  let pickupDate;
  let dropOffDate;

  if (cur) {
    pickupDate = new Date(cur && cur.pickupDate);
    dropOffDate = new Date(cur && cur.dropOffDate);
  }

  const closeModal = () => {
    dispatch(setOrderModalOpen(false));
  };

  const handleOpenChat = (e) => {
    e.stopPropagation();
    if (cur) {
      dispatch(
        openGlobalChat({
          bookingId: cur._id,
          otherPartyId: cur.userId?._id || cur.userId,
          otherPartyName: cur.userId?.name || "Customer",
        })
      );
    }
  };

  return (
    <>
      {isVendorOderModalOpen && cur ? (
        <div
          className={` fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black bg-opacity-60 opacity-100 backdrop-blur-sm transition duration-300  ease-in-out overflow-scroll`}
          onClick={closeModal}
        >
          <div className=" relative m-4 mx-auto  min-w-[300px] md:min-w-[500px] max-w-[40%]  rounded-lg bg-white font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased shadow-2xl">
            <div className="relative pt-10 p-4 antialiased capitalize font-medium text-[10px] md:text-[16px] ">
              <div className="mb-4 ">
                <div className="mb-2 font-bold">Booking Details</div>
                <hr></hr>
                <div className="mb-4 mt-2">
                  <div className="flex items-center  justify-between">
                    <div>Booking Id</div>
                    <div>{cur._id}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Total Amount</div>
                    <div>{cur.totalPrice}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2 ">
                    <div>Pickup Location</div>
                    <div>{cur.pickUpLocation}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Pickup Date</div>
                    <div>
                      <span>{pickupDate.getDate()}</span>/
                      {pickupDate.getMonth() + 1}
                      <span>/{pickupDate.getFullYear()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Pickup Time</div>
                    <div>
                      <span>{pickupDate.getHours()}</span>:
                      {pickupDate.getMinutes()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>Dropoff Location</div>
                  <div>{cur.dropOffLocation}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div>Dropoff Date</div>
                  <div>
                    <span>{dropOffDate.getDate()}</span>:
                    {dropOffDate.getMonth()}
                    <span>:{dropOffDate.getFullYear()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>Dropoff Time</div>
                  <div>
                    <span>{dropOffDate.getHours()}</span>:
                    {dropOffDate.getMinutes()}
                  </div>
                </div>
              </div>

              <div className="mt-4 font-bold">Vehicle Details</div>
              <hr className="mt-4 mb-4" />
              <div className="flex items-center justify-between">
                <div>Vehicle Number</div>
                <div>{cur.vehicleDetails?.registrationNumber || 'N/A'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Model</div>
                <div>{cur.vehicleDetails?.model || 'N/A'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Company</div>
                <div>{cur.vehicleDetails?.brand || 'N/A'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Vehicle Type</div>
                <div>{cur.vehicleDetails?.carType || 'N/A'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Seats</div>
                <div>{cur.vehicleDetails?.seats || 'N/A'}</div>
              </div>

              <div className="flex items-center justify-between">
                <div>Fuel Type</div>
                <div>{cur.vehicleDetails?.fuelType || 'N/A'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Transmission</div>
                <div>{cur.vehicleDetails?.transmission || 'N/A'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Manufacturing Year</div>
                <div>{cur.vehicleDetails?.yearMade || 'N/A'}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between p-4 shrink-0 text-blue-gray-500">
              <button
                className="flex items-center gap-2 rounded-lg bg-blue-50 py-3 px-6 font-sans text-xs font-bold uppercase text-blue-600 hover:bg-blue-100 transition ease-in-out duration-300"
                onClick={handleOpenChat}
              >
                <IconMessage size={16} />
                Chat with User
              </button>
              <button
                className="middle none center rounded-lg bg-gradient-to-tr from-green-600 to-green-400 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-green-500/20 transition ease-in-out duration-300 hover:shadow-lg hover:shadow-green-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none animate-bounce hover:animate-none"
                onClick={closeModal}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute top-0"></div>
      )}
    </>
  );
};

export default VendorBookingDetailModal;
