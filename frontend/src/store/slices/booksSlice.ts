import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { booksApi, getApiErrorMessage } from "../../services/api";
import type { Book, BookPayload } from "../../types";

interface BooksState {
  items: Book[];
  loading: boolean;
  error: string | null;
}

const initialState: BooksState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBooks = createAsyncThunk("books/fetchAll", async (_: void, { rejectWithValue }) => {
  try {
    return await booksApi.list();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to load books"));
  }
});

export const createBook = createAsyncThunk(
  "books/create",
  async (payload: BookPayload, { rejectWithValue }) => {
    try {
      return await booksApi.create(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create book"));
    }
  },
);

export const updateBook = createAsyncThunk(
  "books/update",
  async ({ id, payload }: { id: number; payload: Partial<BookPayload> }, { rejectWithValue }) => {
    try {
      return await booksApi.update(id, payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update book"));
    }
  },
);

export const deleteBook = createAsyncThunk(
  "books/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await booksApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete book"));
    }
  },
);

export const generateBookCopy = createAsyncThunk(
  "books/generateCopy",
  async (bookId: number, { rejectWithValue }) => {
    try {
      const copy = await booksApi.generateCopy(bookId);
      return { bookId, copy };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to generate QR copy"));
    }
  },
);

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      })
      .addCase(generateBookCopy.fulfilled, (state, action) => {
        const book = state.items.find((b) => b.id === action.payload.bookId);
        if (book) book.copies.push(action.payload.copy);
      });
  },
});

export default booksSlice.reducer;
