import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, Package, Armchair, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useFleet } from '../context/FleetContext';
import { type InventoryItem } from '../data/mockData';

const inputCls = 'bg-app-bg border border-app-line rounded-lg px-3 py-1.5 text-white text-sm w-full focus:outline-none focus:border-blue-500';

const CONDITIONS = ['ISPRAVNO', 'OŠTEĆENO', 'U POPRAVCI', 'RASHODOVANO'];
const IT_TYPES = ['LAP TOPOVI', 'MIŠEVI', 'TASTATURE', 'MONITORI', 'DEKOVI', 'TELEFONI', 'PUNJAČI', 'DRONOVI', 'KOMPJUTERI'];
const FURNITURE_TYPES = ['RADNI STO', 'STOLICA', 'ORMAN', 'KONFERENCIJSKI STO', 'KONFERENCIJSKA STOLICA', 'POLICA', 'FOTELJA', 'LOKER', 'KONTEJNER', 'OSTALO'];

function ConditionBadge({ condition }: { condition: string }) {
  const colors: Record<string, string> = {
    'ISPRAVNO': 'bg-green-500/10 text-green-400 border-green-500/20',
    'OŠTEĆENO': 'bg-red-500/10 text-red-400 border-red-500/20',
    'U POPRAVCI': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'RASHODOVANO': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[condition] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      {condition}
    </span>
  );
}

