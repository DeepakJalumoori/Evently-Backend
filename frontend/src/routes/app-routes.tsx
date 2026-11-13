import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/root-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { AttendeeLayout } from "@/layouts/attendee-layout";
import { OrganizerLayout } from "@/layouts/organizer-layout";

import { ProtectedRoute } from "@/routes/protected-route";
import { RoleRoute } from "@/routes/role-route";

// Public Pages
import { HomePage } from "@/pages/public/home-page";
import { EventDiscoveryPage } from "@/pages/public/event-discovery-page";
import { EventDetailPage } from "@/pages/public/event-detail-page";

// Auth Pages
import { LoginPage } from "@/pages/auth/login-page";
import { RegisterPage } from "@/pages/auth/register-page";

// Attendee Pages
import { AttendeeDashboardPage, MyBookingsPage } from "@/pages/attendee/my-bookings-page";

// Organizer Pages
import {
  OrganizerDashboardPage,
  CreateEventPage,
  EditEventPage,
  EventBookingsPage,
} from "@/pages/organizer/organizer-dashboard-page";

// Error Pages
import { UnauthorizedPage } from "@/pages/error/unauthorized-page";
import { NotFoundPage } from "@/pages/error/not-found-page";

// Phase 1 Foundation Showcase
import { FoundationShowcase } from "@/pages/public/foundation-showcase";

export const router = createBrowserRouter([
  // Public & General Layout
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "events", element: <EventDiscoveryPage /> },
      { path: "events/:id", element: <EventDetailPage /> },
      ...(import.meta.env.DEV
        ? [{ path: "foundation", element: <FoundationShowcase /> }]
        : []),
      { path: "403", element: <UnauthorizedPage /> },
    ],
  },

  // Guest Authentication Layout
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },

  // Authenticated Attendee Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={["attendee"]} />,
        children: [
          {
            element: <AttendeeLayout />,
            children: [
              { path: "dashboard", element: <AttendeeDashboardPage /> },
              { path: "my-bookings", element: <MyBookingsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Authenticated Organizer Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={["organizer"]} />,
        children: [
          {
            element: <OrganizerLayout />,
            children: [
              { path: "organizer", element: <OrganizerDashboardPage /> },
              { path: "organizer/events/create", element: <CreateEventPage /> },
              { path: "organizer/events/:id/edit", element: <EditEventPage /> },
              { path: "organizer/events/:id/bookings", element: <EventBookingsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // 404 Fallback
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
