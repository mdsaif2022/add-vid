import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function setAdminSession(): void {
  // In a real app, you'd use a proper session management system
  // For now, we'll use a simple cookie-based approach
  const cookieStore = cookies();
  cookieStore.set('admin-authenticated', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies();
  return cookieStore.get('admin-authenticated')?.value === 'true';
}

export function clearAdminSession(): void {
  const cookieStore = cookies();
  cookieStore.delete('admin-authenticated');
}
