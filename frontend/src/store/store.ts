import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import booksReducer from "./slices/booksSlice";
import categoriesReducer from "./slices/categoriesSlice";
import membersReducer from "./slices/membersSlice";
import borrowReducer from "./slices/borrowSlice";
import finesReducer from "./slices/finesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    categories: categoriesReducer,
    members: membersReducer,
    borrow: borrowReducer,
    fines: finesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
