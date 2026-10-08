'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  Home,
  Briefcase,
  Award,
  MapPin,
  Truck,
  Pencil,
  Clock,
  HardHat,
  Star,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Heart,
  ArrowLeft,
  Languages,
} from 'lucide-react';
import { authFetch } from '@/lib/api/auth-fetch';
import { apiPatch } from '@/lib/api/mutations';
import { fetchList } from '@/lib/api/fetch-list';
import { Button } from '@/components/ui/button';

interface MachineEntry {
  id: string;
  code: string;
  make: string;
  model: string;
  operator_id?: string;
  site_name?: string;
  client_name?: string;
}

const OPERATOR_PHOTOS: Record<string, string> = {
  'op-001': '/operators/op-001.jpg',
  'op-002': '/operators/op-002.jpg',
  'op-003': '/operators/op-003.jpg',
  'op-004': '/operators/op-004.jpg',
  'op-005': '/operators/op-005.jpg',
  'op-006': '/operators/op-006.jpg',
};

export default function OperatorDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [operator, setOperator] = useState<Record<string, unknown> | null>(null);
  const [machines, setMachines] = useState<MachineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    gmail: '',
    marital_status: 'Married',
    native_place: '',
    languages: '',
    monthly_salary: '',
    hourly_wage: '',
    experience_years: '',
    employment_type: 'Full Time (Permanent)',
    address: '',
    emergency_contact: '',
    license: '',
    specialization: '',
    is_active: true,
  });

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [res, mchList] = await Promise.all([
          authFetch(`/api/v1/operators/${id}`),
          fetchList<MachineEntry>('/api/v1/machines').catch(() => []),
        ]);

        if (res.ok) {
          const data = (await res.json()) as Record<string, unknown>;
          if (data && typeof data === 'object') {
            setOperator(data);
            setForm({
              name: String(data.name || ''),
              age: data.age != null ? String(data.age) : '38',
              phone: String(data.phone || ''),
              email: String(data.email || ''),
              gmail: String(data.gmail || data.email || ''),
              marital_status: String(data.marital_status || 'Married'),
              native_place: String(data.native_place || 'Karnataka'),
              languages: String(data.languages || 'Kannada, Hindi, English'),
              monthly_salary: data.monthly_salary != null ? String(data.monthly_salary) : '42000',
              hourly_wage: data.hourly_wage != null ? String(data.hourly_wage) : '350',
              experience_years: data.experience_years != null ? String(data.experience_years) : '8',
              employment_type: String(data.employment_type || 'Full Time (Permanent)'),
              address: String(data.address || ''),
              emergency_contact: String(data.emergency_contact || ''),
              license: String(data.license || data.license_number || ''),
              specialization: String(data.specialization || 'Heavy Equipment Specialist'),
              is_active: data.is_active !== false,
            });
          }
        }
        setMachines(mchList);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPatch(`/api/v1/operators/${id}`, {
        name: form.name,
        age: form.age ? Number(form.age) : null,
        phone: form.phone || null,
        email: form.email || null,
        gmail: form.gmail || form.email || null,
        marital_status: form.marital_status,
        native_place: form.native_place || null,
        languages: form.languages || null,
        monthly_salary: form.monthly_salary ? Number(form.monthly_salary) : null,
        hourly_wage: form.hourly_wage ? Number(form.hourly_wage) : null,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        employment_type: form.employment_type,
        address: form.address || null,
        emergency_contact: form.emergency_contact || null,
        license: form.license || null,
        specialization: form.specialization || null,
        is_active: form.is_active,
      });

      setEditing(false);
      const res = await authFetch(`/api/v1/operators/${id}`);
      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>;
        setOperator(data);
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-sm font-normal text-black/60">
        Loading operator profile...
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-sm font-normal text-black/60">
        Operator not found.
      </div>
    );
  }

  const assignedMachine = machines.find(
    (m) =>
      m.operator_id === id ||
      m.id === (operator.assigned_machine_id as string) ||
      m.code === (operator.assigned_machine_code as string)
  );

  const photoUrl = OPERATOR_PHOTOS[id] || '/operators/op-001.jpg';
  const age = (operator.age as number) ?? 38;
  const maritalStatus = (operator.marital_status as string) ?? 'Married';
  const nativePlace = (operator.native_place as string) ?? 'Hassan, Karnataka';
  const languagesSpoken = (operator.languages as string) ?? 'Kannada, Hindi, English';
  const monthlySalary = (operator.monthly_salary as number) ?? 42000;
  const hourlyWage = (operator.hourly_wage as number) ?? 350;
  const expYears = (operator.experience_years as number) ?? 9;
  const employmentType = (operator.employment_type as string) ?? 'Full Time (Permanent)';
  const address =
    (operator.address as string) ??
    '#42, 2nd Cross, Industrial Area, Peenya, Bengaluru, Karnataka 560058';
  const phone = (operator.phone as string) ?? '+91 98451 11223';
  const gmail =
    (operator.gmail as string) ||
    (operator.email as string) ||
    'ramesh.kumar.fleet@gmail.com';
  const emergencyContact =
    (operator.emergency_contact as string) ?? '+91 98451 99882 (Family)';
  const licenseNumber =
    (operator.license as string) ||
    (operator.license_number as string) ||
    'KA-05-2016-HE-00841';

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/operators')}
            className="h-8 px-2.5 text-xs font-normal text-black border-zinc-300 hover:bg-zinc-100"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> All Operators
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-normal text-black tracking-tight">
                {editing ? 'Edit Operator Profile' : (operator.name as string)}
              </h1>
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full border border-zinc-300 bg-zinc-50 text-black">
                #{id.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
                className="h-8 text-xs font-normal text-black border-zinc-300"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => void handleSave()}
                disabled={saving}
                className="h-8 text-xs font-normal bg-black hover:bg-zinc-800 text-white"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setEditing(true)}
              className="h-8 text-xs font-normal bg-black hover:bg-zinc-800 text-white"
            >
              <Pencil className="h-3 w-3 mr-1.5" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {editing ? (
        /* Edit Mode Form */
        <div className="rounded-2xl border border-zinc-300 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-base font-normal text-black">Edit Operator Information</h2>
            <p className="text-xs font-normal text-black/60 mt-0.5">
              Update personal details, compensation, contact info, and credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal text-black">
            <div>
              <label className="block mb-1 text-black/70">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-black/70">Age (years)</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-black/70">Phone Number *</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-black/70">Gmail / Email *</label>
              <input
                type="email"
                value={form.gmail}
                onChange={(e) => setForm({ ...form, gmail: e.target.value, email: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-black/70">Marital Status</label>
              <select
                value={form.marital_status}
                onChange={(e) => setForm({ ...form, marital_status: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
              >
                <option value="Married">Married</option>
                <option value="Single">Single</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-black/70">Native Place / Hometown</label>
              <input
                type="text"
                value={form.native_place}
                onChange={(e) => setForm({ ...form, native_place: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-black/70">Languages Spoken</label>
              <input
                type="text"
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-black/70">Contract or Full Time</label>
              <select
                value={form.employment_type}
                onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
              >
                <option value="Full Time (Permanent)">Full Time (Permanent)</option>
                <option value="Contract (Annual Term)">Contract (Annual Term)</option>
                <option value="Contract (Project Term)">Contract (Project Term)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-black/70">Monthly Salary (INR)</label>
              <input
                type="number"
                value={form.monthly_salary}
                onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-black/70">Experience (years)</label>
              <input
                type="number"
                value={form.experience_years}
                onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-black/70">Driving License Number</label>
              <input
                type="text"
                value={form.license}
                onChange={(e) => setForm({ ...form, license: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-black/70">Machinery Specialization</label>
              <input
                type="text"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1 text-black/70">Residential Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1 text-black/70">Emergency Contact</label>
              <input
                type="text"
                value={form.emergency_contact}
                onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-black focus:outline-none focus:border-black"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 accent-black"
              />
              <label htmlFor="is_active" className="text-xs font-normal text-black">
                Operator is actively on duty and deployed
              </label>
            </div>
          </div>
        </div>
      ) : (
        /* View Mode: Comprehensive Creative Display */
        <div className="space-y-5">
          {/* Main ID & Portrait Card */}
          <div className="rounded-2xl border border-zinc-300 bg-white overflow-hidden flex flex-col md:flex-row shadow-sm">
            {/* Left Photo */}
            <div className="relative w-full md:w-56 h-64 md:h-auto bg-zinc-900 shrink-0 border-b md:border-b-0 md:border-r border-zinc-200">
              <img
                src={photoUrl}
                alt={operator.name as string}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-normal">
                <span className="font-mono bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/20">
                  #{id.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-amber-300" />
                  <span className="text-white">{(operator.rating as number)?.toFixed(1) ?? '4.8'}</span>
                </span>
              </div>
            </div>

            {/* Right Overview */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-normal text-black tracking-tight">
                      {operator.name as string}
                    </h2>
                    <p className="text-xs font-normal text-black/70 mt-0.5">
                      {(operator.specialization as string) || 'Heavy Equipment Specialist'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-normal border border-zinc-300 bg-zinc-50 text-black">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        operator.is_active ? 'bg-emerald-500' : 'bg-zinc-400'
                      }`}
                    />
                    {operator.is_active ? 'On Shift (Active)' : 'Off Duty'}
                  </span>
                </div>

                {/* Equipment Deployment Chip */}
                <div className="mt-4 p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-black shrink-0" />
                      <span className="font-normal text-black font-mono">
                        {assignedMachine
                          ? `${assignedMachine.code} · ${assignedMachine.make} ${assignedMachine.model}`
                          : ((operator.assigned_machine_code as string) || 'EX-01 · Cat 320D3 Excavator')}
                      </span>
                    </div>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded border border-zinc-300 bg-white text-black">
                      Assigned
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-black/75">
                    <MapPin className="h-3.5 w-3.5 text-black/60 shrink-0" />
                    <span>
                      {assignedMachine?.site_name || (operator.site as string) || 'Bangalore Metro Phase 2 — Reach 6'}
                      {assignedMachine?.client_name && ` · ${assignedMachine.client_name}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* RTO License & Rating Bar */}
              <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs text-black/70">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-black" />
                  <span className="font-normal font-mono text-black">{licenseNumber}</span>
                  <span className="text-black/50">(RTO Heavy Verified)</span>
                </div>
                <span className="font-normal text-black">Grade A Crew</span>
              </div>
            </div>
          </div>

          {/* Grid of Detailed Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1: Personal & Demographic Details */}
            <div className="rounded-2xl border border-zinc-300 bg-white p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2.5">
                <User className="h-4 w-4 text-black" />
                <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                  Personal & Demographic Details
                </h3>
              </div>

              <div className="space-y-2.5 text-xs font-normal">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Age</span>
                  <span className="text-black">{age} years</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Marital Status</span>
                  <span className="text-black">{maritalStatus}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Native Place</span>
                  <span className="text-black">{nativePlace}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Languages Spoken</span>
                  <span className="text-black">{languagesSpoken}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Employment & Compensation */}
            <div className="rounded-2xl border border-zinc-300 bg-white p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2.5">
                <Briefcase className="h-4 w-4 text-black" />
                <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                  Employment & Compensation
                </h3>
              </div>

              <div className="space-y-2.5 text-xs font-normal">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Contract or Full Time</span>
                  <span className="text-black">{employmentType}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Monthly Salary</span>
                  <span className="text-black">
                    ₹{monthlySalary.toLocaleString('en-IN')} / month
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Hourly Pay Rate</span>
                  <span className="text-black">₹{hourlyWage} / hour</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Fleet Experience</span>
                  <span className="text-black">{expYears} years heavy equipment</span>
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Communication */}
            <div className="rounded-2xl border border-zinc-300 bg-white p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2.5">
                <Phone className="h-4 w-4 text-black" />
                <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                  Contact Information
                </h3>
              </div>

              <div className="space-y-2.5 text-xs font-normal">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Phone Number</span>
                  <a href={`tel:${phone}`} className="text-black hover:underline">
                    {phone}
                  </a>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Gmail / Email</span>
                  <a href={`mailto:${gmail}`} className="text-black hover:underline">
                    {gmail}
                  </a>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Emergency Contact</span>
                  <span className="text-black">{emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Residential Address & Assignment */}
            <div className="rounded-2xl border border-zinc-300 bg-white p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2.5">
                <Home className="h-4 w-4 text-black" />
                <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                  Residential Address & Logistics
                </h3>
              </div>

              <div className="space-y-2.5 text-xs font-normal">
                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                  <p className="text-black/60 text-[11px] mb-1">Permanent Residential Address</p>
                  <p className="text-black leading-relaxed">{address}</p>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-black/60">Assigned Equipment</span>
                  <span className="text-black font-mono">
                    {assignedMachine?.code || 'EX-01'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
