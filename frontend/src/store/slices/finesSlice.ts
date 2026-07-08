import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { finesApi, getApiErrorMessage } from "../../services/api";
import type { Fine } from "../../types";

interface FinesState {
  items: Fine[];
  loading: boolean;
  error: string | null;
}

const initialState: FinesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchFines = createAsyncThunk("fines/fetchAll", async (_: void, { rejectWithValue }) => {
  try {
    return await finesApi.list();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to load fines"));
  }
});

export const payFine = createAsyncThunk("fines/pay", async (id: number, { rejectWithValue }) => {
  try {
    return await finesApi.markPaid(id);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to mark fine as paid"));
  }
});

const finesSlice = createSlice({
  name: "fines",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFines.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(payFine.fulfilled, (state, action) => {
        const idx = state.items.findIndex((f) => f.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default finesSlice.reducer;
