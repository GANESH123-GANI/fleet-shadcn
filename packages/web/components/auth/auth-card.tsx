'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { TERMS_CONSENT_VERSION } from '@/lib/site-info';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PasswordInput } from '@/components/password-input';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface AuthCardProps {
  initialTab?: 'login' | 'signup';
}

export function AuthCard({ initialTab = 'login' }: AuthCardProps) {
  const router = useRouter();
  const { login, loginAsDemo, register } = useAuth();

  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (nextTab: string) => {
    const t = nextTab as 'login' | 'signup';
    setTab(t);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'signup') {
        if (!consentGiven) {
          setError('Please agree to the Terms and Conditions and Privacy Policy to continue.');
          setLoading(false);
          return;
        }
        await register(email, password, tenantName);
        window.localStorage.setItem(
          'fleetos_terms_consent',
          JSON.stringify({ version: TERMS_CONSENT_VERSION, acceptedAt: new Date().toISOString() }),
        );
        return;
      }

      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20 text-white">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
            <circle cx="17" cy="18" r="2" />
            <circle cx="7" cy="18" r="2" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">FleetOS</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cloud-connected fleet operations & asset management
          </p>
        </div>
      </div>

      {/* Main shadcn Card */}
      <Card className="border-slate-200/90 bg-white/95 shadow-xl shadow-slate-300/40 backdrop-blur-sm rounded-2xl">
        <CardHeader className="space-y-4 pb-4">
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1">
            <CardTitle className="text-xl">
              {tab === 'login' ? 'Welcome back' : 'Create an account'}
            </CardTitle>
            <CardDescription>
              {tab === 'login'
                ? 'Sign in to access your dashboard and fleet assets'
                : 'Create your company workspace in less than a minute'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="tenant-name" className="text-xs font-medium">
                  Company Name
                </Label>
                <Input
                  id="tenant-name"
                  name="company"
                  type="text"
                  placeholder="Acme Construction & Rentals"
                  required
                  autoComplete="organization"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="h-10"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">
                  Password
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  At least 8 characters
                </span>
              </div>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Enter password"
                required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputClassName="h-10 pr-9"
              />
            </div>

            {tab === 'signup' && (
              <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="signup-consent"
                    name="signup-consent"
                    required
                    checked={consentGiven}
                    onCheckedChange={(checked) => setConsentGiven(!!checked)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="signup-consent"
                    className="text-xs leading-relaxed text-muted-foreground font-normal cursor-pointer"
                  >
                    I agree to the{' '}
                    <Link
                      href="/legal/terms"
                      className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/legal/privacy"
                      className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    , and have read the{' '}
                    <Link
                      href="/legal/cookies"
                      className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                    >
                      Cookie Policy
                    </Link>
                    .
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground/80 pl-6.5">
                  We only ask for your company name, work email and a password.
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? tab === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : tab === 'login'
                ? 'Sign In'
                : 'Get Started'}
            </Button>
          </form>

          {/* Quick Demo Bypass */}
          <div className="pt-2 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium tracking-wider">
                  Quick Access
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                  Demo Account Bypass
                </span>
                <Badge variant="secondary" className="text-[10px] font-semibold tracking-wide">
                  One-Click
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Instantly test the application with pre-configured mock credentials:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loginAsDemo('owner')}
                  className="h-8 text-xs font-medium border-border/80 hover:bg-muted"
                >
                  Demo Owner
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loginAsDemo('ops')}
                  className="h-8 text-xs font-medium border-border/80 hover:bg-muted"
                >
                  Demo Operator
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 justify-center">
          <p className="text-center text-xs text-muted-foreground">
            {tab === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    router.push('/register');
                  }}
                  className="font-medium text-primary hover:underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    router.push('/login');
                  }}
                  className="font-medium text-primary hover:underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </CardFooter>
      </Card>

      {/* Footer details */}
      <div className="text-center text-[11px] text-muted-foreground space-y-1">
        <p>© 2026 FleetOS · Enterprise Operations</p>
      </div>
    </div>
  );
}
