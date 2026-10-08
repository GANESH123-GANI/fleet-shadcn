'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HardHat,
  Camera,
  Upload,
  Check,
  User,
  Briefcase,
  Phone,
  Truck,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { fetchList } from '@/lib/api/fetch-list';

interface MachineEntry {
  id: string;
  code: string;
  make: string;
  model: string;
  type?: string;
  site_name?: string;
  client_name?: string;
}

export default function NewOperator() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('/operators/op-001.jpg');
  const [machines, setMachines] = useState<MachineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    age: '38',
    marital_status: 'Married',
    native_place: 'Hassan, Karnataka',
    languages: 'Kannada, Hindi',
    employment_type: 'Full Time (Permanent)',
    monthly_salary: '42000',
    experience_years: '9',
    grade: 'Grade A',
    specialization: 'Excavator & Deep Trenching',
    status: 'on_shift',
    phone: '+91 98451 11223',
    gmail: 'ramesh.k@fleetteam.in',
    address: '#42, 2nd Cross, Industrial Area, Peenya, Bengaluru, Karnataka 560058',
    assigned_machine_id: '',
    assigned_machine_code: '',
    site: 'Bangalore Metro Phase 2 — Reach 6',
    client: 'L&T Construction',
    license_number: 'KA-05-2016-HE-00841',
  });

  useEffect(() => {
    fetchList<MachineEntry>('/api/v1/machines')
      .then((mch) => setMachines(mch))
      .catch(() => []);
  }, []);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setPhotoPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMachineSelect = (mchId: string) => {
    const m = machines.find((mch) => mch.id === mchId);
    if (m) {
      setFormData((prev) => ({
        ...prev,
        assigned_machine_id: m.id,
        assigned_machine_code: m.code,
        site: m.site_name || prev.site,
        client: m.client_name || prev.client,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        assigned_machine_id: '',
        assigned_machine_code: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter operator name');
      return;
    }
    setLoading(true);
    setError('');

    const opId = `op-${Date.now().toString(36)}`;
    const newEntry = {
      id: opId,
      name: formData.name.trim(),
      age: Number(formData.age) || 35,
      phone: formData.phone.trim() || '+91 98451 11223',
      email: formData.gmail.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@fleetteam.in`,
      gmail: formData.gmail.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      marital_status: formData.marital_status,
      native_place: formData.native_place,
      languages: formData.languages,
      monthly_salary: Number(formData.monthly_salary) || 42000,
      hourly_wage: Math.round((Number(formData.monthly_salary) || 42000) / 120),
      experience_years: Number(formData.experience_years) || 5,
      employment_type: formData.employment_type,
      address: formData.address,
      license: formData.license_number,
      license_number: formData.license_number,
      specialization: formData.specialization,
      grade: formData.grade,
      is_active: formData.status === 'on_shift',
      status: formData.status,
      assigned_machine_id: formData.assigned_machine_id || null,
      assigned_machine_code: formData.assigned_machine_code || null,
      site: formData.site,
      client: formData.client,
      photo_url: photoPreview,
    };

    try {
      await fetch('/api/v1/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
    } catch {
      // offline / mock db fallback
    }

    try {
      const stored = JSON.parse(localStorage.getItem('fleetos_custom_operators') || '[]');
      localStorage.setItem('fleetos_custom_operators', JSON.stringify([newEntry, ...stored]));
    } catch {}

    setLoading(false);
    router.push('/operators');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-8 w-8 p-0 rounded-lg border-zinc-300 text-black hover:bg-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-normal text-black tracking-tight">Add New Operator</h1>
            <p className="text-xs font-normal text-black mt-0.5">
              Enter demographic profile, contract, credentials and upload a photo from browser
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border border-zinc-300 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-xs text-red-600 font-normal">{error}</p>}

            {/* 1. Photo Upload Section */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-black" />
                <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                  Operator Photo & Avatar
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-zinc-300 shrink-0 bg-zinc-900 shadow-md">
                  <img
                    src={photoPreview}
                    alt="Operator Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[9px] text-center py-0.5 font-normal">
                    Preview
                  </div>
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoFileChange}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 px-3 text-xs font-normal text-black border-zinc-300 hover:bg-zinc-100 flex items-center gap-1.5 bg-white"
                    >
                      <Upload className="h-3.5 w-3.5 text-black" />
                      <span>Upload Photo from Device...</span>
                    </Button>
                    <span className="text-[11px] font-normal text-black">
                      (JPG, PNG, WebP)
                    </span>
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <p className="text-[10px] font-normal text-black uppercase tracking-wider mb-1.5">
                      Or pick from fleet crew:
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { name: 'Ramesh', url: '/operators/op-001.jpg' },
                        { name: 'Suresh', url: '/operators/op-002.jpg' },
                        { name: 'Abdul', url: '/operators/op-003.jpg' },
                        { name: 'Vikram', url: '/operators/op-004.jpg' },
                        { name: 'Pradeep', url: '/operators/op-005.jpg' },
                        { name: 'Manoj', url: '/operators/op-006.jpg' },
                      ].map((preset) => {
                        const isSelected = photoPreview === preset.url;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setPhotoPreview(preset.url)}
                            className={`relative h-9 w-9 rounded-lg overflow-hidden border transition-all ${
                              isSelected
                                ? 'border-black ring-2 ring-black'
                                : 'border-zinc-300 opacity-75 hover:opacity-100'
                            }`}
                            title={preset.name}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Personal Profile */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <User className="h-4 w-4 text-black" />
                <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                  Personal & Demographic Profile
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="70"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Marital Status
                  </label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  >
                    <option value="Married">Married</option>
                    <option value="Single">Single</option>
                    <option value="Unmarried">Unmarried</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Native Place
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hassan, Karnataka"
                    value={formData.native_place}
                    onChange={(e) => setFormData({ ...formData, native_place: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kannada, Hindi, English"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* 3. Employment & Compensation */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Briefcase className="h-4 w-4 text-black" />
                <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                  Employment & Compensation
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Contract / Full Time
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  >
                    <option value="Full Time (Permanent)">Full Time (Permanent)</option>
                    <option value="Contract">Contract</option>
                    <option value="Daily Wage">Daily Wage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Monthly Salary (₹ / mo)
                  </label>
                  <input
                    type="number"
                    placeholder="42000"
                    value={formData.monthly_salary}
                    onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    placeholder="9"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Operator Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Master Operator">Master Operator</option>
                    <option value="Junior">Junior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Specialty / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Excavator & Deep Trenching"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Initial Shift Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  >
                    <option value="on_shift">On Shift (Active)</option>
                    <option value="off_duty">Off Duty</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Contact & Address */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Phone className="h-4 w-4 text-black" />
                <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                  Contact & Residential Address
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98451 11223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Gmail / Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="ramesh.k@fleetteam.in"
                    value={formData.gmail}
                    onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Residential Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="#42, 2nd Cross, Industrial Area, Peenya, Bengaluru, Karnataka 560058"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 5. Equipment Allocation & Licensing */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Truck className="h-4 w-4 text-black" />
                <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                  Equipment Allocation & Licensing
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Assigned Machine
                  </label>
                  <select
                    value={formData.assigned_machine_id}
                    onChange={(e) => handleMachineSelect(e.target.value)}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  >
                    <option value="">No machine assigned</option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} · {m.make} {m.model} ({m.type || 'Plant'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Heavy Plant License Number (RTO)
                  </label>
                  <input
                    type="text"
                    placeholder="KA-05-2016-HE-00841"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Active Project Site
                  </label>
                  <input
                    type="text"
                    placeholder="Bangalore Metro Phase 2 — Reach 6"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-black mb-1">
                    Client / Contractor
                  </label>
                  <input
                    type="text"
                    placeholder="L&T Construction"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-black">
                <ShieldCheck className="h-4 w-4 text-black" />
                <span className="font-normal">RTO Verified Operator Registration</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="h-8 px-4 text-xs font-normal text-black border-zinc-300 hover:bg-zinc-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-8 px-5 text-xs font-normal bg-black hover:bg-zinc-800 text-white"
                >
                  {loading ? 'Registering…' : 'Add Operator'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
