export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  LAB = 'LAB',
  LAB_EMP = 'LAB_EMP',
  CLIENT = 'CLIENT',
}


export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  branchId?: string | Branch;
  isActive: boolean;
  createdAt: string;
}

export interface Branch {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  labName: string;
  labLicense: string;
  isActive: boolean;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  age: number;
  gender: string;
  address: string;
  branchId: string | Branch;
  referredBy: string;
  isActive: boolean;
}

export interface TestParameter {
  name: string;
  unit: string;
  normalRangeMin?: number;
  normalRangeMax?: number;
  normalRangeText?: string;
  method?: string;
}

export interface TestMaster {
  _id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  sampleType: string;
  price: number;
  parameters: TestParameter[];
  turnaroundTime: string;
  isActive: boolean;
}

export interface TestOrder {
  _id: string;
  orderNumber: string;
  clientId: string | Client;
  branchId: string | Branch;
  tests: (string | TestMaster)[];
  status: 'ORDERED' | 'COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  sampleCollectedAt?: string;
  collectedBy?: string | User;
  orderedBy?: string | User;
  totalAmount: number;
  discount: number;
  netAmount: number;
  notes?: string;
  createdAt: string;
}

export interface ResultParameter {
  name: string;
  value: string;
  unit: string;
  normalRangeMin?: number;
  normalRangeMax?: number;
  normalRangeText?: string;
  flag: 'H' | 'L' | 'N' | '';
  method?: string;
}

export interface LabReport {
  _id: string;
  reportNumber: string;
  testOrderId: string | TestOrder;
  clientId: string | Client;
  testId: string | TestMaster;
  branchId: string | Branch;
  status: 'PENDING' | 'RESULTS_ENTERED' | 'VERIFIED';
  results: ResultParameter[];
  htmlContent?: string;
  enteredBy?: string | User;
  verifiedBy?: string | User;
  verifiedAt?: string;
  notes?: string;
  qrCode?: string;
  createdAt: string;
}

export interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: string | Client;
  branchId?: string | Branch;
  testOrderId?: string;
  quotationId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  paidAt?: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Quotation {
  _id: string;
  quotationNumber: string;
  clientId: string | Client;
  branchId?: string | Branch;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'CONVERTED' | 'REJECTED';
  validUntil?: string;
  notes?: string;
  createdAt: string;
}

export interface ReportTemplate {
  _id: string;
  name: string;
  content: string;
  type: 'lab_report' | 'invoice' | 'quotation';
  description?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface AuditLogEntry {
  _id: string;
  userId?: string | User;
  action: string;
  entity: string;
  entityId?: string;
  diff?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}


export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  docs: T[];
  [key: string]: any;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

