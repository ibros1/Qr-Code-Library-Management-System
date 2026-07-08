import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { authApi, getApiErrorMessage, TOKEN_STORAGE_KEY } from "../../services/api";
import type { LoginPayload, RegisterPayload, UpdateMePayload, User } from "../../types";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated" | "error";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  status: "idle",
  error: null,
};

export const login = createAsyncThunk("auth/login", async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    return await authApi.login(payload);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Invalid email or password"));
  }
});

export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      return await authApi.register(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Registration failed"));
    }
  },
);

export const fetchCurrentUser = createAsyncThunk("auth/me", async (_: void, { rejectWithValue }) => {
  try {
    return await authApi.me();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Session expired"));
  }
});

export const updateMe = createAsyncThunk(
  "auth/updateMe",
  async (payload: UpdateMePayload, { rejectWithValue }) => {
    try {
      return await authApi.updateMe(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update profile"));
    }
  },
);

export const uploadAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (file: File, { rejectWithValue }) => {
    try {
      return await authApi.uploadAvatar(file);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to upload photo"));
    }
  },
);

export const removeAvatar = createAsyncThunk("auth/removeAvatar", async (_: void, { rejectWithValue }) => {
  try {
    return await authApi.removeAvatar();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to remove photo"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "unauthenticated";
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ access_token: string; user: User }>) => {
        state.status = "authenticated";
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.access_token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ access_token: string; user: User }>) => {
        state.status = "authenticated";
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.access_token);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Registration failed";
      })
      .addCase(updateMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      })
      .addCase(uploadAvatar.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      })
      .addCase(removeAvatar.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = "unauthenticated";
        state.user = null;
        state.token = null;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
