import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "sonner"
import UserLayout from "./layout/UserLayout"
import { Home, Movies, Theaters, Ticket, Review, Offer, Wallet, Rewards, Profile, TheaterDashboard, Login, SignUp, ManageShowsPage, SeatPricingPanel} from "./pages"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TheaterLayout from "./layout/TheaterLayout"
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
            </Route>
            <Route path="/" element={<TheaterLayout />}>
              <Route path="/theater/dashboard" element={<TheaterDashboard />} />
              <Route path="/theater/shows" element={<ManageShowsPage />} />
              <Route path="/theater/pricing" element={<SeatPricingPanel />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App