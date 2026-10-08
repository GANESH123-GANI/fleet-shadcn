'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Package,
  Wrench,
  Fuel,
  RefreshCw,
  Edit2,
  Trash2,
  PlusCircle,
  MinusCircle,
  TrendingDown,
  Layers,
  MapPin,
  Tag,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { authFetch } from '@/lib/api/auth-fetch';
import { fetchListStrict } from '@/lib/api/fetch-list';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  unit_cost: number;
  location: string;
  supplier?: string;
  compatible_machines?: string;
  last_updated: string;
}

const DEFAULT_ITEMS: InventoryItem[] = [
  {
    id: 'inv-001',
    name: 'Hydraulic Oil ISO VG 68',
    sku: 'OIL-HYD-68',
    category: 'Oils & Lubricants',
    quantity: 45,
    unit: 'Barrels (200L)',
    min_quantity: 20,
    unit_cost: 24500,
    location: 'Main Yard - Bay 1',
    supplier: 'Indian Oil Servo',
    compatible_machines: 'CAT 320D3, Komatsu PC210, JCB 3DX',
    last_updated: '2026-10-01T10:00:00Z',
  },
  {
    id: 'inv-002',
    name: 'Heavy Engine Oil 15W-40 CI-4',
    sku: 'OIL-ENG-15W40',
    category: 'Oils & Lubricants',
    quantity: 18,
    unit: 'Barrels (200L)',
    min_quantity: 15,
    unit_cost: 28000,
    location: 'Main Yard - Bay 1',
    supplier: 'Castrol CRB Turbomax',
    compatible_machines: 'All Fleet Diesel Engines',
    last_updated: '2026-10-02T11:30:00Z',
  },
  {
    id: 'inv-003',
    name: 'Engine Oil Filter Element 1R-0716',
    sku: 'FLT-CAT-320',
    category: 'Filters',
    quantity: 8,
    unit: 'Units',
    min_quantity: 12,
    unit_cost: 3200,
    location: 'Parts Store - Rack A2',
    supplier: 'GMMCO Caterpillar Spares',
    compatible_machines: 'CAT 320D3 Excavator, D6R Dozer',
    last_updated: '2026-10-03T09:15:00Z',
  },
  {
    id: 'inv-004',
    name: 'Hydraulic Return Filter Element',
    sku: 'FLT-HYD-KOM',
    category: 'Filters',
    quantity: 14,
    unit: 'Units',
    min_quantity: 8,
    unit_cost: 4800,
    location: 'Parts Store - Rack A3',
    supplier: 'Komatsu India Spares',
    compatible_machines: 'Komatsu PC210 Heavy Duty',
    last_updated: '2026-10-04T14:20:00Z',
  },
  {
    id: 'inv-005',
    name: 'Heavy Rock Chisel Bucket Teeth',
    sku: 'TEETH-EX-01',
    category: 'Wear Parts',
    quantity: 36,
    unit: 'Pieces',
    min_quantity: 24,
    unit_cost: 1650,
    location: 'Heavy Spares Yard - Rack 4',
    supplier: 'ESCO Ground Engaging Tools',
    compatible_machines: 'CAT 320D3, Komatsu PC210 Excavators',
    last_updated: '2026-10-05T08:45:00Z',
  },
  {
    id: 'inv-006',
    name: '2-Wire High Pressure Hydraulic Hose 3/4"',
    sku: 'HOSE-HYD-04',
    category: 'Hydraulics',
    quantity: 65,
    unit: 'Meters',
    min_quantity: 30,
    unit_cost: 950,
    location: 'Hose Assembly Workshop',
    supplier: 'Parker Hannifin India',
    compatible_machines: 'Universal Boom & Arm Hydraulics',
    last_updated: '2026-10-05T16:00:00Z',
  },
  {
    id: 'inv-007',
    name: 'Lithium Complex EP-2 High Temp Grease',
    sku: 'GREASE-EP2',
    category: 'Oils & Lubricants',
    quantity: 5,
    unit: 'Buckets (18kg)',
    min_quantity: 12,
    unit_cost: 5400,
    location: 'Main Yard - Bay 2',
    supplier: 'Mobil Mobilgrease XHP 222',
    compatible_machines: 'Track Rollers, Pins, Bushings & Turntables',
    last_updated: '2026-10-06T12:10:00Z',
  },
  {
    id: 'inv-008',
    name: 'Dual Radial Seal Primary Air Cleaner',
    sku: 'AIR-FLT-D6R',
    category: 'Filters',
    quantity: 0,
    unit: 'Units',
    min_quantity: 6,
    unit_cost: 6200,
    location: 'Parts Store - Rack B1',
    supplier: 'Donaldson Filtration',
    compatible_machines: 'CAT D6R Heavy Crawler Dozer',
    last_updated: '2026-10-06T15:30:00Z',
  },
  {
    id: 'inv-009',
    name: 'Dozer Cutting Edge End Bits Reversible',
    sku: 'BLD-CUT-01',
    category: 'Wear Parts',
    quantity: 6,
    unit: 'Sets',
    min_quantity: 4,
    unit_cost: 14200,
    location: 'Heavy Spares Yard - Rack 2',
    supplier: 'Black Cat Blades',
    compatible_machines: 'CAT D6R Crawler Blade',
    last_updated: '2026-10-07T10:00:00Z',
  },
  {
    id: 'inv-010',
    name: 'AUS 32 AdBlue / DEF Fluid',
    sku: 'DEF-ADBL-01',
    category: 'Safety & Consumables',
    quantity: 80,
    unit: 'Cans (20L)',
    min_quantity: 40,
    unit_cost: 1200,
    location: 'Fuel & Fluid Depot',
    supplier: 'IOCL CleanDiesel DEF',
    compatible_machines: 'BS-VI / Tier 4 Electronic Engines',
    last_updated: '2026-10-07T13:45:00Z',
  },
];

