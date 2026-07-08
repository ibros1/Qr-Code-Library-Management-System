import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { categoriesApi, getApiErrorMessage } from "../../services/api";
import type { Category, CategoryPayload } from "../../types";

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_: void, { rejectWithValue }) => {
    try {
      return await categoriesApi.list();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load categories"));
    }
  },
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (payload: CategoryPayload, { rejectWithValue }) => {
    try {
      return await categoriesApi.create(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create category"));
    }
  },
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, payload }: { id: number; payload: Partial<CategoryPayload> }, { rejectWithValue }) => {
    try {
      return await categoriesApi.update(id, payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update category"));
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await categoriesApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete category"));
    }
  },
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
