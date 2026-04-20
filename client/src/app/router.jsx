import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ScrollToTop from "../components/ScrollToTop";
import { ProtectedRoute, PublicOnlyRoute } from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import AppHome from "../pages/user/Home";
import SignIn from "../pages/user/SignIn";
import SignUp from "../pages/user/SignUp";
import ForgotPassword from "../pages/user/ForgotPassword";
import ResetPassword from "../pages/user/ResetPassword";
import Vehicles from "../pages/user/Vehicles";
import Enterprise from "../pages/user/Enterprise";
import Contact from "../pages/user/Contact";
import VehicleDetails from "../pages/user/VehicleDetails";
import CheckoutPage from "../pages/user/CheckoutPage";
import AllVehiclesofSameModel from "../pages/user/AllVehiclesofSameModel";
import AvailableVehicles from "../pages/user/AvailableVehiclesAfterSearch";
import Orders from "../pages/user/Orders";
import Favorites from "../pages/user/Favorites";
import UserProfileContent from "../components/UserProfileContent";
import CarNotFound from "../pages/user/CarNotFound";
import SettingsNotAvailable from "../pages/user/SettingsNotAvailable";

import VendorSignin from "../pages/vendor/pages/VendorSignin";
import VendorSignup from "../pages/vendor/pages/VendorSignup";
import VendorHomeMain from "../pages/vendor/pages/VendorHomeMain";
import VendorAllVehicles from "../pages/vendor/pages/VendorAllVehicles";
import VendorBookings from "../pages/vendor/Components/VendorBookings";
import VendorEditProductComponent from "../pages/vendor/Components/VendorEditProductComponent";
import VendorDeleteVehicleModal from "../pages/vendor/Components/VendorDeleteVehicleModal";
import VendorAddVehicleModal from "../pages/vendor/Components/VendorAddVehicleModal";
import VendorPayouts from "../pages/vendor/pages/VendorPayouts";

import AdminHomeMain from "../pages/admin/pages/AdminHomeMain";
import {
  AllVehicles,
  AllUsers,
  AllVendors,
  VenderVehicleRequests,
} from "../pages/admin/pages";
import Bookings from "../pages/admin/components/Bookings";
import EditProductComponent from "../pages/admin/components/EditProductComponent";
import AddProductModal from "../pages/admin/components/AddProductModal";

const AppRouter = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<AppHome />} />
        <Route path="/" element={<AppHome />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/enterprise" element={<Enterprise />} />
        <Route path="/contact" element={<Contact />} />

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/allVariants" element={<AllVehiclesofSameModel />} />
          <Route path="/vehicleDetails" element={<VehicleDetails />} />
          <Route path="/availableVehicles" element={<AvailableVehicles />} />
          <Route path="/checkoutPage" element={<CheckoutPage />} />

          <Route path="/profile" element={<DashboardLayout />}>
            <Route index element={<UserProfileContent />} />
            <Route path="orders" element={<Orders />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="settings" element={<SettingsNotAvailable />} />
          </Route>
        </Route>
      </Route>

      <Route
        path="/vendorDashboard"
        element={<ProtectedRoute allowedRoles={["vendor"]} />}
      >
        <Route element={<DashboardLayout />}>
          <Route index element={<VendorHomeMain />} />
          <Route path="vendorHome" element={<VendorHomeMain />} />
          <Route path="adminHome" element={<Navigate to="/vendorDashboard" replace />} />
          <Route path="vendorAllVeihcles" element={<VendorAllVehicles />} />
          <Route path="vendorAllVehicles" element={<VendorAllVehicles />} />
          <Route path="bookings" element={<VendorBookings />} />
          <Route path="vendorEditProductComponent" element={<VendorEditProductComponent />} />
          <Route path="vendorDeleteVehicleModal" element={<VendorDeleteVehicleModal />} />
          <Route path="vendorAddProduct" element={<VendorAddVehicleModal />} />
          <Route path="profile" element={<UserProfileContent />} />
          <Route path="payouts" element={<VendorPayouts />} />
        </Route>
      </Route>

      <Route
        path="/adminDashboard"
        element={<ProtectedRoute allowedRoles={["admin"]} />}
      >
        <Route element={<DashboardLayout />}>
          <Route index element={<AdminHomeMain />} />
          <Route path="adminHome" element={<AdminHomeMain />} />
          <Route path="allProduct" element={<AllVehicles />} />
          <Route path="allUsers" element={<AllUsers />} />
          <Route path="allVendors" element={<AllVendors />} />
          <Route path="vendorVehicleRequests" element={<VenderVehicleRequests />} />
          <Route path="orders" element={<Bookings />} />
          <Route path="editProducts" element={<EditProductComponent />} />
          <Route path="addProducts" element={<AddProductModal />} />
        </Route>
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/vendorSignin" element={<VendorSignin />} />
        <Route path="/vendorSignup" element={<VendorSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route path="*" element={<CarNotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
