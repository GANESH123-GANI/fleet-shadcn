'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import {
  Hash,
  Gauge,
  Fuel,
  MapPin,
  User,
  ArrowRight,
  Pencil,
  Trash2,
  Check,
  Sparkles,
  Layers,
  ArrowLeft,
  Building,
  Wrench,
  Activity,
  Sliders,
  Plus,
  X,
} from 'lucide-react';
import { authFetch } from '@/lib/api/auth-fetch';
import { fetchList } from '@/lib/api/fetch-list';
import {
  MACHINE_TYPES,
  MAKES,
  METER_TYPES,
  YEARS,
  modelsForMake,
} from '@/lib/machine-options';
import {
  MachineSideDiagram,
  MACHINE_DIAGRAM_PRESETS,
  MachineDiagramPreset,
} from '@/components/machines/machine-diagrams';

interface SiteItem {
  id: string;
  name?: string;
  title?: string;
}

interface ClientItem {
  id: string;
  name?: string;
}

interface OperatorItem {
  id: string;
  name?: string;
  full_name?: string;
}

export default function NewMachine() {
  const router = useRouter();

  // Machine form state tallying with Image 1 & Image 2
  const [formData, setFormData] = useState({
    code: 'MCH-11',
    type: 'excavator',
    make: 'Generic',
    model: 'Model',
    year: String(new Date().getFullYear()),
    chassis_no: '',
    primary_meter_type: 'hours',
    meter_unit_label: 'Hours',
    current_meter: '0',
    status_flag: 'active', // active (Operational), idle (Standby), service (In Service)
    hourly_rate: '2000',
    fuel_capacity_litres: '300',
    fuel_level_pct: '80',
    site_id: '',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: '',
    client_name: 'L&T Construction',
    operator_id: '',
    operator_name: 'Assigned Operator',
    selectedDiagramPreset: 'excavator',
  });

  const [availableSites, setAvailableSites] = useState<SiteItem[]>([]);
  const [availableClients, setAvailableClients] = useState<ClientItem[]>([]);
  const [availableOperators, setAvailableOperators] = useState<OperatorItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customSite, setCustomSite] = useState(false);
  const [customClient, setCustomClient] = useState(false);
  const [customOperator, setCustomOperator] = useState(false);

  // Fetch existing Sites, Clients, and Operators on mount to populate selectors
  useEffect(() => {
    void fetchList<SiteItem>('/api/v1/sites').then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setAvailableSites(res);
      }
    });

    void fetchList<ClientItem>('/api/v1/clients').then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setAvailableClients(res);
      }
    });

    void fetchList<OperatorItem>('/api/v1/operators').then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setAvailableOperators(res);
      }
    });
  }, []);

  const set = (k: string, v: string) => setFormData((f) => ({ ...f, [k]: v }));

  const availableModels = useMemo(() => modelsForMake(formData.make), [formData.make]);

  // Dynamic diagram presets list (initialized with defaults from MACHINE_DIAGRAM_PRESETS)
  const [presetsList, setPresetsList] = useState<MachineDiagramPreset[]>(MACHINE_DIAGRAM_PRESETS);

  // Quick-specs input fields shown in Image 2 (Rate and Fuel Capacity) that the user can type
  // Hidden by default; appears when clicking top '+ Add' button, disappears when clicking 'Add' inside preset
  const [showQuickSpecs, setShowQuickSpecs] = useState(false);
  const [quickRate, setQuickRate] = useState('2500');
  const [quickFuel, setQuickFuel] = useState('400');
  const [quickSpecsApplied, setQuickSpecsApplied] = useState(false);

  // New Custom Preset creation modal/expander
  const [showCustomPresetForm, setShowCustomPresetForm] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetType, setNewPresetType] = useState('dump_truck');
  const [newPresetRate, setNewPresetRate] = useState('1800');
  const [newPresetFuel, setNewPresetFuel] = useState('300');
  const [newPresetDiagramBase, setNewPresetDiagramBase] = useState('dump_truck');

  // Update preset stats so diagram cards immediately reflect the typed rate and fuel capacity
  const updatePresetStats = (presetId: string, rateStr: string, fuelStr: string) => {
    const r = parseFloat(rateStr) || 0;
    const f = parseFloat(fuelStr) || 0;
    setPresetsList((prev) =>
      prev.map((p) =>
        p.id === presetId ? { ...p, defaultHourlyRate: r, defaultFuelCapacity: f } : p,
      ),
    );
  };

  // Apply typed quick specs (Rate and Fuel Capacity from Image 2) and hide the preset bar
  const handleApplyQuickSpecs = () => {
    const r = parseFloat(quickRate) || 0;
    const f = parseFloat(quickFuel) || 0;
    setFormData((prev) => ({
      ...prev,
      hourly_rate: String(r),
      fuel_capacity_litres: String(f),
    }));
    updatePresetStats(formData.selectedDiagramPreset, quickRate, quickFuel);
    setQuickSpecsApplied(true);
    // Preset specs bar disappears as requested
    setShowQuickSpecs(false);
    setTimeout(() => setQuickSpecsApplied(false), 3000);
  };

  // Handle adding a brand new custom preset to the downlist
  const handleAddCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPresetName.trim();
    if (!name) return;
    const customId = `custom-${Date.now().toString(36)}`;
    const basePreset = presetsList.find((p) => p.id === newPresetDiagramBase) || presetsList[0];
    const r = parseFloat(newPresetRate) || 1800;
    const f = parseFloat(newPresetFuel) || 300;
    const customCodePrefix = (name.replace(/[^A-Za-z]/g, '').slice(0, 3) || 'CST').toUpperCase();

    const newPreset: MachineDiagramPreset = {
      id: customId,
      name,
      shortName: name.length > 14 ? `${name.slice(0, 12)}…` : name,
      typeValue: newPresetType || basePreset.typeValue,
      codePrefix: customCodePrefix,
      defaultMake: 'Generic',
      defaultModel: name,
      defaultHourlyRate: r,
      defaultFuelCapacity: f,
      defaultFuelPct: 80,
      defaultMeterType: 'hours',
      description: `Custom ${name} equipment preset`,
      DiagramComponent: basePreset.DiagramComponent,
    };

    setPresetsList((prev) => [...prev, newPreset]);
    handleSelectDiagramPreset(newPreset);
    setShowCustomPresetForm(false);
    setNewPresetName('');
  };

  // Handle removing / deleting an equipment preset from the list and downlist
  const handleRemovePreset = (presetId: string) => {
    if (presetsList.length <= 1) {
      alert('At least one equipment preset must be kept.');
      return;
    }
    const nextList = presetsList.filter((p) => p.id !== presetId);
    setPresetsList(nextList);

    // If deleting the active preset, select the first remaining preset
    if (formData.selectedDiagramPreset === presetId) {
      handleSelectDiagramPreset(nextList[0]);
    }
  };

  // Handle selecting a diagram preset from downlist or gallery
  const handleSelectDiagramPreset = (preset: MachineDiagramPreset) => {
    setQuickRate(String(preset.defaultHourlyRate));
    setQuickFuel(String(preset.defaultFuelCapacity));

    setFormData((prev) => {
      // Suggest updated defaults if current values were default/empty
      const nextCode =
        !prev.code || prev.code === 'MCH-11' || prev.code.startsWith('EXC-')
          ? `${preset.codePrefix}-005`
          : prev.code;

      return {
        ...prev,
        selectedDiagramPreset: preset.id,
        type: preset.typeValue,
        code: nextCode,
        hourly_rate: String(preset.defaultHourlyRate),
        fuel_capacity_litres: String(preset.defaultFuelCapacity),
        fuel_level_pct: String(preset.defaultFuelPct),
        primary_meter_type: preset.defaultMeterType,
        meter_unit_label: preset.defaultMeterType === 'km' ? 'km' : 'Hours',
      };
    });
  };

  const handleDiagramDownlistChange = (presetId: string) => {
    const found = presetsList.find((p) => p.id === presetId);
    if (found) {
      handleSelectDiagramPreset(found);
    }
  };

  const activePreset =
    presetsList.find((p) => p.id === formData.selectedDiagramPreset) || presetsList[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const parsedMeter = parseFloat(formData.current_meter) || 0;
    const parsedRate = parseFloat(formData.hourly_rate) || 2000;
    const parsedFuelCap = parseFloat(formData.fuel_capacity_litres) || 300;
    const parsedFuelPct = Math.min(100, Math.max(0, parseFloat(formData.fuel_level_pct) || 80));

    try {
      const res = await authFetch('/api/v1/machines', {
        method: 'POST',
        body: JSON.stringify({
          code: formData.code.trim(),
          type: formData.type.trim(),
          make: formData.make.trim() || undefined,
          model: formData.model.trim() || undefined,
          year: formData.year ? parseInt(formData.year, 10) : undefined,
          chassis_no: formData.chassis_no.trim() || undefined,
          primary_meter_type: formData.primary_meter_type,
          meter_unit_label: formData.meter_unit_label || formData.primary_meter_type,
          current_meter: parsedMeter,
          status_flag: formData.status_flag,
          hourly_rate: parsedRate,
          fuel_capacity_litres: parsedFuelCap,
          fuel_level_pct: parsedFuelPct,
          site_id: formData.site_id || undefined,
          site_name: formData.site_name.trim() || undefined,
          client_id: formData.client_id || undefined,
          client_name: formData.client_name.trim() || undefined,
          operator_id: formData.operator_id || undefined,
          operator_name: formData.operator_name.trim() || undefined,
          client_uuid: crypto.randomUUID(),
        }),
      });

      if (res.ok) {
        alert('Machine created successfully!');
        router.push('/machines');
        return;
      }

      const body = await res.json().catch(() => null);
      setError(body?.detail || body?.message || 'Failed to create machine');
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Preview computations matching Image 2
  const previewStatusLabel =
    formData.status_flag === 'active'
      ? 'Operational'
      : formData.status_flag === 'service'
      ? 'In Service'
      : 'Standby';

  const previewCurrentMeter = parseFloat(formData.current_meter) || 0;
  const previewHourlyRate = parseFloat(formData.hourly_rate) || 2000;
  const previewFuelPct = Math.min(100, Math.max(0, parseFloat(formData.fuel_level_pct) || 80));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 px-2 sm:px-4">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/machines"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Fleet Machines
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-black">Add Machine</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Select an equipment schematic diagram, customize telemetry metrics, and configure site & operator assignments.
          </p>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 1. VISUAL DIAGRAM SELECTOR DOWNLIST & GALLERY (Image 3 requirement) */}
      {/* --------------------------------------------------------------------- */}
      <Card className="border-zinc-300 shadow-sm bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-black" />
                <CardTitle className="text-base font-semibold text-black">
                  Equipment Schematic Diagrams List (Image 3)
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-zinc-600 mt-0.5">
                Select a schematic blueprint from the downlist or click a diagram card below. It configures the blueprint and pre-fills technical specifications.
              </CardDescription>
            </div>

            {/* Quick Downlist Dropdown & Button Named "Add" on Right Side */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <NativeSelect
                  id="diagram-downlist-select"
                  value={formData.selectedDiagramPreset}
                  onChange={(e) => handleDiagramDownlistChange(e.target.value)}
                  className="w-full text-xs font-medium border-zinc-300"
                >
                  {presetsList.map((preset) => (
                    <NativeSelectOption key={preset.id} value={preset.id}>
                      {preset.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              {/* Button named "Add" on Right Side - clicks to make preset specs bar appear */}
              <Button
                type="button"
                id="add-preset-specs-btn"
                onClick={() => setShowQuickSpecs((prev) => !prev)}
                className="h-9 px-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-xs"
                title={showQuickSpecs ? 'Hide preset specifications' : 'Add / customize preset specifications'}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </Button>
            </div>
          </div>

          {/* Quick Success Toast when applied and preset bar disappears */}
          {quickSpecsApplied && !showQuickSpecs && (
            <div className="mt-2.5 flex items-center justify-between p-2 px-3 rounded-md bg-zinc-900 text-white text-xs animate-in fade-in">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 stroke-[3] text-emerald-400" />
                <span>Preset specs updated for <strong>{activePreset?.shortName}</strong>: ₹{quickRate}/hr · {quickFuel}L</span>
              </span>
              <button
                type="button"
                onClick={() => setQuickSpecsApplied(false)}
                className="text-zinc-400 hover:text-white text-xs ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* Two Input Fields shown in Image 2 that the user wants to type    */}
          {/* (Hourly Rate: ₹1800/hr & Fuel Tank Capacity: 300L)              */}
          {/* ----------------------------------------------------------------- */}
          {showQuickSpecs && (
            <div className="mt-3.5 p-3 rounded-lg border border-zinc-200 bg-zinc-50/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-black flex items-center gap-1.5 shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-black" />
                  Type Preset Specs (Image 2):
                </span>
                <span className="text-[11px] text-zinc-600 hidden sm:inline truncate">
                  Type specs for <strong className="text-black font-semibold">{activePreset?.shortName}</strong>:
                </span>
                {quickSpecsApplied && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-medium animate-in fade-in">
                    <Check className="h-2.5 w-2.5 stroke-[3]" /> Applied: ₹{quickRate}/hr · {quickFuel}L
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Input Field 1: Rate (₹/hr) as shown in Image 2 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-zinc-700">Rate:</span>
                  <div className="w-32">
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <span className="text-xs font-semibold text-black">₹</span>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="quick-rate-input"
                        type="number"
                        min="0"
                        step="50"
                        placeholder="1800"
                        value={quickRate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuickRate(val);
                          set('hourly_rate', val);
                          updatePresetStats(formData.selectedDiagramPreset, val, quickFuel);
                        }}
                        className="text-xs h-8 font-medium"
                      />
                      <InputGroupAddon align="inline-end">
                        <span className="text-[10px] text-zinc-500">/hr</span>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </div>

                {/* Input Field 2: Fuel Capacity (L) as shown in Image 2 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-zinc-700">Fuel:</span>
                  <div className="w-28">
                    <InputGroup>
                      <InputGroupInput
                        id="quick-fuel-input"
                        type="number"
                        min="0"
                        placeholder="300"
                        value={quickFuel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuickFuel(val);
                          set('fuel_capacity_litres', val);
                          updatePresetStats(formData.selectedDiagramPreset, quickRate, val);
                        }}
                        className="text-xs h-8 font-medium"
                      />
                      <InputGroupAddon align="inline-end">
                        <span className="text-[10px] text-zinc-500">L</span>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </div>

                {/* Add / Apply Button */}
                <Button
                  type="button"
                  onClick={handleApplyQuickSpecs}
                  className="h-8 px-3 bg-black hover:bg-zinc-800 text-white text-xs font-medium shrink-0 flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  <span>Add</span>
                </Button>

                {/* Custom Preset Toggle Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCustomPresetForm(!showCustomPresetForm)}
                  className="h-8 px-2.5 text-xs border-zinc-300 shrink-0"
                >
                  {showCustomPresetForm ? 'Close' : '+ New Preset'}
                </Button>

                {/* Dismiss / Close Specs Bar Button */}
                <button
                  type="button"
                  title="Close preset specifications"
                  onClick={() => setShowQuickSpecs(false)}
                  className="h-8 w-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-200/60 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Inline Form to Add a New Custom Preset to Downlist */}
          {showCustomPresetForm && (
            <form
              onSubmit={handleAddCustomPreset}
              className="mt-3 p-3.5 rounded-lg border border-zinc-300 bg-white shadow-xs space-y-3 animate-in fade-in slide-in-from-top-1"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <span className="text-xs font-semibold text-black flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-black" />
                  Add New Custom Equipment Preset to Downlist
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomPresetForm(false)}
                  className="text-xs text-zinc-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-black">Preset Name *</label>
                  <Input
                    placeholder="e.g. Heavy Tipper"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-black">Base Diagram</label>
                  <NativeSelect
                    value={newPresetDiagramBase}
                    onChange={(e) => {
                      setNewPresetDiagramBase(e.target.value);
                      setNewPresetType(e.target.value);
                    }}
                    className="h-8 text-xs w-full"
                  >
                    <NativeSelectOption value="excavator">Excavator Blueprint</NativeSelectOption>
                    <NativeSelectOption value="dozer">Bulldozer Blueprint</NativeSelectOption>
                    <NativeSelectOption value="dump_truck">Dump Truck Blueprint</NativeSelectOption>
                    <NativeSelectOption value="wheel_loader">Wheel Loader Blueprint</NativeSelectOption>
                    <NativeSelectOption value="backhoe">Backhoe Blueprint</NativeSelectOption>
                    <NativeSelectOption value="crane">Mobile Crane Blueprint</NativeSelectOption>
                    <NativeSelectOption value="grader">Motor Grader Blueprint</NativeSelectOption>
                  </NativeSelect>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-black">Hourly Rate (₹/hr)</label>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <span className="text-xs font-semibold text-black">₹</span>
                    </InputGroupAddon>
                    <InputGroupInput
                      type="number"
                      min="0"
                      step="50"
                      value={newPresetRate}
                      onChange={(e) => setNewPresetRate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </InputGroup>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-black">Fuel Capacity (L)</label>
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      min="0"
                      value={newPresetFuel}
                      onChange={(e) => setNewPresetFuel(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <InputGroupAddon align="inline-end">
                      <span className="text-[10px] text-zinc-500">L</span>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCustomPresetForm(false)}
                  className="h-7 px-3 text-xs border-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-7 px-3 bg-black hover:bg-zinc-800 text-white text-xs font-medium"
                >
                  Add to Downlist & Cards
                </Button>
              </div>
            </form>
          )}
        </CardHeader>

        <CardContent className="px-5 pb-5 pt-0">
          {/* Diagrams Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
            {presetsList.map((preset) => {
              const isSelected = formData.selectedDiagramPreset === preset.id;
              const DiagramComp = preset.DiagramComponent;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectDiagramPreset(preset)}
                  className={`group relative flex flex-col items-center rounded-lg border p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-black bg-zinc-100/90 shadow-sm ring-1 ring-black'
                      : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-100/60'
                  }`}
                >
                  {/* Delete option on left top to remove preset */}
                  <span
                    role="button"
                    tabIndex={0}
                    title="Remove this preset"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePreset(preset.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        handleRemovePreset(preset.id);
                      }
                    }}
                    className="absolute top-1.5 left-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 hover:bg-red-600 hover:text-white transition-all cursor-pointer opacity-70 group-hover:opacity-100 shadow-xs"
                  >
                    <X className="h-2.5 w-2.5 stroke-[3]" />
                  </span>

                  {/* Selected check badge on top right */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-white shadow-xs">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}

                  {/* SVG Diagram Canvas */}
                  <div className="h-14 w-full flex items-center justify-center px-1">
                    <DiagramComp className="h-full w-full object-contain" />
                  </div>

                  {/* Preset Label & Specs (Image 2 format) */}
                  <div className="mt-2 w-full text-center">
                    <p className={`text-[11px] font-semibold truncate ${isSelected ? 'text-black' : 'text-zinc-700'}`}>
                      {preset.shortName}
                    </p>
                    <p className="text-[9px] text-zinc-600 truncate mt-0.5 font-medium">
                      ₹{preset.defaultHourlyRate}/hr · {preset.defaultFuelCapacity}L
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* 2. FORM & LIVE CARD PREVIEW (Tallying Image 1 with Image 2) */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Fields (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            {/* SECTION A: Basic Identification & Type */}
            <Card className="border-zinc-300 shadow-sm bg-white">
              <CardHeader className="pb-3 pt-4 px-5 border-b border-zinc-100">
                <CardTitle className="text-sm font-semibold text-black flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-black" /> 1. Machine Identification & Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Code & Machine Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="machine-code">Code *</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Hash className="h-3.5 w-3.5 text-zinc-500" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="machine-code"
                        value={formData.code}
                        onChange={(e) => set('code', e.target.value)}
                        placeholder="MCH-11 or EXC-005"
                        required
                      />
                    </InputGroup>
                    <FieldDescription className="text-[10px]">
                      Unique asset identifier displayed in the fleet dashboard header
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="machine-type">Machine Type *</FieldLabel>
                    <NativeSelect
                      id="machine-type"
                      className="w-full"
                      value={formData.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        set('type', newType);
                        // Also sync diagram preset if matching
                        const match = MACHINE_DIAGRAM_PRESETS.find(
                          (p) => p.typeValue === newType || p.id === newType,
                        );
                        if (match) {
                          set('selectedDiagramPreset', match.id);
                        }
                      }}
                      required
                    >
                      <NativeSelectOption value="">Select type…</NativeSelectOption>
                      {MACHINE_TYPES.map((t) => (
                        <NativeSelectOption key={t.value} value={t.value}>
                          {t.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldDescription className="text-[10px]">
                      Controls the side-profile technical schematic rendering
                    </FieldDescription>
                  </Field>
                </div>

                {/* Make & Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="machine-make">Make / OEM</FieldLabel>
                    <NativeSelect
                      id="machine-make"
                      className="w-full"
                      value={formData.make}
                      onChange={(e) => {
                        const newMake = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          make: newMake,
                          model: '',
                        }));
                      }}
                    >
                      <NativeSelectOption value="Generic">Generic (OEM Badge)</NativeSelectOption>
                      {MAKES.map((m) => (
                        <NativeSelectOption key={m.value} value={m.value}>
                          {m.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="machine-model">Model Name / Number</FieldLabel>
                    {availableModels.length > 0 ? (
                      <NativeSelect
                        id="machine-model"
                        className="w-full"
                        value={formData.model}
                        onChange={(e) => set('model', e.target.value)}
                      >
                        <NativeSelectOption value="">Select model…</NativeSelectOption>
                        {availableModels.map((m) => (
                          <NativeSelectOption key={m} value={m}>
                            {m}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    ) : (
                      <Input
                        id="machine-model"
                        value={formData.model}
                        onChange={(e) => set('model', e.target.value)}
                        placeholder="Model e.g. 320D3, PC210"
                      />
                    )}
                  </Field>
                </div>

                {/* Year & Chassis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="machine-year">Manufacturing Year</FieldLabel>
                    <NativeSelect
                      id="machine-year"
                      className="w-full"
                      value={formData.year}
                      onChange={(e) => set('year', e.target.value)}
                    >
                      <NativeSelectOption value="">Select year…</NativeSelectOption>
                      {YEARS.map((y) => (
                        <NativeSelectOption key={y} value={y}>
                          {y}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="machine-chassis">Chassis / Serial No</FieldLabel>
                    <Input
                      id="machine-chassis"
                      value={formData.chassis_no}
                      onChange={(e) => set('chassis_no', e.target.value)}
                      placeholder="Optional serial number"
                    />
                  </Field>
                </div>
              </CardContent>
            </Card>

            {/* SECTIONS 2 & 3 SIDE BY SIDE: Section 3 at the right of Section 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              {/* SECTION B: Telemetry & Operational Metrics (Image 2 Tally) */}
              <Card className="border-zinc-300 shadow-sm bg-white flex flex-col justify-between">
                <CardHeader className="pb-3 pt-4 px-5 border-b border-zinc-100">
                  <CardTitle className="text-sm font-semibold text-black flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-black" /> 2. Operational Status & Quick Specs (Tallying Image 2)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 flex-1">
                  {/* Status & Hourly Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field>
                      <FieldLabel htmlFor="machine-status">Operational Status *</FieldLabel>
                      <NativeSelect
                        id="machine-status"
                        className="w-full text-xs"
                        value={formData.status_flag}
                        onChange={(e) => set('status_flag', e.target.value)}
                        required
                      >
                        <NativeSelectOption value="active">● Operational (Working)</NativeSelectOption>
                        <NativeSelectOption value="idle">● Standby (Idle / Available)</NativeSelectOption>
                        <NativeSelectOption value="service">● In Service (Maintenance)</NativeSelectOption>
                      </NativeSelect>
                      <FieldDescription className="text-[10px]">
                        Displays in top-right pill of the fleet card (Image 2)
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="machine-hourly-rate">Hourly Rate (₹/hr) *</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <span className="text-xs font-semibold text-black">₹</span>
                        </InputGroupAddon>
                        <InputGroupInput
                          id="machine-hourly-rate"
                          type="number"
                          min="0"
                          step="50"
                          value={formData.hourly_rate}
                          onChange={(e) => set('hourly_rate', e.target.value)}
                          placeholder="2000"
                          required
                          className="text-xs"
                        />
                        <InputGroupAddon align="inline-end">
                          <span className="text-xs text-zinc-500">/hr</span>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription className="text-[10px]">
                        Displays on card quick specs: ₹2,000/hr
                      </FieldDescription>
                    </Field>
                  </div>

                  {/* Meter Reading & Meter Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field>
                      <FieldLabel htmlFor="machine-meter-val">Initial Meter Reading *</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <Gauge className="h-3.5 w-3.5 text-zinc-500" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="machine-meter-val"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.current_meter}
                          onChange={(e) => set('current_meter', e.target.value)}
                          placeholder="0"
                          required
                          className="text-xs"
                        />
                      </InputGroup>
                      <FieldDescription className="text-[10px]">
                        Starting meter reading displayed as "0 Hours" on card
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="machine-meter-type">Meter Unit / Type *</FieldLabel>
                      <NativeSelect
                        id="machine-meter-type"
                        className="w-full text-xs"
                        value={formData.primary_meter_type}
                        onChange={(e) => {
                          const t = e.target.value;
                          setFormData((f) => ({
                            ...f,
                            primary_meter_type: t,
                            meter_unit_label: t === 'hours' ? 'Hours' : t === 'km' ? 'km' : t,
                          }));
                        }}
                        required
                      >
                        {METER_TYPES.map((t) => (
                          <NativeSelectOption key={t} value={t}>
                            {t}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </Field>
                  </div>

                  {/* Fuel Level & Fuel Capacity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field>
                      <FieldLabel htmlFor="machine-fuel-pct">Fuel Tank Level (%) *</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <Fuel className="h-3.5 w-3.5 text-zinc-500" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="machine-fuel-pct"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.fuel_level_pct}
                          onChange={(e) => set('fuel_level_pct', e.target.value)}
                          placeholder="80"
                          required
                          className="text-xs"
                        />
                        <InputGroupAddon align="inline-end">
                          <span className="text-xs text-zinc-500">% tank</span>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription className="text-[10px]">
                        Displays on card quick specs as "80% tank"
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="machine-fuel-cap">Fuel Capacity (Litres)</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="machine-fuel-cap"
                          type="number"
                          min="1"
                          value={formData.fuel_capacity_litres}
                          onChange={(e) => set('fuel_capacity_litres', e.target.value)}
                          placeholder="300"
                          className="text-xs"
                        />
                        <InputGroupAddon align="inline-end">
                          <span className="text-xs text-zinc-500">Litres</span>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription className="text-[10px]">
                        Full tank fuel capacity for burn-rate monitoring
                      </FieldDescription>
                    </Field>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION C: Assignment & Deployment (Image 2 Tally) - AT THE RIGHT OF 2 SIDE BY SIDE */}
              <Card className="border-zinc-300 shadow-sm bg-white flex flex-col justify-between">
                <CardHeader className="pb-3 pt-4 px-5 border-b border-zinc-100">
                  <CardTitle className="text-sm font-semibold text-black flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-black" /> 3. Deployment, Client & Operator (Tallying Image 2)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 flex-1">
                  {/* Site / Location */}
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="machine-site">Assigned Site / Project Location</FieldLabel>
                      <button
                        type="button"
                        onClick={() => setCustomSite(!customSite)}
                        className="text-[11px] text-zinc-600 hover:text-black underline"
                      >
                        {customSite ? 'Pick from existing' : '+ Custom site name'}
                      </button>
                    </div>
                    {customSite || availableSites.length === 0 ? (
                      <Input
                        id="machine-site"
                        value={formData.site_name}
                        onChange={(e) => setFormData((f) => ({ ...f, site_name: e.target.value, site_id: '' }))}
                        placeholder="Bangalore Metro Phase 2 — Reach 6"
                        className="text-xs"
                      />
                    ) : (
                      <NativeSelect
                        id="machine-site"
                        className="w-full text-xs"
                        value={formData.site_id || ''}
                        onChange={(e) => {
                          const sel = availableSites.find((s) => s.id === e.target.value);
                          setFormData((f) => ({
                            ...f,
                            site_id: e.target.value,
                            site_name: sel?.name || sel?.title || f.site_name,
                          }));
                        }}
                      >
                        <NativeSelectOption value="">
                          {formData.site_name ? `Current: ${formData.site_name}` : 'Select site…'}
                        </NativeSelectOption>
                        {availableSites.map((s) => (
                          <NativeSelectOption key={s.id} value={s.id}>
                            {s.name || s.title || s.id}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    )}
                    <FieldDescription className="text-[10px]">
                      Location line shown on card: "Bangalore Metro Phase 2 — Reach 6"
                    </FieldDescription>
                  </Field>

                  {/* Client Name */}
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="machine-client">Client Name</FieldLabel>
                      <button
                        type="button"
                        onClick={() => setCustomClient(!customClient)}
                        className="text-[11px] text-zinc-600 hover:text-black underline"
                      >
                        {customClient ? 'Select client' : '+ Custom'}
                      </button>
                    </div>
                    {customClient || availableClients.length === 0 ? (
                      <Input
                        id="machine-client"
                        value={formData.client_name}
                        onChange={(e) => setFormData((f) => ({ ...f, client_name: e.target.value, client_id: '' }))}
                        placeholder="L&T Construction"
                        className="text-xs"
                      />
                    ) : (
                      <NativeSelect
                        id="machine-client"
                        className="w-full text-xs"
                        value={formData.client_id || ''}
                        onChange={(e) => {
                          const sel = availableClients.find((c) => c.id === e.target.value);
                          setFormData((f) => ({
                            ...f,
                            client_id: e.target.value,
                            client_name: sel?.name || f.client_name,
                          }));
                        }}
                      >
                        <NativeSelectOption value="">
                          {formData.client_name ? `Current: ${formData.client_name}` : 'Select client…'}
                        </NativeSelectOption>
                        {availableClients.map((c) => (
                          <NativeSelectOption key={c.id} value={c.id}>
                            {c.name || c.id}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    )}
                    <FieldDescription className="text-[10px]">
                      Displays as "Client: L&T Construction"
                    </FieldDescription>
                  </Field>

                  {/* Assigned Operator */}
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="machine-operator">Assigned Operator</FieldLabel>
                      <button
                        type="button"
                        onClick={() => setCustomOperator(!customOperator)}
                        className="text-[11px] text-zinc-600 hover:text-black underline"
                      >
                        {customOperator ? 'Select operator' : '+ Custom'}
                      </button>
                    </div>
                    {customOperator || availableOperators.length === 0 ? (
                      <Input
                        id="machine-operator"
                        value={formData.operator_name}
                        onChange={(e) => setFormData((f) => ({ ...f, operator_name: e.target.value, operator_id: '' }))}
                        placeholder="Assigned Operator"
                        className="text-xs"
                      />
                    ) : (
                      <NativeSelect
                        id="machine-operator"
                        className="w-full text-xs"
                        value={formData.operator_id || ''}
                        onChange={(e) => {
                          const sel = availableOperators.find((o) => o.id === e.target.value);
                          setFormData((f) => ({
                            ...f,
                            operator_id: e.target.value,
                            operator_name: sel?.name || sel?.full_name || f.operator_name,
                          }));
                        }}
                      >
                        <NativeSelectOption value="">
                          {formData.operator_name ? `Current: ${formData.operator_name}` : 'Select operator…'}
                        </NativeSelectOption>
                        {availableOperators.map((o) => (
                          <NativeSelectOption key={o.id} value={o.id}>
                            {o.name || o.full_name || o.id}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    )}
                    <FieldDescription className="text-[10px]">
                      Displays next to operator avatar icon
                    </FieldDescription>
                  </Field>
                </CardContent>
              </Card>
            </div>

            {error && <FieldError>{error}</FieldError>}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={loading} className="px-6 bg-black hover:bg-zinc-800 text-white font-medium">
                {loading ? (
                  <>
                    <Spinner /> Adding Machine…
                  </>
                ) : (
                  'Add Machine'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/machines')}
                className="border-zinc-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Sticky Live Fleet Card Preview (Exact Image 2 representation) */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-600">
              Live Fleet Card Preview (Image 2)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 border border-zinc-300 px-2 py-0.5 text-[10px] text-zinc-700">
              <Sparkles className="h-3 w-3 text-black" /> Real-time preview
            </span>
          </div>

          {/* EXACT CARD AS RENDERED IN IMAGE 2 */}
          <div className="group flex flex-col justify-between rounded-lg border border-zinc-300 bg-white p-3.5 shadow-md transition-all">
            <div>
              {/* Machine Header: Code, Make Badge, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-black tracking-tight font-mono">
                      {formData.code || 'MCH-11'}
                    </span>
                    <span className="rounded border border-zinc-400 bg-zinc-100 px-1.5 py-0.2 text-[9px] font-normal uppercase text-black">
                      {formData.make || 'GENERIC'}
                    </span>
                  </div>
                  <p className="text-[11px] font-normal text-black truncate">
                    {formData.model || 'Model'}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-400 bg-zinc-50 px-2 py-0.5 text-[10px] font-normal text-black shrink-0">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      formData.status_flag === 'active'
                        ? 'bg-black animate-pulse'
                        : 'bg-zinc-600'
                    }`}
                  />
                  {previewStatusLabel}
                </span>
              </div>

              {/* Compact Side-by-Side Blueprint & Telemetry Strip */}
              <div className="mt-2.5 flex items-center justify-between gap-2 rounded-md border border-zinc-300 bg-zinc-50/80 p-2">
                {/* Compact Side CAD Schematic Diagram */}
                <div className="h-14 w-28 shrink-0 flex items-center justify-center">
                  <MachineSideDiagram type={formData.type} />
                </div>

                {/* Quick Specs Column */}
                <div className="flex-1 space-y-1 text-right text-[11px]">
                  <div className="flex items-center justify-end gap-1.5">
                    <Gauge className="h-3 w-3 text-black" />
                    <span className="font-normal text-black">
                      {previewCurrentMeter.toLocaleString()} {formData.meter_unit_label || 'Hours'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <Fuel className="h-3 w-3 text-black" />
                    <span className="font-normal text-black">{previewFuelPct}% tank</span>
                  </div>
                  <div className="text-[10px] font-normal text-black">
                    ₹{previewHourlyRate.toLocaleString()}/hr
                  </div>
                </div>
              </div>

              {/* Location & Operator */}
              <div className="mt-2 space-y-0.5 text-[11px] font-normal">
                <p className="flex items-center gap-1.5 text-black truncate">
                  <MapPin className="h-3 w-3 text-black shrink-0" />
                  <span className="truncate">
                    {formData.site_name || 'Bangalore Metro Phase 2 — Reach 6'}
                  </span>
                </p>
                <p className="flex items-center gap-1.5 text-[10px] text-black truncate pl-4.5">
                  <span>Client: {formData.client_name || 'L&T Construction'}</span>
                  <span>·</span>
                  <User className="h-2.5 w-2.5 inline text-black" />
                  <span>{formData.operator_name || 'Assigned Operator'}</span>
                </p>
              </div>
            </div>

            {/* Compact Card Action Footer */}
            <div className="mt-2.5 flex items-center justify-between border-t border-zinc-200 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-normal text-black cursor-default">
                <span>View Telemetry</span>
                <ArrowRight className="h-3 w-3 text-black" />
              </span>

              <div className="flex items-center gap-1 text-zinc-500">
                <Pencil className="h-3.5 w-3.5 cursor-default hover:text-black" />
                <Trash2 className="h-3.5 w-3.5 cursor-default hover:text-black" />
              </div>
            </div>
          </div>

          {/* Descriptive Information Card */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-600 space-y-1.5">
            <p className="font-semibold text-black">✓ Complete Card Synchronization</p>
            <p className="leading-relaxed">
              All input fields above match the exact layout and telemetry metrics of Image 2. Selecting a diagram schematic preset from Image 3 pre-configures recommended rate, fuel capacity, and blueprint graphics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
