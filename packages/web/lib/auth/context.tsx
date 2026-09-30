'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  role: 'owner' | 'ops' | 'admin' | 'platform';
  tenant_id: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role?: 'owner' | 'ops') => void;
  register: (email: string, password: string, tenantName: string) => Promise<void>;
  acceptInvite: (token: string, password: string) => Promise<void>;
  logout: () => void;
}

export const DEMO_USERS: Record<'owner' | 'ops', User> = {
  owner: {
    id: 'demo-owner-001',
    email: 'demo.owner@fleetos.com',
    role: 'owner',
    tenant_id: 'demo-tenant-001',
  },
  ops: {
    id: 'demo-ops-001',
    email: 'demo.ops@fleetos.com',
    role: 'ops',
    tenant_id: 'demo-tenant-001',
  },
};

export function createDemoToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      'custom:role': user.role,
      'custom:tenant_id': user.tenant_id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    })
  );
  return `${header}.${payload}.demo_signature`;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('fleetos_token');
    if (token) {
      // Decode JWT to get user info (in production, validate with Cognito)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          role: payload['custom:role'] || 'ops',
          tenant_id: payload['custom:tenant_id'],
        });
      } catch {
        localStorage.removeItem('fleetos_token');
      }
    }
    setLoading(false);
  }, []);

  const loginAsDemo = (role: 'owner' | 'ops' = 'owner') => {
    const demoUser = DEMO_USERS[role];
    const token = createDemoToken(demoUser);
    localStorage.setItem('fleetos_token', token);
    setUser(demoUser);
    router.push(role === 'ops' ? '/today' : '/home');
  };

  const login = async (email: string, password: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = apiUrl ? `${apiUrl}/v1/auth/login` : '/api/auth/login';

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Login failed');
    }

    const body = await res.json().catch(() => null);
    if (!body?.token) throw new Error('Invalid server response');
    const { token, user: userData } = body;
    localStorage.setItem('fleetos_token', token);
    setUser(userData);

    // Redirect straight to the right dashboard: ops gets the operations view,
    // owners/admins get the owner home. The landing page is for signed-out visitors.
    router.push(userData.role === 'ops' ? '/today' : '/home');
  };

  const register = async (email: string, password: string, tenantName: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = apiUrl ? `${apiUrl}/v1/auth/register` : '/api/auth/register';

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, tenant_name: tenantName }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Registration failed');
    }

    const body = await res.json().catch(() => null);
    if (!body?.token) throw new Error('Invalid server response');
    const { token, user: userData } = body;
    localStorage.setItem('fleetos_token', token);
    setUser(userData);
    router.push(userData.role === 'ops' ? '/today' : '/home');
  };

  const acceptInvite = async (token: string, password: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = apiUrl ? `${apiUrl}/v1/auth/accept-invite` : '/api/auth/accept-invite';

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Could not accept the invite');
    }

    const body = await res.json().catch(() => null);
    if (!body?.token) throw new Error('Invalid server response');
    const { token: sessionToken, user: userData } = body;
    localStorage.setItem('fleetos_token', sessionToken);
    setUser(userData);
    router.push(userData.role === 'ops' ? '/today' : '/home');
  };

  const logout = () => {
    localStorage.removeItem('fleetos_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsDemo, register, acceptInvite, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
