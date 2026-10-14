'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Bell, Building2, CircleDollarSign, LayoutDashboard, LifeBuoy, Menu,
  Receipt, Scale, ScrollText, Settings, Tractor, Users, X, BarChart3,
  MapPin, Rocket, LogOut, Truck, PanelLeft, ChevronRight, Star, Moon, Sun, Languages,
  Wrench, Boxes, Search, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchList } from '@/lib/api/fetch-list';
import { useAuth } from '@/lib/auth/context';
import { useTheme } from '@/context/theme-provider';
import { useLocale, type Locale } from '@/components/i18n-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SkipToMain } from '@/components/skip-to-main';
import { CommandMenu } from '@/components/command-menu';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { useSearch } from '@/context/search-provider';

interface NavEntry {
  section?: 'overview' | 'manage' | 'tools';
  href?: string;
  labelKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  badge?: number;
}

const NAV: NavEntry[] = [
  { section: 'overview' },
  { href: '/home', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/machines', labelKey: 'machines', icon: Tractor },
  { href: '/sites', labelKey: 'sites', icon: MapPin },
  { href: '/deployments', labelKey: 'deployments', icon: Rocket },
  { section: 'manage' },
  { href: '/operators', labelKey: 'operators', icon: Users },
  { href: '/clients', labelKey: 'clients', icon: Building2 },
  { href: '/billing', labelKey: 'billing', icon: Receipt },
  { href: '/maintenance', labelKey: 'maintenance', icon: Wrench },
  { href: '/inventory', labelKey: 'inventory', icon: Boxes },
  { href: '/cash', labelKey: 'cash', icon: CircleDollarSign },
  { href: '/projections', labelKey: 'projections', icon: Scale },
  { section: 'tools' },
  { href: '/insights', labelKey: 'insights', icon: BarChart3 },
  { href: '/audit', labelKey: 'audit', icon: ScrollText },
  { href: '/support', labelKey: 'support', icon: LifeBuoy },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === '/home') return pathname === '/home';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getNavLabel(t: (key: string) => string, key?: string): string {
  if (!key) return '';
  if (key === 'maintenance') return 'Maintenance';
  if (key === 'inventory') return 'Inventory';
  try {
    const val = t(key);
    if (!val || val.includes(`sidebar.${key}`)) {
      return key.charAt(0).toUpperCase() + key.slice(1);
    }
    return val;
  } catch {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }
}

function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations('sidebar');
  const { logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA] dark:bg-card border-r border-solid border-slate-200 dark:border-slate-800" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Logo */}
      <div className={cn('flex h-16 items-center px-5', collapsed && 'justify-center px-3')}>
        <Link href="/home" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs">
            <Truck className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Fleet<span className="text-slate-900 dark:text-slate-50">OS</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV.map((entry, i) =>
          entry.section ? (
            <p
              key={`s-${i}`}
              className={cn(
                'px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 first:pt-1',
                collapsed && 'sr-only',
              )}
            >
              {t(entry.section)}
            </p>
          ) : (
            <Link
              key={entry.href}
              href={entry.href!}
              prefetch={true}
              title={getNavLabel(t, entry.labelKey)}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                collapsed && 'justify-center px-2',
                isActive(pathname, entry.href!)
                  ? 'bg-[#E5E7EB] dark:bg-slate-800 text-black dark:text-white font-semibold'
                  : 'text-black dark:text-white hover:bg-slate-200/60',
              )}
            >
              <entry.icon className="h-[18px] w-[18px] shrink-0 text-black dark:text-white" />
              {!collapsed && (
                <span className="flex-1 text-black dark:text-white">
                  {getNavLabel(t, entry.labelKey)}
                </span>
              )}
              {!collapsed && entry.badge && entry.badge > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {entry.badge > 9 ? '9+' : entry.badge}
                </span>
              )}
            </Link>
          ),
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-solid border-slate-200 dark:border-slate-800 p-3">
        {/* User */}
        <div className={cn(
          'flex items-center gap-3 rounded-xl hover:bg-slate-200/60 transition-colors p-2',
          collapsed && 'justify-center',
        )}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold">
            N
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-black dark:text-white">{t('role')}</p>
              <p className="truncate text-xs text-slate-600 dark:text-slate-400">Fleet OS</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} className="rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const LANG_LIST: [Locale, string, string][] = [
  ['en', 'English', 'English'],
  ['hi', 'Hindi', 'हिन्दी'],
  ['kn', 'Kannada', 'ಕನ್ನಡ'],
  ['ta', 'Tamil', 'தமிழ்'],
  ['te', 'Telugu', 'తెలుగు'],
  ['mr', 'Marathi', 'मराठी'],
  ['bn', 'Bengali', 'বাংলা'],
  ['gu', 'Gujarati', 'ગુજરાતી'],
  ['ml', 'Malayalam', 'മലയാളം'],
  ['pa', 'Punjabi', 'ਪੰਜਾਬੀ'],
  ['fr', 'French', 'Français'],
];

