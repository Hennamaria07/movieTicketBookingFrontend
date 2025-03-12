// src/redux/features/auth/auth.ts (or wherever your slice is located)
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define interfaces for type safety
interface ISocialLogin {
  googleId?: string;
  facebookId?: string;
  appleId?: string;
  [key: string]: string | undefined; // Allow dynamic property access
}

interface UserInfo {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "admin" | "theaterOwner" | "user";
  avatar?: string; // Keeping it simple as a string (URL) for Redux; can be expanded to match Mongoose if needed
  status: "Active" | "Banned" | "Inactive" | "Unbanned"; // Added status from Mongoose schema
}

interface AuthState {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  token: string | null;
}

interface RootState {
  auth: AuthState;
}

// Initial state with proper typing
const initialState: RootState = {
  auth: {
    isAuthenticated: localStorage.getItem('isAuthenticated')
      ? localStorage.getItem('isAuthenticated') === 'true'
      : false,
    userInfo: localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo') as string)
      : null,
    token: localStorage.getItem('token')
      ? localStorage.getItem('token')
      : null,
  },
};

const userSlice = createSlice({
  name: "userCrud",
  initialState,
  reducers: {
    addUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.auth.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    addAuth: (state, action: PayloadAction<AuthState>) => {
      state.auth = action.payload;
      // Update localStorage with new auth state
      localStorage.setItem("isAuthenticated", action.payload.isAuthenticated.toString());
      localStorage.setItem("userInfo", JSON.stringify(action.payload.userInfo));
      localStorage.setItem("token", action.payload.token || "");
    },
    logout: (state) => {
      // Reset auth state to initial values
      state.auth = {
        isAuthenticated: false,
        userInfo: null,
        token: null,
      };
      // Clear localStorage
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    },
  },
});

export const {
  addUserInfo,
  addAuth,
  logout, // Export the new logout action
} = userSlice.actions;

export default userSlice.reducer;