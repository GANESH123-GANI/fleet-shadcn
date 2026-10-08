'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Layers,
  Video,
  MapPin,
  Fuel,
  FileText,
  BarChart3,
  Shield,
  Activity,
  ChevronDown,
  ArrowRight,
  Play,
  CheckCircle2,
  Building2,
  Sparkles,
  Globe,
  Users,
  Phone,
  Mail,
  Award,
  Terminal,
  ExternalLink,
  Menu,
  X,
  Gauge,
  Cpu,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { BUSINESS, LEGAL_LINKS } from '@/lib/site-info';

/* =========================================================================
   NAVIGATION DATA (Dropdowns)
   ========================================================================= */
const NAV_ITEMS = [
  {
    label: 'PRODUCTS',
    items: [
      {
        title: 'Transport Management (TMS)',
        desc: 'Plan, dispatch, and settle freight end to end',
        icon: Truck,
        href: '#products',
      },
      {
        title: 'Video & Camera AI',
        desc: 'Risk detection, ADAS & driver safety alerts',
        icon: Video,
        href: '#products',
      },
      {
        title: 'Fleet Visibility & Telematics',
        desc: 'Real-time GPS, routes, speeds and machine telemetry',
        icon: MapPin,
        href: '#products',
      },
      {
        title: 'Fuel Monitoring',
        desc: 'Ultrasonic fuel sensors & real-time drain detection',
        icon: Fuel,
        href: '#products',
      },
      {
        title: 'Transport ERP',
        desc: 'Billing, billing reconciliation, ledger & maintenance',
        icon: FileText,
        href: '#products',
      },
    ],
  },
  {
    label: 'INDUSTRIES',
    items: [
      {
        title: 'Construction & Mining',
        desc: 'Heavy machinery, excavators, mixers & site telematics',
        icon: Building2,
        href: '#industries',
      },
      {
        title: 'Cement & Raw Materials',
        desc: 'High-payload tippers, quarry routes & dispatch',
        icon: Layers,
        href: '#industries',
      },
      {
        title: 'FMCG & Primary Freight',
        desc: 'On-time delivery tracking & temperature control',
        icon: Compass,
        href: '#industries',
      },
      {
        title: 'Steel & Metals',
        desc: 'Tonnage verification, pilferage reduction & routing',
        icon: Shield,
        href: '#industries',
      },
      {
        title: 'Bus & Passenger Transit',
        desc: 'Driver coaching, scheduled routes & safety cameras',
        icon: Users,
        href: '#industries',
      },
    ],
  },
  {
    label: 'RESOURCES',
    items: [
      {
        title: 'Customer Testimonials',
        desc: 'How FlixBus, ArcelorMittal & DP World scale with FleetOS',
        icon: Award,
        href: '#testimonials',
      },
      {
        title: 'Intelligence Platform',
        desc: 'Autonomous onboarding, live reports & truckable routing',
        icon: Cpu,
        href: '#platform',
      },
      {
        title: 'Global Supply Chain',
        desc: 'Scale benchmarks: 515K+ assets & 1B data points',
        icon: Globe,
        href: '#scale',
      },
      {
        title: 'Compliance & Security',
        desc: 'ISO 27001, SOC 2 Type II, Postgres row-level isolation',
        icon: Shield,
        href: '#certifications',
      },
    ],
  },
  {
    label: 'COMPANY',
    items: [
      {
        title: 'About FleetOS',
        desc: 'Our mission to bring intelligence to physical operations',
        icon: Activity,
        href: '#footer',
      },
      {
        title: 'Enterprise Support',
        desc: 'Dedicated account managers & 24/7 technical operations',
        icon: Phone,
        href: '#footer',
      },
      {
        title: 'Contact Sales',
        desc: 'sales@fleetos.ai · +91-9266683313',
        icon: Mail,
        href: '#footer',
      },
    ],
  },
];

/* =========================================================================
   PRODUCTS DATA
   ========================================================================= */