export function OwnerShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('sidebar');
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { setOpen } = useSearch();

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  };

  useEffect(() => {
    // Background pre-warm of core module datasets so clicking any navigation item is instant
    const warmList = [
      '/api/v1/machines',
      '/api/v1/sites',
      '/api/v1/deployments',
      '/api/v1/operators',
      '/api/v1/clients',
      '/api/v1/billing/receivables',
    ];
    const timer = setTimeout(() => {
      warmList.forEach((endpoint) => {
        void fetchList(endpoint);
      });
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic clickable breadcrumbs based on route
  const getBreadcrumbs = () => {
    if (pathname === '/home' || pathname === '/') {
      return [{ label: 'Dashboard', href: '/home', isLast: true }];
    }
    const parts = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href: string; isLast: boolean }[] = [
      { label: 'Dashboard', href: '/home', isLast: false },
    ];
    let acc = '';
    parts.forEach((p, idx) => {
      acc += `/${p}`;
      const isLast = idx === parts.length - 1;
      const label = p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ');
      crumbs.push({ label, href: acc, isLast });
    });
    return crumbs;
  };
  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
    <SkipToMain />
    <div className="flex min-h-screen w-full bg-white dark:bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 transition-all duration-normal lg:block bg-[#FAFAFA] dark:bg-card',
          collapsed ? 'w-[72px]' : 'w-[260px]',
        )}
        style={{ backgroundColor: '#FAFAFA' }}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[280px] bg-[#FAFAFA] dark:bg-card shadow-xl animate-slide-in-right" style={{ backgroundColor: '#FAFAFA' }}>
            <button
              aria-label={t('closeMenu')}
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-slate-200/60 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarBody collapsed={false} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-background">
        {/* Topbar matching reference */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-card px-4 sm:px-6">
          {/* Left: Sidebar toggle + vertical line + clickable breadcrumb links */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              aria-label={collapsed ? t('expandSidebar') : t('collapseSidebar')}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setDrawerOpen(true);
                } else {
                  setCollapsed((c) => !c);
                }
              }}
              className="rounded-md p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm truncate">
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.href} className="flex items-center gap-1.5 shrink-0">
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600 shrink-0" />}
                  {crumb.isLast ? (
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>

          {/* Center: Global Quick Search & Command Bar (Freedom to navigate anywhere with ⌘K) */}
          <div className="flex-1 max-w-sm mx-4 hidden md:block">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
              title="Search modules, machines, sites or press ⌘K"
            >
              <span className="flex items-center gap-2 truncate text-slate-500 dark:text-slate-400">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Search modules, machines, sites...</span>
              </span>
              <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Search mobile + Star + Theme Moon/Sun + Languages Dropdown + Avatar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Quick search"
              className="md:hidden rounded-md p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* GitHub Star Pill */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center rounded-md border border-solid border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-none overflow-hidden"
            >
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1">
                <Star className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                <span>Star</span>
              </span>
              <span className="border-l border-solid border-slate-200 dark:border-slate-800 px-2 py-1 bg-slate-50 dark:bg-slate-900 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                121
              </span>
            </a>

            {/* Dark Mode / Theme Switch */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-md p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              <Moon className="h-4 w-4 block dark:hidden" />
              <Sun className="h-4 w-4 hidden dark:block" />
            </button>

            {/* Language Switcher Dropdown (Freedom to customize UI language) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Change language"
                  className="flex items-center gap-1 rounded-md p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Customize Language"
                >
                  <Languages className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {locale}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 max-h-72 overflow-y-auto">
                <DropdownMenuLabel className="text-xs font-semibold text-slate-500">
                  Select Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {LANG_LIST.map(([code, name, native]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => setLocale(code)}
                    className="flex items-center justify-between text-xs cursor-pointer py-1.5"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{native}</span>
                      <span className="text-[10px] text-slate-400">({name})</span>
                    </span>
                    {locale === code && <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown with online badge */}
            <ProfileDropdown />
          </div>
        </header>

        {/* Page content */}
        <main id="content" className="flex-1 overflow-x-hidden bg-white dark:bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    <CommandMenu />
    </SidebarProvider>
  );
}
