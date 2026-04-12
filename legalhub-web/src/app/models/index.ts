// User model
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'partner' | 'associate' | 'paralegal' | 'admin';
  avatar?: string;
  title?: string;
}

// Case model
export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  client: string;
  clientId: string;
  type: string;
  status: 'active' | 'pending' | 'closed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  openDate: Date;
  nextHearing?: Date;
  court?: string;
  description?: string;
  tags?: string[];
}

// Client model
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: 'individual' | 'corporate';
  status: 'active' | 'inactive';
  address?: string;
  totalCases: number;
  openCases: number;
  avatar?: string;
  joinDate: Date;
}

// Invoice model
export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  clientId: string;
  caseId?: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

// Document model
export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  caseId?: string;
  clientId?: string;
  uploadedBy: string;
  uploadDate: Date;
  tags?: string[];
  folder?: string;
}

// Notification model
export interface Notification {
  id: string;
  type: 'hearing' | 'deadline' | 'payment' | 'document' | 'system';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  link?: string;
}

// Calendar Event model
export interface CalendarEvent {
  id: string;
  title: string;
  type: 'hearing' | 'meeting' | 'deadline' | 'reminder';
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  caseId?: string;
  clientId?: string;
  description?: string;
  color?: string;
}
