import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Role = "TEACHER" | "STUDENT" | "PARENT";

export type User = {
  id: string;
  name: string;
  email?: string;
  role: Role;
};

interface AuthState {
  accessToken: string | null; // in-memory only
  user: User | null;
}

const initialState: AuthState = { accessToken: null, user: null };

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user: User }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { setCredentials, setAccessToken, clearAuth } = slice.actions;
export default slice.reducer;

export type AuthStateRoot = { auth: AuthState };
export const selectAccessToken = (s: AuthStateRoot) => s.auth.accessToken;
export const selectUser = (s: AuthStateRoot) => s.auth.user;