const PRODUCTS = [
  {
    id: 'tms',
    title: 'Transport Management System',
    desc: 'Plan, dispatch, and settle freight end to end with zero manual spreadsheets.',
    icon: Truck,
    badge: 'Logistics Core',
    iconBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  {
    id: 'video',
    title: 'Video & Camera',
    desc: 'Risk detection and driver hazard prediction beyond human visibility.',
    icon: Video,
    badge: 'AI Dashcam',
    iconBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  },
  {
    id: 'visibility',
    title: 'Fleet Visibility',
    desc: 'Track every vehicle, every machine hour, and every site in real time.',
    icon: MapPin,
    badge: 'Live Telematics',
    iconBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  },
  {
    id: 'fuel',
    title: 'Fuel Monitoring',
    desc: 'Catch uncalibrated fuel drain and pilferage before it hurts operating margins.',
    icon: Fuel,
    badge: 'Theft Guard',
    iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    id: 'erp',
    title: 'Transport ERP',
    desc: 'Run your billing, client invoices, ledger, and machine maintenance in one place.',
    icon: FileText,
    badge: 'Unified Ledger',
    iconBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  },
];

/* =========================================================================
   ENTERPRISE STATS
   ========================================================================= */
const ENTERPRISE_METRICS = [
  { value: '515K+', label: 'ASSETS MANAGED' },
  { value: '1B+', label: 'DATA POINTS / DAY' },
  { value: '10M+', label: 'AI PREDICTIONS DAILY' },
  { value: '70%', label: 'OPERATIONS AUTOMATED' },
  { value: '18%', label: 'COST REDUCTION' },
];

/* =========================================================================
   CLIENT LOGOS
   ========================================================================= */
const CLIENT_LOGOS = [
  'DP WORLD',
  'Panasonic',
  'Unilever',
  'Nestlé',
  'SUZUKI',
  'UltraTech',
  'Mondelēz',
  'MAERSK',
  'adani',
  'TATA',
  'Bisleri',
  'RAMCO',
];

/* =========================================================================
   INDUSTRY VERTICALS
   ========================================================================= */
const INDUSTRIES = [
  {
    id: 'construction',
    name: 'Construction',
    tagline: 'Optimize site logistics and reduce project delays',
    bullets: [
      {
        title: 'Multi-Site Material Coordination',
        desc: 'Auto-route deliveries across multiple construction sites based on material urgency and site readiness.',
      },
      {
        title: 'Heavy Equipment & Vehicle Tracking',
        desc: 'GPS-enabled real-time tracking of concrete mixers, dump trucks, cranes, and construction machinery.',
      },
      {
        title: 'Subcontractor & Vendor Fleet Coordination',
        desc: 'Streamline third-party hauler management with digital proof of delivery (POD) and automated vendor compliance documentation.',
      },
    ],
    assetName: 'CAT 320D Excavator #EX-01',
    metric1: '98.4% On-time dispatch',
    metric2: '-34% Fuel idling losses',
  },
  {
    id: 'cement',
    name: 'Cement & Mining',
    tagline: 'High-payload raw material dispatch and pit-to-plant control',
    bullets: [
      {
        title: 'Overload & Tare Weight Protection',
        desc: 'Bridge weighscale telemetry with automatic gross vs tare load auditing.',
      },
      {
        title: 'Unattended Offloading Detection',
        desc: 'Automated geofencing alert whenever a tipper discharges outside authorized pit dumping zones.',
      },
      {
        title: 'Tyre Temperature & Pressure Telemetry',
        desc: 'Live TPMS tracking under extreme open-cast mine operational heat.',
      },
    ],
    assetName: 'Scania P410 Tipper #MN-18',
    metric1: '4.2x Faster turnarounds',
    metric2: 'Zero unauthorized dumps',
  },
  {
    id: 'fmcg',
    name: 'FMCG & Logistics',
    tagline: 'Primary and secondary cold-chain distribution with SLA predictability',
    bullets: [
      {
        title: 'Live Temperature Reefer Telematics',
        desc: 'Multi-zone temperature sensors trigger immediate control tower alarms if thresholds breach.',
      },
      {
        title: 'Store Delivery Turnaround Time',
        desc: 'Dwell-time analytics across regional fulfillment warehouses and distribution hubs.',
      },
      {
        title: 'Automated Electronic Invoicing & GRN',
        desc: 'Instant Goods Receipt Note confirmation tied into corporate SAP / Oracle ERP systems.',
      },
    ],
    assetName: 'Eicher Pro 3019 Reefer #DL-04',
    metric1: '99.8% Cold-chain integrity',
    metric2: '-28% Order delivery delays',
  },
  {
    id: 'steel',
    name: 'Steel & Metals',
    tagline: 'Heavy freight route integrity and high-value cargo security',
    bullets: [
      {
        title: 'Route Deviation & Corridor Enforcement',
        desc: 'Alert control towers within 60 seconds if a hauler exits approved industrial corridors.',
      },
      {
        title: 'Coil & Billet Weight Verification',
        desc: 'Dispute elimination between loading mills and receiver fabrication plants.',
      },
      {
        title: 'Driver Fatigue and Continuous Driving Alerts',
        desc: 'Mandatory 4-hour rest validation with driver-facing AI cameras.',
      },
    ],
    assetName: 'Tata Prima 5530.S Trailer #ST-09',
    metric1: '100% Corridor adherence',
    metric2: 'Zero cargo pilferage',
  },
  {
    id: 'transit',
    name: 'Bus & Transit',
    tagline: 'Commuter safety, automated scheduling and driver behavior scoring',
    bullets: [
      {
        title: 'Dual-Facing AI Dashcams',
        desc: 'In-cabin distraction and road-facing collision hazard prediction.',
      },
      {
        title: 'Timetable Adherence & ETA Broadcast',
        desc: 'Live passenger ETA feeds with route schedule compliance alerts.',
      },
      {
        title: 'Harsh Braking & Cornering Scorecard',
        desc: 'Objective driver performance scorecards that decrease passenger incidents.',
      },
    ],
    assetName: 'Volvo B11R Multi-Axle #BX-22',
    metric1: '90% Issue resolution rate',
    metric2: '-42% Overspeeding events',
  },
];

/* =========================================================================
   CASE STUDIES & TESTIMONIALS
   ========================================================================= */
const TESTIMONIALS = [
  {
    company: 'FlixBus India',
    badge: 'BUS & TRANSIT',
    title: 'How FlixBus India deployed AI-powered dashcams across 290+ buses with FleetOS',
    desc: "Within 6 months of deployment, FleetOS's AI dashcams gave real-time visibility on driver behavior across all routes.",
    statValue: '90%',
    statLabel: 'Issue Resolution Rate',
  },
  {
    company: 'Multi-Billion Dollar Steel Enterprise',
    badge: 'MANUFACTURING',
    title: 'Achieved 98% Delivery Confirmation and Eliminated Disputes',
    desc: 'Automated digital POD, electronic weighment and corridor geofences streamlined 12,000 monthly inter-state consignments.',
    statValue: '98%',
    statLabel: 'Delivery Confirmation',
  },
  {
    company: 'Global FMCG Giant',
    badge: 'FMCG & COLD CHAIN',
    title: 'Building a Proactive Fleet Safety Control Tower for a Global FMCG Giant',
    desc: 'Real-time incident response and dynamic route risk scoring reduced accident occurrence across national supply routes.',
    statValue: '90%',
    statLabel: 'Issue Resolution Rate',
  },
  {
    company: 'ArcelorMittal Nippon Steel India',
    badge: 'METALS & MINING',
    title: 'Cuts Route Deviation from 10% to Under 2% with Smarter Logistics',
    desc: 'Geofenced corridors and driver alerts prevented unscheduled stoppages and lowered freight insurance premiums.',
    statValue: '30%',
    statLabel: 'Reduction in Overspeeding',
  },
];

/* =========================================================================
   MAIN LANDING PAGE (Pure Light Theme + shadcn UI Components)
   ========================================================================= */
export function LandingPage() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState(INDUSTRIES[0].id);
  const [activeAgentTab, setActiveAgentTab] = useState<'agents' | 'tms' | 'erp'>('agents');
  const [selectedAgent, setSelectedAgent] = useState('onboarding');

  // Demo form states
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoCompany, setDemoCompany] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const currentIndustry =
    INDUSTRIES.find((i) => i.id === activeIndustry) ?? INDUSTRIES[0];

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoSubmitted(false);
      setDemoModalOpen(false);
    }, 2000);
  };

  return (
    <div style={{ colorScheme: 'light' }} className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20 selection:text-teal-900 pt-3 sm:pt-5">
      {/* =====================================================================
          FLOATING PILL NAVBAR (shadcn UI Light Style)
          ===================================================================== */}
      <header className="sticky top-5 z-50 mx-auto max-w-6xl px-3 sm:px-6 mb-8 sm:mb-14">
        <nav
          aria-label="Main Navigation"
          className="relative flex items-center justify-between rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-sm backdrop-blur-xl"
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 pl-1.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-teal-400 shadow-sm">
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18H9" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                <circle cx="17" cy="18" r="2" />
                <circle cx="7" cy="18" r="2" />
                {/* 3 cyan telemetry equalizer bars */}
                <path d="M10 9v5" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
                <path d="M7 11v3" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 7v7" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-baseline">
              <span className="text-lg font-black tracking-tight text-slate-900">
                Fleet<span className="text-teal-600">OS</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items with Dropdowns */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_ITEMS.map((menu) => (
              <div
                key={menu.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(menu.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveDropdown(activeDropdown === menu.label ? null : menu.label)
                  }
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold tracking-wider text-slate-700 hover:text-slate-950 transition-colors"
                >
                  <span>{menu.label}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      activeDropdown === menu.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Card */}
                {activeDropdown === menu.label && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2 w-80 animate-in fade-in-0 zoom-in-95 duration-150">
                    <Card className="rounded-2xl border-slate-200 bg-white p-2.5 shadow-xl backdrop-blur-2xl py-2.5">
                      <div className="space-y-1">
                        {menu.items.map((subItem) => {
                          const Icon = subItem.icon;
                          return (
                            <a
                              key={subItem.title}
                              href={subItem.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-100 group"
                            >
                              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 group-hover:scale-105 transition-transform">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 group-hover:text-teal-700">
                                  {subItem.title}
                                </p>
                                <p className="text-[11px] text-slate-500 line-clamp-1">
                                  {subItem.desc}
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
            >
              Log In
            </Link>

            <Button
              asChild
              size="sm"
              className="rounded-full bg-slate-900 text-white hover:bg-black hover:text-white transition-all duration-200 px-4 py-2 text-xs font-bold shadow-sm hover:shadow-md cursor-pointer"
            >
              <Link href="/register">Create account</Link>
            </Button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-1 p-1 text-slate-700 lg:hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown sheet */}
        {mobileMenuOpen && (
          <Card className="mt-2 rounded-2xl border-slate-200 bg-white p-4 shadow-xl lg:hidden text-slate-900 animate-in slide-in-from-top-2">
            <div className="space-y-4">
              {NAV_ITEMS.map((section) => (
                <div key={section.label} className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                    {section.label}
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {section.items.map((i) => (
                      <a
                        key={i.title}
                        href={i.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-1 text-xs font-medium text-slate-700 hover:text-teal-700"
                      >
                        {i.title}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-900"
                >
                  Log In
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-black transition-colors"
                >
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Create account
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </header>

      {/* =====================================================================
          HERO SECTION (Light Theme + shadcn UI)
          ===================================================================== */}
      <section className="relative pt-4 sm:pt-8 pb-20 overflow-hidden">
        {/* Subtle Light Mesh Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-teal-50/60 via-indigo-50/30 to-transparent pointer-events-none rounded-b-[40px]" />

        <div className="relative mx-auto max-w-5xl px-4 text-center">
          {/* Eyebrow Pill */}
          <Badge
            variant="outline"
            className="border-teal-200 bg-teal-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-teal-800 shadow-xs mb-6 rounded-full"
          >
            <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse mr-2" />
            INTELLIGENCE BY FLEETOS
          </Badge>

          {/* Main H1 Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
            The Intelligence Layer For The <br />
            <span className="bg-gradient-to-r from-teal-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
              Physical Operations
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From fleets to supply chains, FleetOS helps organizations operate with
            greater efficiency, reliability, and control.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Button
              size="lg"
              onClick={() => setDemoModalOpen(true)}
              className="rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold px-7 shadow-lg shadow-slate-900/10 cursor-pointer"
            >
              <span>REQUEST A DEMO</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setVideoModalOpen(true)}
              className="rounded-full border-slate-300 bg-white hover:bg-slate-100 text-slate-900 font-semibold px-6 shadow-xs cursor-pointer"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-700 mr-2">
                <Play className="h-3 w-3 fill-current ml-0.5" />
              </div>
              <span>WATCH PRODUCT DEMO</span>
            </Button>
          </div>

          {/* Social Proof Marquee / Logo Bar */}
          <div className="mt-20 pt-10 border-t border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-8">
              Trusted by Fortune 500 Fleet &amp; Logistics Leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-12 opacity-80">
              {CLIENT_LOGOS.map((client) => (
                <span
                  key={client}
                  className="text-xs sm:text-sm font-bold tracking-wider text-slate-600 hover:text-slate-950 transition-colors"
                >
                  {client}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FIVE PRODUCTS. ONE AI ENGINE (shadcn UI Cards)
          ===================================================================== */}
      <section id="products" className="py-24 bg-white relative border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
              Five products. One AI Engine
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600">
              An end-to-end intelligence stack for fleet &amp; logistics. Built natively on AI &amp; IoT,
              purpose-built for the global logistics ecosystem.
            </p>
          </div>

          {/* 5 Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PRODUCTS.map((prod) => {
              const Icon = prod.icon;
              return (
                <Card
                  key={prod.id}
                  className="group flex flex-col justify-between rounded-[20px] border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-400 hover:shadow-lg hover:-translate-y-1"
                >
                  <CardHeader className="p-0 space-y-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${prod.iconBg} shadow-xs`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] text-slate-700 font-semibold">
                        {prod.badge}
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-bold text-slate-950 group-hover:text-teal-700 transition-colors">
                      {prod.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {prod.desc}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="p-0 mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700 group-hover:text-teal-800">
                    <span>Explore</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          ENTERPRISE METRICS BANNER
          ===================================================================== */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 text-center">
            {ENTERPRISE_METRICS.map((metric) => (
              <div key={metric.label} className="p-2">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          THE INTELLIGENCE PLATFORM (shadcn UI Layout)
          ===================================================================== */}
      <section id="platform" className="py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="border-teal-300 bg-teal-50 text-teal-800 text-xs mb-3">
              Platform-Wide Automation
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
              The Intelligence Platform Powering Your Entire Freight Operation
            </h2>
          </div>

          {/* Platform Console Layout */}
          <Card className="rounded-[24px] border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            {/* Top Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'agents', label: 'Platform-Wide Agents' },
                  { id: 'tms', label: 'Transport Management System' },
                  { id: 'erp', label: 'Transport ERP' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveAgentTab(t.id as typeof activeAgentTab)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeAgentTab === t.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-ping" />
                <span>AI Agents Engine Live</span>
              </div>
            </div>

            {/* Split Console Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
              {/* Left Agent Selector */}
              <div className="lg:col-span-4 space-y-2">
                {[
                  {
                    id: 'onboarding',
                    title: 'Onboarding Agent →',
                    desc: 'AI onboarding process, customize widgets for your setup flow',
                  },
                  {
                    id: 'reports',
                    title: 'Reports Agent →',
                    desc: 'Automated fuel reconciliation, driver hours and machine utilization',
                  },
                  {
                    id: 'insights',
                    title: 'AI Insights →',
                    desc: 'Anomaly detection across route deviations and unscheduled idle events',
                  },
                  {
                    id: 'routes',
                    title: 'Truckable Routes →',
                    desc: 'Safe heavy vehicle routing with height clearance and weight load checks',
                  },
                ].map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      selectedAgent === agent.id
                        ? 'border-teal-500 bg-teal-50/60 text-slate-950 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-950">{agent.title}</p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-normal">{agent.desc}</p>
                  </button>
                ))}
              </div>

              {/* Right Interactive Dashboard Simulation */}
              <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 font-mono text-slate-100 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Terminal className="h-4 w-4 text-teal-400" />
                    <span>Master Setup Console · FleetOS Engine</span>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 text-[10px]">
                    25% Complete · Auto-Syncing
                  </Badge>
                </div>

                {/* Simulated Telemetry widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-900">
                    <p className="text-[10px] text-slate-400 uppercase">Active Agent Status</p>
                    <p className="text-sm font-bold text-white mt-1 capitalize">
                      {selectedAgent} Agent Active
                    </p>
                    <p className="text-[11px] text-teal-400 mt-2">
                      ✔ 4,120 nodes connected across 8 hubs
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-900">
                    <p className="text-[10px] text-slate-400 uppercase">Telemetry Ingestion</p>
                    <p className="text-sm font-bold text-white mt-1">1,248 packets/sec</p>
                    <p className="text-[11px] text-indigo-400 mt-2">
                      Latency: 42ms · Zero packet drop
                    </p>
                  </div>
                </div>

                {/* Simulated Live Console Log */}
                <div className="rounded-xl bg-black p-3 text-[11px] text-slate-300 space-y-1">
                  <p className="text-emerald-400">[08:42:01] Autonomous dispatch optimization initialized.</p>
                  <p className="text-slate-400">[08:42:03] Geofence verified: Nhava Sheva Terminal Yard B.</p>
                  <p className="text-teal-300">[08:42:05] Fuel sensor calibration synced: Tank delta &lt; 0.05%.</p>
                  <p className="text-purple-300">[08:42:09] AI dashcam event cleared: Safe lane centering confirmed.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* =====================================================================
          CUSTOMER TESTIMONIALS & CASE STUDIES
          ===================================================================== */}
      <section id="testimonials" className="py-24 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Proven ROI</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-1">
                Customer Testimonials &amp; Case Studies
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="mt-4 sm:mt-0 text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all 40+ case studies</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t) => (
              <Card
                key={t.title}
                className="rounded-[20px] border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-slate-400 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-800 text-[10px]">
                      {t.badge}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 leading-snug">{t.title}</h3>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">{t.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-2xl font-black text-teal-700">{t.statValue}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{t.statLabel}</p>
                  <p className="mt-3 text-xs font-bold text-slate-800 hover:text-teal-700 inline-flex items-center gap-1 cursor-pointer">
                    <span>Read Case Study</span>
                    <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          TRUSTED ACROSS INDUSTRIES
          ===================================================================== */}
      <section id="industries" className="py-24 relative bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
              Trusted by the Largest Enterprise Leaders Across Industries
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600">
              To increase efficiency, productivity and safety across fleet &amp; transport operations
            </p>
          </div>

          {/* Industry Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                type="button"
                onClick={() => setActiveIndustry(ind.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeIndustry === ind.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {ind.name}
              </button>
            ))}
          </div>

          {/* Active Industry Showcase Card */}
          <Card className="rounded-[24px] border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Features */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-800 text-xs uppercase mb-2">
                    {currentIndustry.name}
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                    {currentIndustry.tagline}
                  </h3>
                </div>

                <div className="space-y-4">
                  {currentIndustry.bullets.map((b) => (
                    <div key={b.title} className="flex items-start gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-950">{b.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    size="default"
                    onClick={() => setDemoModalOpen(true)}
                    className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer px-5"
                  >
                    <span>Schedule an Industry Walkthrough</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>

              {/* Right Column: Asset Telematics Visual */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-950">{currentIndustry.assetName}</p>
                      <p className="text-[10px] text-teal-700 flex items-center gap-1.5 mt-0.5 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
                        Live GPS &amp; Telemetry Connected
                      </p>
                    </div>
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px]">
                      Operational
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Impact Stat 1</p>
                      <p className="text-sm font-bold text-emerald-700 mt-1">
                        {currentIndustry.metric1}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Impact Stat 2</p>
                      <p className="text-sm font-bold text-teal-700 mt-1">
                        {currentIndustry.metric2}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-900 text-slate-200 p-3 text-[11px] font-mono space-y-1">
                    <p>Speed: 0 km/h (Working in geofence)</p>
                    <p>Engine Hours: 4,812.5 hrs</p>
                    <p>Fuel Level: 84% · Zero drain detected</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* =====================================================================
          CONNECTING THE GLOBAL SUPPLY CHAIN
          ===================================================================== */}
      <section id="scale" className="py-24 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
              Connecting The Global Supply Chain
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              One intelligence layer that connects your entire freight operation
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { val: '5L+', label: 'Vehicles Tracked' },
              { val: '200M', label: 'KMs Tracked Daily' },
              { val: '35M', label: 'Ltrs Fuel Theft Prevented' },
              { val: '90%', label: 'Reduction in Accidents' },
              { val: '10+', label: 'Countries Operating' },
              { val: '4.5+', label: 'Mobile App Rating' },
              { val: '1B+', label: 'Data Points Processed Daily' },
              { val: '99.95%', label: 'Availability SLA Uptime' },
            ].map((s) => (
              <Card key={s.label} className="rounded-[20px] border-slate-200 bg-white p-5 shadow-xs">
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-950">{s.val}</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Industry Certifications */}
          <div id="certifications" className="mt-20 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
              Recognised as an industry leader &amp; ISO / SOC2 Certified
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              {['ISO 27001', 'ISO 9001', 'AICPA SOC 2 Type II', 'G2 High Performer 2026', 'G2 Easiest Setup'].map(
                (badge) => (
                  <Badge
                    key={badge}
                    variant="outline"
                    className="border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-xs"
                  >
                    <Shield className="h-3.5 w-3.5 text-teal-700 mr-1.5" />
                    <span>{badge}</span>
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          CTA BANNER (Ready to move with FleetOS?)
          ===================================================================== */}
      <section className="py-20 relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-[28px] border border-zinc-800 bg-[#121316] text-white p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Ready to move with FleetOS?
            </h2>
            <p className="mt-4 text-base text-zinc-400 max-w-xl mx-auto">
              Join India&apos;s most forward-thinking fleet and logistics operators.
            </p>
            <div className="mt-8 flex items-center justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-zinc-950 hover:bg-zinc-200 px-8 py-3 text-sm font-bold shadow-lg shadow-black/30 transition-all cursor-pointer"
              >
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FOOTER (Clean Light Style)
          ===================================================================== */}
      <footer id="footer" className="border-t border-slate-200 bg-white pt-16 pb-12 text-xs text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
            {/* Col 1: Brand & Contact */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-teal-400">
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-lg font-black text-slate-950">Fleet<span className="text-teal-600">OS</span></span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                Enterprise telemetry, transport management, dashcam AI, and unified asset tracking
                built natively for physical supply chain operations.
              </p>
              <div className="space-y-1.5 pt-2 text-slate-700">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-teal-700" />
                  <span>sales@fleetos.ai</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-teal-700" />
                  <span>+91-9266683313</span>
                </p>
                <p className="flex items-start gap-2 pt-1 text-[11px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-teal-700 shrink-0 mt-0.5" />
                  <span>320, 3rd Floor, Tower A, Vatika Business Park, Sector 49, Gurugram, Haryana 122018</span>
                </p>
              </div>
            </div>

            {/* Col 2: Products */}
            <div className="space-y-2.5">
              <p className="font-bold uppercase tracking-wider text-slate-950">Products</p>
              <ul className="space-y-2">
                <li><a href="#products" className="hover:text-slate-950">Transport Management (TMS)</a></li>
                <li><a href="#products" className="hover:text-slate-950">Transport ERP</a></li>
                <li><a href="#products" className="hover:text-slate-950">Fuel Monitoring</a></li>
                <li><a href="#products" className="hover:text-slate-950">Video Telematics</a></li>
                <li><a href="#products" className="hover:text-slate-950">Fleet Visibility (FMS)</a></li>
              </ul>
            </div>

            {/* Col 3: Company */}
            <div className="space-y-2.5">
              <p className="font-bold uppercase tracking-wider text-slate-950">Company</p>
              <ul className="space-y-2">
                <li><a href="#hero" className="hover:text-slate-950">About Us</a></li>
                <li><button type="button" onClick={() => setDemoModalOpen(true)} className="hover:text-slate-950">Contact Us</button></li>
                <li><Link href="/login" className="hover:text-slate-950">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-slate-950">Get Started</Link></li>
                <li><Link href="/legal/terms" className="hover:text-slate-950">Terms &amp; Conditions</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-slate-950">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Col 4: Quick Sign-in */}
            <div className="space-y-2.5">
              <p className="font-bold uppercase tracking-wider text-slate-950">Access</p>
              <p className="text-[11px] text-slate-500">
                Are you an existing customer or operator?
              </p>
              <div className="pt-1 flex flex-col gap-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold">
                  <Link href="/login">Operator Login</Link>
                </Button>
                <Button asChild size="sm" className="w-full text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white">
                  <Link href="/register">Register Workspace</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} FleetOS Technologies Private Limited. All Rights Reserved.</p>
            <div className="flex gap-4">
              <Link href="/legal/terms" className="hover:text-slate-700">Terms of Service</Link>
              <Link href="/legal/privacy" className="hover:text-slate-700">Privacy Policy</Link>
              <Link href="/legal/cookies" className="hover:text-slate-700">Cookie Settings</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          SCHEDULE A DEMO MODAL (shadcn Dialog in Light Theme)
          ===================================================================== */}
      <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-950">
              Schedule an Enterprise Demo
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              See how FleetOS transforms your physical fleet operations with real-time AI and telematics.
            </DialogDescription>
          </DialogHeader>

          {demoSubmitted ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-950">Demo Request Received!</p>
              <p className="text-xs text-slate-500">
                Our fleet engineering team will reach out to you within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleDemoSubmit} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <Label htmlFor="demo-name" className="text-xs font-medium text-slate-700">
                  Your Full Name
                </Label>
                <Input
                  id="demo-name"
                  required
                  placeholder="Satya Khurana"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="demo-email" className="text-xs font-medium text-slate-700">
                  Work Email Address
                </Label>
                <Input
                  id="demo-email"
                  type="email"
                  required
                  placeholder="satya@company.com"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="demo-company" className="text-xs font-medium text-slate-700">
                  Company / Fleet Name
                </Label>
                <Input
                  id="demo-company"
                  required
                  placeholder="Acme Freight Logistics"
                  value={demoCompany}
                  onChange={(e) => setDemoCompany(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 shadow-sm"
              >
                Confirm &amp; Book Demo
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* =====================================================================
          WATCH PRODUCT DEMO MODAL
          ===================================================================== */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="sm:max-w-3xl bg-slate-950 border-slate-800 p-2 sm:p-4 text-white">
          <DialogHeader className="px-2 pt-2">
            <DialogTitle className="text-base font-bold text-white">
              FleetOS Product Preview
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <video
              controls
              autoPlay
              playsInline
              className="h-full w-full object-cover"
              poster="/app-preview-poster.jpg"
            >
              <source src="/app-preview.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default LandingPage;
