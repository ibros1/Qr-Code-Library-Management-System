import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getApiErrorMessage, membersApi } from "../../services/api";
import type { MemberPayload, User } from "../../types";

interface MembersState {
  items: User[];
  loading: boolean;
  error: string | null;
}

const initialState: MembersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchMembers = createAsyncThunk("members/fetchAll", async (_: void, { rejectWithValue }) => {
  try {
    return await membersApi.list();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to load members"));
  }
});

export const createMember = createAsyncThunk(
  "members/create",
  async (payload: MemberPayload, { rejectWithValue }) => {
    try {
      return await membersApi.create(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create member"));
    }
  },
);

export const updateMember = createAsyncThunk(
  "members/update",
  async ({ id, payload }: { id: number; payload: Partial<MemberPayload> }, { rejectWithValue }) => {
    try {
      return await membersApi.update(id, payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update member"));
    }
  },
);

export const deleteMember = createAsyncThunk(
  "members/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await membersApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete member"));
    }
  },
);

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      });
  },
});

export default membersSlice.reducer;
