export interface Transcript {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string | Date;
}

export interface CallSummary {
  id: string;
  content: string;
  roomNumber?: string;
  timestamp: string | Date;
  duration?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  serviceType?: string; // Type of service this item belongs to
}

export interface OrderSummary {
  orderType: string;
  deliveryTime: 'asap' | '30min' | '1hour' | 'specific';
  roomNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialInstructions: string;
  items: OrderItem[];
  totalAmount: number;
}

export interface ServiceRequest {
  serviceType: string; // Key from categories like 'room-service', 'tours-activities', etc.
  requestText: string; // Full text of request
  details: {
    date?: string;
    time?: string;
    location?: string;
    people?: number;
    amount?: string;
    roomNumber?: string;
    otherDetails?: string;
  }
}

export interface Order {
  reference: string;
  estimatedTime: string;
  summary: OrderSummary;
}

export interface CallDetails {
  id: string;
  roomNumber: string;
  duration: string;
  category: string;
}

export type InterfaceLayer = 'interface1' | 'interface2' | 'interface3' | 'interface3vi' | 'interface4';

export interface AssistantContextType {
  activeOrders: ActiveOrder[];
  addActiveOrder: (order: ActiveOrder) => void;
  currentInterface: InterfaceLayer;
  setCurrentInterface: (layer: InterfaceLayer) => void;
  transcripts: Transcript[];
  addTranscript: (transcript: Omit<Transcript, 'id' | 'timestamp' | 'callId'>) => void;
  orderSummary: OrderSummary | null;
  setOrderSummary: (summary: OrderSummary) => void;
  callDetails: CallDetails | null;
  setCallDetails: (details: CallDetails) => void;
  order: Order | null;
  setOrder: (order: Order) => void;
  callDuration: number;
  isMuted: boolean;
  toggleMute: () => void;
  startCall: () => Promise<void>;
  endCall: () => void;
  callSummary: CallSummary | null;
  setCallSummary: (summary: CallSummary) => void;
  serviceRequests: ServiceRequest[];
  setServiceRequests: (requests: ServiceRequest[]) => void;
  vietnameseSummary: string | null;
  setVietnameseSummary: (summary: string) => void;
  translateToVietnamese: (text: string) => Promise<string>;
  emailSentForCurrentSession: boolean;
  setEmailSentForCurrentSession: (sent: boolean) => void;
  requestReceivedAt: Date | null;
  setRequestReceivedAt: (date: Date) => void;
}

// Represents an order item in the status panel
export interface ActiveOrder {
  reference: string;
  requestedAt: Date;
  estimatedTime: string;
}

export type StaffRequestStatus = 'New' | 'Doing' | 'Done' | 'Error' | 'Delivering' | 'Confirmed';

export interface StaffMessage {
  id: string;
  sender: 'staff' | 'system';
  content: string;
  timestamp: string | Date;
}

export interface StaffRequest {
  id: string;
  status: string;
  messages: StaffMessage[];
  timestamp: string | Date;
}

export interface SocketMessage {
  requestId: string;
  status?: string;
  message?: StaffMessage;
}
