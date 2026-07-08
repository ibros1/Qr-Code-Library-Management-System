import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { borrowApi, getApiErrorMessage } from "../../services/api";
import type { BorrowTransaction } from "../../types";

interface BorrowState {
  items: BorrowTransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: BorrowState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "borrow/fetchAll",
  async (_: void, { rejectWithValue }) => {
    try {
      return await borrowApi.list();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load borrow records"));
    }
  },
);

export const checkoutBook = createAsyncThunk(
  "borrow/checkout",
  async ({ qrCode, userId }: { qrCode: string; userId?: number }, { rejectWithValue }) => {
    try {
      return await borrowApi.checkout(qrCode, userId);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Checkout failed"));
    }
  },
);

export const returnBook = createAsyncThunk(
  "borrow/return",
  async (qrCode: string, { rejectWithValue }) => {
    try {
      return await borrowApi.returnBook(qrCode);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Return failed"));
    }
  },
);

const borrowSlice = createSlice({
  name: "borrow",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(checkoutBook.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(returnBook.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default borrowSlice.reducer;
