import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "sonner"
import UserLayout from "./layout/UserLayout"
import { Home, Movies, Theaters, Ticket, Review, Offer, Wallet, Rewards, Profile, Booking, TheaterDashboard, Login, SignUp, ManageShowsPage, SeatPricingPanel, TheaterAdminSettings, BookingsCancellationsPage, TheaterAnalyticsDashboard, CustomerFeedbackPage, OffersManagementPage, AdminDashboard, UserManagementPage, TheaterManagementPage, ContentModerationPage, AdminFinanceDashboard, SystemAnalyticsPage, SecurityAndComplianceDashboard, AdminSettingsPage, BookingConfirmation, Payment} from "./pages"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TheaterLayout from "./layout/TheaterLayout"
import AdminLayout from "./layout/AdminLayout"
const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Toaster richColors closeButton position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<UserLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/theaters" element={<Theaters />} />
              <Route path="/tickets" element={<Ticket />} />
              <Route path="/reviews" element={<Review />} />
              <Route path="/offers" element={<Offer />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/booking/payment" element={<Payment />} />
              <Route path='booking/confirmation' element={<BookingConfirmation />} />
            </Route>
            <Route path="/" element={<TheaterLayout />}>
              <Route path="/theater/dashboard" element={<TheaterDashboard />} />
              <Route path="/theater/shows" element={<ManageShowsPage />} />
              <Route path="/theater/pricing" element={<SeatPricingPanel />} />
              <Route path="/theater/settings" element={<TheaterAdminSettings />} />
              <Route path="/theater/bookings" element={<BookingsCancellationsPage />} />
              <Route path="/theater/reports" element={<TheaterAnalyticsDashboard />} />
              <Route path="/theater/reviews" element={<CustomerFeedbackPage />} />
              <Route path="/theater/offers" element={<OffersManagementPage />} />
            </Route>
            <Route path="/" element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/theaters" element={<TheaterManagementPage />} />
              <Route path="/admin/content" element={<ContentModerationPage />} />
              <Route path="/admin/finance" element={<AdminFinanceDashboard />} />
              <Route path="/admin/analytics" element={<SystemAnalyticsPage />} />
              <Route path="/admin/security" element={<SecurityAndComplianceDashboard />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App