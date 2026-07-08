import axios from "axios";
import type {
  Book,
  BookCopy,
  BookPayload,
  BorrowTransaction,
  Category,
  CategoryPayload,
  DashboardStats,
  Fine,
  LoginPayload,
  MemberPayload,
  RegisterPayload,
  TokenResponse,
  UpdateMePayload,
  User,
} from "../types";

export const TOKEN_STORAGE_KEY = "qr_library_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/auth/login") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export const authApi = {
  login: (payload: LoginPayload) => api.post<TokenResponse>("/auth/login", payload).then((r) => r.data),
  register: (payload: RegisterPayload) =>
    api.post<TokenResponse>("/auth/register", payload).then((r) => r.data),
  me: () => api.get<User>("/auth/me").then((r) => r.data),
  updateMe: (payload: UpdateMePayload) => api.put<User>("/auth/me", payload).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post<User>("/auth/me/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  removeAvatar: () => api.delete<User>("/auth/me/avatar").then((r) => r.data),
};

export const categoriesApi = {
  list: () => api.get<Category[]>("/categories").then((r) => r.data),
  create: (payload: CategoryPayload) => api.post<Category>("/categories", payload).then((r) => r.data),
  update: (id: number, payload: Partial<CategoryPayload>) =>
    api.put<Category>(`/categories/${id}`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/categories/${id}`),
};

export const booksApi = {
  list: () => api.get<Book[]>("/books").then((r) => r.data),
  get: (id: number) => api.get<Book>(`/books/${id}`).then((r) => r.data),
  create: (payload: BookPayload) => api.post<Book>("/books", payload).then((r) => r.data),
  update: (id: number, payload: Partial<BookPayload>) =>
    api.put<Book>(`/books/${id}`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/books/${id}`),
  generateCopy: (bookId: number) =>
    api.post<BookCopy>(`/books/${bookId}/copies`).then((r) => r.data),
  listCopies: (bookId: number) => api.get<BookCopy[]>(`/books/${bookId}/copies`).then((r) => r.data),
  removeCopy: (copyId: number) => api.delete(`/books/copies/${copyId}`),
};

export const membersApi = {
  list: () => api.get<User[]>("/users").then((r) => r.data),
  get: (id: number) => api.get<User>(`/users/${id}`).then((r) => r.data),
  create: (payload: MemberPayload) => api.post<User>("/users", payload).then((r) => r.data),
  update: (id: number, payload: Partial<MemberPayload>) =>
    api.put<User>(`/users/${id}`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/users/${id}`),
};

export const borrowApi = {
  list: () => api.get<BorrowTransaction[]>("/borrow").then((r) => r.data),
  checkout: (qr_code: string, user_id?: number) =>
    api.post<BorrowTransaction>("/borrow/checkout", { qr_code, user_id }).then((r) => r.data),
  returnBook: (qr_code: string) =>
    api.post<BorrowTransaction>("/borrow/return", { qr_code }).then((r) => r.data),
};

export const finesApi = {
  list: () => api.get<Fine[]>("/fines").then((r) => r.data),
  markPaid: (id: number) => api.put<Fine>(`/fines/${id}/pay`).then((r) => r.data),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/dashboard/stats").then((r) => r.data),
};

export default api;
