export type Role = "Admin" | "Member";

export type CopyStatus = "Available" | "Borrowed";

export type TransactionStatus = "Borrowed" | "Returned" | "Overdue";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface BookCopy {
  id: number;
  book_id: number;
  qr_code: string;
  status: CopyStatus;
}

export interface Category {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: Category;
  published_year: number | null;
  copies: BookCopy[];
}

export interface BorrowTransaction {
  id: number;
  user_id: number;
  book_copy_id: number;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: TransactionStatus;
  user?: User | null;
  book_copy?: BookCopy | null;
}

export interface Fine {
  id: number;
  borrow_transaction_id: number;
  amount: string;
  paid: boolean;
  borrow_transaction?: BorrowTransaction | null;
}

export interface DashboardStats {
  total_books: number;
  available_copies: number;
  borrowed_copies: number;
  overdue_count: number;
  recent_activity: BorrowTransaction[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface UpdateMePayload {
  full_name?: string;
  email?: string;
  password?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface BookPayload {
  title: string;
  author: string;
  isbn: string;
  category_id: number;
  published_year?: number | null;
}

export interface CategoryPayload {
  name: string;
}

export interface MemberPayload {
  full_name: string;
  email: string;
  password?: string;
  role: Role;
}

export interface ApiErrorResponse {
  detail: string;
}
