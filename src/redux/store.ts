import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/auth/auth';

// Define the root state type
export interface RootState {
  auth: {
    isAuthenticated: boolean;
    userInfo: {
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      role: "admin" | "theaterOwner" | "user";
      avatar?: string;
      status: "Active" | "Banned" | "Inactive" | "Unbanned"; // Added status
    } | null;
    token: string | null;
  };
}

// Configure the store
const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch;

// Export the store
export default store;