import { toast } from "sonner";
import { bookingService } from "../../services/bookings";
import { setLatestBooking, setPaymentStatus } from "../../features/bookings/bookingsSlice";
import { setSweetAlert, setPageLoading } from "../../features/ui/uiSlice";

/**
 * Utility to load external scripts dynamically.
 */
export function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Fetch the most recent booking for the user.
 */
export const fetchLatestBooking = async (user_id, dispatch) => {
  try {
    const data = await bookingService.getLatestBooking();

    if (data.success && data.bookings?.length > 0) {
      dispatch(setLatestBooking(data.bookings[0]));
      dispatch(setPaymentStatus(true));
      return data.bookings[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching latest booking:", error);
    return null;
  }
};

/**
 * Main function to trigger Razorpay payment flow.
 */
export async function displayRazorpay(bookingDetails, navigate, dispatch) {
  try {
    const isLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js",
    );

    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Please check your connection.");
      return { ok: false };
    }

    // 1. Create a new payment order on the backend
    const orderResponse = await bookingService.createRazorpayOrder(bookingDetails);

    if (!orderResponse.success) {
      toast.error(orderResponse.message || "Failed to initialize payment");
      return { ok: false };
    }

    const { order } = orderResponse;
    const { amount, id: order_id, currency } = order;

    // 2. Configure Razorpay options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_key_here",
      amount: amount.toString(),
      currency: currency,
      name: "RideRabbit",
      description: `Booking for ${bookingDetails.brand} ${bookingDetails.model}`,
      image: "/LOGO.svg",
      order_id: order_id,
      handler: async function (response) {
        try {
          dispatch(setPageLoading(true));

          const paymentVerificationData = {
            ...bookingDetails,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          // 3. Confirm booking on the backend
          const bookingResponse = await bookingService.createBooking(paymentVerificationData);

          if (bookingResponse.success) {
            dispatch(setSweetAlert(true));
            await fetchLatestBooking(bookingDetails.user_id, dispatch);

            toast.success("Payment Successful! Your ride is booked.");
            navigate("/profile/orders"); // Redirect to orders instead of home
          } else {
            toast.error(bookingResponse.message || "Failed to confirm booking");
          }
        } catch (error) {
          toast.error(error.message || "Error during booking confirmation");
        } finally {
          dispatch(setPageLoading(false));
        }
      },
      prefill: {
        name: bookingDetails.username || "User",
        email: bookingDetails.email || "",
        contact: bookingDetails.phoneNumber || "",
      },
      theme: {
        color: "#0f172a", // Midnight Blue (Brand Primary)
      },
      modal: {
        ondismiss: function () {
          dispatch(setPageLoading(false));
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    return { ok: true };
  } catch (error) {
    toast.error(error.message || "An error occurred with the payment gateway");
    return { ok: false };
  }
}

// Export as a service object for cleaner imports
const RazorpayService = {
  displayRazorpay,
  fetchLatestBooking,
};

export default RazorpayService;