const CATEGORIES = ['All', 'Oils & Lubricants', 'Filters', 'Wear Parts', 'Hydraulics', 'Safety & Consumables'];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(DEFAULT_ITEMS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Modals state
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [countDialogOpen, setCountDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [targetCountItem, setTargetCountItem] = useState<InventoryItem | null>(null);
  const [countDelta, setCountDelta] = useState<number>(0);
  const [countMode, setCountMode] = useState<'add' | 'set'>('add');
  const [customValue, setCustomValue] = useState<string>('1');

  // Item Form
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('Oils & Lubricants');
  const [formQuantity, setFormQuantity] = useState('10');
  const [formUnit, setFormUnit] = useState('Units');
  const [formMinQuantity, setFormMinQuantity] = useState('5');
  const [formUnitCost, setFormUnitCost] = useState('2500');
  const [formLocation, setFormLocation] = useState('Main Yard - Bay 1');
  const [formCompatible, setFormCompatible] = useState('');

  // Fetch initial items
  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const res = await authFetch('/api/v1/inventory');
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data) && data.length > 0) {
            setItems(data);
          }
        }
      } catch {
        // Fallback to initial items
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Open Add/Update Item Dialog
  const handleOpenItemDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormSku(item.sku);
      setFormCategory(item.category);
      setFormQuantity(String(item.quantity));
      setFormUnit(item.unit);
      setFormMinQuantity(String(item.min_quantity));
      setFormUnitCost(String(item.unit_cost));
      setFormLocation(item.location);
      setFormCompatible(item.compatible_machines || '');
    } else {
      setEditingItem(null);
      setFormName('');
      setFormSku(`SKU-${Date.now().toString(36).toUpperCase()}`);
      setFormCategory('Oils & Lubricants');
      setFormQuantity('10');
      setFormUnit('Units');
      setFormMinQuantity('5');
      setFormUnitCost('2500');
      setFormLocation('Main Yard - Bay 1');
      setFormCompatible('');
    }
    setItemDialogOpen(true);
  };

  // Save Item (Add or Update)
  const handleSaveItem = async () => {
    if (!formName.trim()) return;

    const payload = {
      name: formName.trim(),
      sku: formSku.trim(),
      category: formCategory,
      quantity: Math.max(0, parseInt(formQuantity, 10) || 0),
      unit: formUnit.trim() || 'Units',
      min_quantity: Math.max(0, parseInt(formMinQuantity, 10) || 0),
      unit_cost: Math.max(0, parseInt(formUnitCost, 10) || 0),
      location: formLocation.trim() || 'Main Yard',
      compatible_machines: formCompatible.trim(),
      last_updated: new Date().toISOString(),
    };

    if (editingItem) {
      // Update existing item
      setItems((prev) =>
        prev.map((it) => (it.id === editingItem.id ? { ...it, ...payload } : it)),
      );
      try {
        await authFetch(`/api/v1/inventory/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        // Optimistically updated
      }
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: `inv-${Date.now().toString(36)}`,
        ...payload,
      };
      setItems((prev) => [newItem, ...prev]);
      try {
        await authFetch('/api/v1/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        // Optimistically updated
      }
    }

    setItemDialogOpen(false);
  };

  // Quick Inline Count Stepper (+1 / -1 directly on card)
  const handleStepCount = async (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, quantity: newQty, last_updated: new Date().toISOString() } : it)),
    );
    try {
      await authFetch(`/api/v1/inventory/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
    } catch {
      // Optimistically handled
    }
  };

  // Open Count Update Dialog
  const handleOpenCountDialog = (item: InventoryItem) => {
    setTargetCountItem(item);
    setCountMode('add');
    setCustomValue('5');
    setCountDialogOpen(true);
  };

  // Apply Count Update from Dialog
  const handleApplyCount = async () => {
    if (!targetCountItem) return;
    const val = parseInt(customValue, 10) || 0;
    const newQty = countMode === 'add' ? Math.max(0, targetCountItem.quantity + val) : Math.max(0, val);

    setItems((prev) =>
      prev.map((it) => (it.id === targetCountItem.id ? { ...it, quantity: newQty, last_updated: new Date().toISOString() } : it)),
    );

    try {
      await authFetch(`/api/v1/inventory/${targetCountItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
    } catch {
      // Optimistically handled
    }

    setCountDialogOpen(false);
  };

  // Delete Item
  const handleDeleteItem = async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      await authFetch(`/api/v1/inventory/${id}`, { method: 'DELETE' });
    } catch {
      // Optimistically handled
    }
  };

  // Summary KPIs
  const stats = useMemo(() => {
    const total = items.length;
    const outOfStock = items.filter((i) => i.quantity === 0).length;
    const lowStock = items.filter((i) => i.quantity > 0 && i.quantity <= i.min_quantity).length;
    const healthy = items.filter((i) => i.quantity > i.min_quantity).length;
    const totalValuation = items.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0);

    return { total, outOfStock, lowStock, healthy, totalValuation };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchSearch =
        it.name.toLowerCase().includes(search.toLowerCase()) ||
        it.sku.toLowerCase().includes(search.toLowerCase()) ||
        (it.compatible_machines && it.compatible_machines.toLowerCase().includes(search.toLowerCase())) ||
        it.location.toLowerCase().includes(search.toLowerCase());

      const matchCat = selectedCategory === 'All' || it.category === selectedCategory;

      let matchStatus = true;
      if (statusFilter === 'out_of_stock') matchStatus = it.quantity === 0;
      else if (statusFilter === 'low_stock') matchStatus = it.quantity > 0 && it.quantity <= it.min_quantity;
      else if (statusFilter === 'in_stock') matchStatus = it.quantity > it.min_quantity;

      return matchSearch && matchCat && matchStatus;
    });
  }, [items, search, selectedCategory, statusFilter]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Fleet Inventory & Spares</h1>
              <p className="text-xs text-slate-500">Manage lubricants, replacement filters, wear parts, and workshop yard stock</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => handleOpenItemDialog()}
            className="rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Items</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total}</p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Spares catalogued</p>
        </Card>

        <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Healthy Stock</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">{stats.healthy}</p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Above reorder minimum</p>
        </Card>

        <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Low Stock Alert</span>
          <p className="mt-2 text-2xl font-extrabold text-amber-700">{stats.lowStock}</p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Needs reordering</p>
        </Card>

        <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Out of Stock</span>
          <p className="mt-2 text-2xl font-extrabold text-red-700">{stats.outOfStock}</p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Critical inventory zero</p>
        </Card>

        <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Total Valuation</span>
          <p className="mt-2 text-2xl font-extrabold text-indigo-700">₹{(stats.totalValuation / 100000).toFixed(1)}L</p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Asset value in yard</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search spare name, SKU code, machine model, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs rounded-xl border-slate-200 h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'low_stock' ? 'all' : 'low_stock')}
              className={cn(
                'px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                statusFilter === 'low_stock' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-100',
              )}
            >
              Low Stock
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
              className={cn(
                'px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                statusFilter === 'out_of_stock' ? 'bg-red-100 text-red-800' : 'text-slate-500 hover:bg-slate-100',
              )}
            >
              Zero Stock
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Item Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isOutOfStock = item.quantity === 0;
          const isLowStock = !isOutOfStock && item.quantity <= item.min_quantity;
          const pct = item.min_quantity > 0 ? Math.min(100, Math.round((item.quantity / item.min_quantity) * 100)) : 100;

          return (
            <Card
              key={item.id}
              className={cn(
                'rounded-2xl border bg-white shadow-xs transition-all hover:border-slate-300 flex flex-col justify-between overflow-hidden',
                isOutOfStock ? 'border-red-200 bg-red-50/10' : isLowStock ? 'border-amber-200' : 'border-slate-200',
              )}
            >
              <div className="p-5">
                {/* Header with SKU and Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {item.sku}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{item.name}</h3>
                    <p className="text-[11px] text-slate-500">{item.category}</p>
                  </div>

                  <span
                    className={cn(
                      'shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                      isOutOfStock
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : isLowStock
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    )}
                  >
                    {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Big Stock Counter & In-Stock Ratio */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-500">Current Stock</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={cn('text-2xl font-black tracking-tight', isOutOfStock ? 'text-red-700' : isLowStock ? 'text-amber-700' : 'text-slate-900')}>
                        {item.quantity}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">/ {item.min_quantity} min</span>
                      <span className="text-[11px] text-slate-400 font-medium ml-1">({item.unit})</span>
                    </div>
                  </div>

                  {/* Inline Step Counter Controls on Item Card */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleStepCount(item, -1)}
                      disabled={item.quantity <= 0}
                      className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      title="Decrease stock"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-slate-900">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleStepCount(item, 1)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      title="Increase stock"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Stock Progress Bar */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Stock Threshold: {pct}%</span>
                    <span>Min Target: {item.min_quantity}</span>
                  </div>
                  <Progress
                    value={pct}
                    className={cn('h-1.5 bg-slate-100', isOutOfStock ? '[&>div]:bg-red-500' : isLowStock ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500')}
                  />
                </div>

                {/* Details list */}
                <div className="mt-3.5 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Storage:</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Unit Cost:</span>
                    <span className="font-semibold text-slate-800 text-[11px]">₹{item.unit_cost.toLocaleString('en-IN')}</span>
                  </div>
                  {item.compatible_machines && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Fleet Fit:</span>
                      <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[170px]" title={item.compatible_machines}>
                        {item.compatible_machines}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons on Item Card */}
              <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Update Count Button on Card */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenCountDialog(item)}
                  className="h-7 text-xs rounded-xl border-slate-200 font-semibold bg-white text-slate-800 hover:bg-slate-100 flex items-center gap-1"
                >
                  <PlusCircle className="h-3 w-3 text-indigo-600" />
                  Update Count
                </Button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenItemDialog(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Edit Item Details"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
          <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No Inventory Items Found</h4>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your category filter or search keywords.</p>
        </div>
      )}

      {/* =========================================================================
          DIALOG 1: ADD OR UPDATE ITEM DETAILS
          ========================================================================= */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingItem ? 'Update Item Details' : 'Add New Inventory Item'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {editingItem
                ? 'Modify stock thresholds, item description, and fleet compatibility.'
                : 'Enter details to catalogue a new spare part, fluid, or component in yard inventory.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Item Name</Label>
              <Input
                placeholder="e.g. Engine Oil Filter Element 1R-0716"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">SKU / Code</Label>
                <Input
                  placeholder="e.g. FLT-CAT-320"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="mt-1 text-xs rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Category</Label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="mt-1 w-full text-xs rounded-xl border border-slate-200 h-9 px-3 bg-white"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Quantity</Label>
                <Input
                  type="number"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  className="mt-1 text-xs rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Min Threshold</Label>
                <Input
                  type="number"
                  value={formMinQuantity}
                  onChange={(e) => setFormMinQuantity(e.target.value)}
                  className="mt-1 text-xs rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Unit Type</Label>
                <Input
                  placeholder="Units, Barrels"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="mt-1 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Unit Cost (₹)</Label>
                <Input
                  type="number"
                  value={formUnitCost}
                  onChange={(e) => setFormUnitCost(e.target.value)}
                  className="mt-1 text-xs rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Yard Storage Location</Label>
                <Input
                  placeholder="Main Yard - Bay 1"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="mt-1 text-xs rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Compatible Machine Fleet</Label>
              <Input
                placeholder="e.g. CAT 320D3, Komatsu PC210"
                value={formCompatible}
                onChange={(e) => setFormCompatible(e.target.value)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => setItemDialogOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveItem} className="rounded-xl bg-slate-900 text-white text-xs font-semibold">
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DIALOG 2: QUICK COUNT UPDATE MODAL (Requested on items card)
          ========================================================================= */}
      <Dialog open={countDialogOpen} onOpenChange={setCountDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Update Stock Count
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Adjust in-stock count for <strong>{targetCountItem?.name}</strong> ({targetCountItem?.unit}).
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-600 font-medium">Current Stock on Hand:</span>
              <span className="text-base font-bold text-slate-900">
                {targetCountItem?.quantity} {targetCountItem?.unit}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCountMode('add')}
                className={cn(
                  'p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                  countMode === 'add'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                + Add / Receive Stock
              </button>
              <button
                type="button"
                onClick={() => setCountMode('set')}
                className={cn(
                  'p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                  countMode === 'set'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                Set Exact Physical Count
              </button>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">
                {countMode === 'add' ? 'Quantity to Add / Restock:' : 'New Total Quantity on Hand:'}
              </Label>
              <Input
                type="number"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="mt-1 text-base font-bold rounded-xl h-10"
              />
            </div>
          </div>

          <DialogFooter className="mt-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => setCountDialogOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleApplyCount} className="rounded-xl bg-slate-900 text-white text-xs font-semibold">
              Confirm Count Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
