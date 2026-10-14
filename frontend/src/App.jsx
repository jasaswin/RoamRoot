import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CreatorLayout from "./layouts/CreatorLayout";
import ProtectedRoute, { RoleRoute } from "./components/ProtectedRoute";
import { Skeleton } from "./components/Skeleton";

// Every page is loaded only when it is opened (code splitting)
const HomePage = lazy(() => import("./pages/HomePage"));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const ListingDetailPage = lazy(() => import("./pages/ListingDetailPage"));
const SavedPage = lazy(() => import("./pages/SavedPage"));
const TripsPage = lazy(() => import("./pages/TripsPage"));
const TripDetailPage = lazy(() => import("./pages/TripDetailPage"));
const AIPlannerPage = lazy(() => import("./pages/AIPlannerPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const StoriesPage = lazy(() => import("./pages/StoriesPage"));
const StoryDetailPage = lazy(() => import("./pages/StoryDetailPage"));
const CreateStoryPage = lazy(() => import("./pages/CreateStoryPage"));
const CreatorProfilePage = lazy(() => import("./pages/CreatorProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const CreatorDashboardPage = lazy(() => import("./pages/creator/CreatorDashboardPage"));
const CreatorListingsPage = lazy(() => import("./pages/creator/CreatorListingsPage"));
const ListingFormPage = lazy(() => import("./pages/creator/ListingFormPage"));
const CreatorBookingsPage = lazy(() => import("./pages/creator/CreatorBookingsPage"));
const CreatorAnalyticsPage = lazy(() => import("./pages/creator/CreatorAnalyticsPage"));

const Loading = () => <div className="container-page py-16"><Skeleton className="h-72 w-full" /></div>;
const guard = (page) => <ProtectedRoute>{page}</ProtectedRoute>;

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/experiences" element={<DiscoverPage preset="experiences" />} />
          <Route path="/stays" element={<DiscoverPage preset="stays" />} />
          <Route path="/places" element={<DiscoverPage preset="places" />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/stories/:id" element={<StoryDetailPage />} />
          <Route path="/creators/:id" element={<CreatorProfilePage />} />
          <Route path="/ai-planner" element={<AIPlannerPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route path="/saved" element={guard(<SavedPage />)} />
          <Route path="/trips" element={guard(<TripsPage />)} />
          <Route path="/trips/:id" element={guard(<TripDetailPage />)} />
          <Route path="/bookings" element={guard(<BookingsPage />)} />
          <Route path="/profile" element={guard(<ProfilePage />)} />
          <Route path="/create-story" element={guard(<CreateStoryPage />)} />
          <Route path="/admin" element={guard(<RoleRoute roles={["ADMIN"]}><AdminPage /></RoleRoute>)} />

          <Route path="/creator" element={guard(<CreatorLayout />)}>
            <Route path="dashboard" element={<CreatorDashboardPage />} />
            <Route path="listings" element={<CreatorListingsPage />} />
            <Route path="listings/new" element={<ListingFormPage />} />
            <Route path="listings/:id/edit" element={<ListingFormPage />} />
            <Route path="bookings" element={<CreatorBookingsPage />} />
            <Route path="analytics" element={<CreatorAnalyticsPage />} />
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