function EditModal({ item, employees, onSave, onClose }: {
  item: InventoryItem | null;
  employees: string[];
  onSave: (data: Partial<InventoryItem>) => void;
  onClose: () => void;
}) {
  const isIT = item?.category === 'IT';
  const [form, setForm] = useState<Partial<InventoryItem>>(item ? { ...item } : {
    category: 'IT', itemType: 'LAP TOPOVI', condition: 'ISPRAVNO', barcodeId: '',
  });

  const set = (key: keyof InventoryItem, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-app-surface border border-app-line rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-app-line">
          <h3 className="text-white font-semibold text-lg">{item ? 'Uredi stavku' : 'Nova stavka'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Barcode ID</label>
              <input className={inputCls} value={form.barcodeId ?? ''} onChange={e => set('barcodeId', e.target.value)} />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Kategorija</label>
              <select className={inputCls} value={form.category ?? 'IT'} onChange={e => set('category', e.target.value as any)}>
                <option value="IT">IT Oprema</option>
                <option value="Namestaj">Nameštaj</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Tip</label>
              <select className={inputCls} value={form.itemType ?? ''} onChange={e => set('itemType', e.target.value)}>
                {(form.category === 'Namestaj' ? FURNITURE_TYPES : IT_TYPES).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Stanje</label>
              <select className={inputCls} value={form.condition ?? 'ISPRAVNO'} onChange={e => set('condition', e.target.value)}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {form.category === 'IT' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Proizvođač</label>
                <input className={inputCls} value={form.manufacturer ?? ''} onChange={e => set('manufacturer', e.target.value)} />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Model</label>
                <input className={inputCls} value={form.model ?? ''} onChange={e => set('model', e.target.value)} />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Serijski broj</label>
                <input className={inputCls} value={form.serialNumber ?? ''} onChange={e => set('serialNumber', e.target.value)} />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Godina</label>
                <input className={inputCls} type="number" value={form.year ?? ''} onChange={e => set('year', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Materijal</label>
                <input className={inputCls} value={form.material ?? ''} onChange={e => set('material', e.target.value)} />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Boja / Opis</label>
                <input className={inputCls} value={form.colorDesc ?? ''} onChange={e => set('colorDesc', e.target.value)} />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Dimenzije</label>
                <input className={inputCls} value={form.dimensions ?? ''} onChange={e => set('dimensions', e.target.value)} />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Godina</label>
                <input className={inputCls} type="number" value={form.year ?? ''} onChange={e => set('year', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Zaposleni</label>
              <select className={inputCls} value={form.employeeName ?? ''} onChange={e => set('employeeName', e.target.value)}>
                <option value="">— Nije dodeljeno —</option>
                {employees.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Lokacija</label>
              <input className={inputCls} value={form.location ?? ''} onChange={e => set('location', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Služba / Sektor</label>
              <input className={inputCls} value={form.department ?? ''} onChange={e => set('department', e.target.value)} />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Datum zaduženja</label>
              <input className={inputCls} value={form.assignedDate ?? ''} onChange={e => set('assignedDate', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Napomena</label>
            <input className={inputCls} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-app-line">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">Otkaži</button>
          <button
            onClick={() => onSave(form)}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <Save className="w-4 h-4" /> Sačuvaj
          </button>
        </div>
      </div>
    </div>
  );
}

export function InventoryAdminPage() {
  const { inventoryItems, employees, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useFleet();

  const [activeCategory, setActiveCategory] = useState<'all' | 'IT' | 'Namestaj'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null | 'new'>('new' as any);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const employeeNames = useMemo(() => {
    const names = new Set<string>();
    inventoryItems.forEach(i => { if (i.employeeName) names.add(i.employeeName); });
    employees.forEach(e => names.add(e.name));
    return Array.from(names).sort();
  }, [inventoryItems, employees]);

  const filtered = useMemo(() => {
    return inventoryItems.filter(item => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.barcodeId.toLowerCase().includes(q) ||
          item.itemType.toLowerCase().includes(q) ||
          (item.manufacturer ?? '').toLowerCase().includes(q) ||
          (item.model ?? '').toLowerCase().includes(q) ||
          (item.serialNumber ?? '').toLowerCase().includes(q) ||
          (item.employeeName ?? '').toLowerCase().includes(q) ||
          (item.department ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inventoryItems, activeCategory, searchQuery]);

  const itCount = inventoryItems.filter(i => i.category === 'IT').length;
  const furnitureCount = inventoryItems.filter(i => i.category === 'Namestaj').length;

  const handleSave = (data: Partial<InventoryItem>) => {
    if (editingItem && editingItem !== 'new') {
      updateInventoryItem(editingItem.id, data);
    } else {
      addInventoryItem(data as Omit<InventoryItem, 'id'>);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    if (confirm(`Obrisati stavku ${item.barcodeId} — ${item.itemType}?`)) {
      deleteInventoryItem(item.id);
    }
  };

  const exportToExcel = () => {
    const rows = filtered.map(item => ({
      'Barcode ID': item.barcodeId,
      'Kategorija': item.category === 'IT' ? 'IT Oprema' : 'Nameštaj',
      'Tip': item.itemType,
      'Proizvođač': item.manufacturer ?? '',
      'Model': item.model ?? '',
      'Serijski broj': item.serialNumber ?? '',
      'Materijal': item.material ?? '',
      'Boja / Opis': item.colorDesc ?? '',
      'Dimenzije': item.dimensions ?? '',
      'Godina': item.year ?? '',
      'Stanje': item.condition,
      'Zaposleni': item.employeeName ?? '',
      'Služba / Sektor': item.department ?? '',
      'Lokacija': item.location ?? '',
      'Datum zaduženja': item.assignedDate ?? '',
      'Napomena': item.notes ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventar');

    const colWidths = [
      { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 18 },
      { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 8 },
      { wch: 12 }, { wch: 22 }, { wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 24 },
    ];
    ws['!cols'] = colWidths;

    const label = activeCategory === 'all' ? 'svi' : activeCategory === 'IT' ? 'IT' : 'namestaj';
    XLSX.writeFile(wb, `inventar_${label}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-app-surface border border-app-line rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Ukupno IT</p>
              <p className="text-white text-2xl font-bold">{itCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-app-surface border border-app-line rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Armchair className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Ukupno Nameštaj</p>
              <p className="text-white text-2xl font-bold">{furnitureCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-app-surface border border-app-line rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Ukupno stavki</p>
              <p className="text-white text-2xl font-bold">{inventoryItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main table */}
      <div className="bg-app-surface border border-app-line rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-xl">Inventar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" /> Izvezi Excel
            </button>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Nova stavka
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex gap-1">
            {(['all', 'IT', 'Namestaj'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-app-hover'
                }`}
              >
                {cat === 'all' ? 'Sve' : cat === 'IT' ? 'IT Oprema' : 'Nameštaj'}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="bg-app-bg border border-app-line rounded-lg pl-9 pr-3 py-2 text-white text-sm w-full focus:outline-none focus:border-blue-500"
              placeholder="Pretraži po barcode-u, tipu, zaposlenom..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="text-gray-400 text-sm">{filtered.length} stavki</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-app-line">
                {['Barcode', 'Tip', 'Proizvođač / Model', 'Serijski br.', 'Stanje', 'Zaposleni', 'Služba', 'Lokacija', ''].map(h => (
                  <th key={h} className="text-left text-gray-400 font-medium py-3 px-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-gray-500 py-12">Nema stavki</td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="border-b border-app-line/50 hover:bg-app-hover/20">
                    <td className="py-2.5 px-3">
                      <span className={`font-mono text-xs px-2 py-0.5 rounded ${item.category === 'IT' ? 'bg-blue-500/10 text-blue-300' : 'bg-purple-500/10 text-purple-300'}`}>
                        {item.barcodeId}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white">{item.itemType}</td>
                    <td className="py-2.5 px-3 text-gray-300">
                      {item.category === 'IT'
                        ? [item.manufacturer, item.model].filter(Boolean).join(' ') || '—'
                        : [item.material, item.dimensions].filter(Boolean).join(' / ') || '—'
                      }
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 font-mono text-xs">{item.serialNumber || '—'}</td>
                    <td className="py-2.5 px-3"><ConditionBadge condition={item.condition} /></td>
                    <td className="py-2.5 px-3 text-gray-300">{item.employeeName || '—'}</td>
                    <td className="py-2.5 px-3 text-gray-400 text-xs max-w-[160px] truncate">{item.department || '—'}</td>
                    <td className="py-2.5 px-3 text-gray-400 text-xs">{item.location || '—'}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <EditModal
          item={editingItem as InventoryItem | null}
          employees={employeeNames}
          onSave={handleSave}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}
