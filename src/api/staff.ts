import { db } from '../db';
import { staff, request, message } from '../db/schema';
import { eq } from 'drizzle-orm';

// Mock data for staff login (replace with actual DB query)
const staffCredentials = [
  { username: 'staff1', password: 'password1' },
  { username: 'staff2', password: 'password2' }
];

export const loginStaff = async (username: string, password: string) => {
  const foundStaff = await db.select().from(staff).where(eq(staff.username, username)).limit(1);
  if (foundStaff.length > 0 && foundStaff[0].password === password) {
    return { token: 'mock-jwt-token' };
  }
  return null;
};

export const getRequests = async () => {
  return await db.select().from(request);
};

export const updateRequestStatus = async (requestId: number, status: string) => {
  await db.update(request).set({ status }).where(eq(request.id, requestId));
};

export const getMessages = async (requestId: number) => {
  return await db.select().from(message).where(eq(message.requestId, requestId));
};

export const sendMessage = async (requestId: number, sender: string, content: string) => {
  await db.insert(message).values({ requestId, sender, content });
};

export const deleteAllRequests = async () => {
  return await db.delete(request).returning();
}; 