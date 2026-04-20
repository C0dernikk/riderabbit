import { GoogleAuthProvider, signInWithPopup, getAuth } from "@firebase/auth";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import { app } from "../firebase";
import {
  signInFailure,
  signInSuccess,
} from "../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";
function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const data = await authService.google({
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
      });

      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      if (data.success) {
        if (data.user.role === "user") {
          dispatch(signInSuccess(data.user));
          toast.success("Successfully logged in with Google!");
          navigate("/");
        } else {
          dispatch(signInFailure({ message: "Not authorized as user" }));
          toast.error("This email is registered as an Admin or Vendor.");
        }
      } else {
        dispatch(signInFailure(data));
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.log("could not login with google ", error);
      toast.error(error.message || "Could not login with Google. Ensure Google is enabled in Firebase.");
    }
  };
  return (
    <div>
      <button
        className="flex w-full gap-3 justify-center items-center py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        type="button"
        onClick={handleGoogleClick}
      >
        <IconBrandGoogleFilled className="text-red-500" size={24} />
        <span>Continue with Google</span>
      </button>
    </div>
  );
}

export default OAuth;
