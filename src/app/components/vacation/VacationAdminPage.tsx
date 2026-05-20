import { useState, Fragment } from 'react';
import { Save, X, CheckCircle, Clock, XCircle, Trash2, Edit, Plus, UserPlus, Download, FileDown, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle,
} from 'docx';
import { calcVacationDays } from '../../data/vacationTypes';
import { useVacation } from '../../context/VacationContext';
import { type VacationRequest } from '../../data/vacationTypes';
import { type Employee } from '../../data/mockData';

export function VacationAdminPage() {
  const { currentUser } = useVacation();
  const isFullAdmin = currentUser.vacationRole === 'admin';

  const [activeTab, setActiveTab] = useState<'requests' | 'employees'>(
    isFullAdmin ? 'employees' : 'requests'
  );

  const tabs = [
    ...(isFullAdmin ? [{ id: 'employees' as const, label: 'Employees' }] : []),
    { id: 'requests' as const, label: 'All Requests' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-app-surface border border-app-line rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Admin Panel</h2>

        <div className="flex gap-1 mb-6 border-b border-app-line">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-medium whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-green-400 border-green-500'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'employees' && isFullAdmin && <EmployeesTab />}
        {activeTab === 'requests' && <RequestsTab />}
      </div>
    </div>
  );
}

// ── Employees Tab ──────────────────────────────────────────────────────────────

const emptyForm = {
  name: '', email: '', sector: '', vacationDaysTotal: 20, vacationRole: 'user',
  jobTitle: '', educationLevel: '' as '' | 'SSS' | 'VSS', nesStartDate: '',
  hasChildrenUnder15: false, isSingleParent: false,
};

type EditData = {
  vacationDaysTotal: number; vacationRole: string;
  jobTitle: string; educationLevel: '' | 'SSS' | 'VSS'; nesStartDate: string;
  hasChildrenUnder15: boolean; isSingleParent: boolean;
};

function EmployeesTab() {
  const { employees, departments, updateEmployeeVacation, addEmployee, deleteEmployee, getUsedDays } = useVacation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData>({
    vacationDaysTotal: 20, vacationRole: 'user',
    jobTitle: '', educationLevel: '', nesStartDate: '',
    hasChildrenUnder15: false, isSingleParent: false,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmp, setNewEmp] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const topLevelDepts = departments.filter(d => !d.parent);
  const subDepts = (parentId: string) => departments.filter(d => d.parent === parentId);

  const exportToExcel = () => {
    const exportDate = new Date().toLocaleDateString('en-GB');
    const rows = employees.map(emp => {
      const used = getUsedDays(emp.id);
      const total = emp.vacationDaysTotal ?? 20;
      return {
        'Name':             emp.name,
        'Email':            emp.email,
        'Sector':           emp.sector,
        'Vacation Role':    emp.vacationRole === 'admin' ? 'Admin' : emp.vacationRole === 'sector_admin' ? 'Sector Admin' : 'Employee',
        'Total Days':       total,
        'Used Days (YTD)':  used,
        'Remaining Days':   total - used,
        'Export Date':      exportDate,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [20, 30, 20, 15, 12, 16, 16, 14].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, `employees_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email || !newEmp.sector) return;
    setSaving(true);
    await addEmployee({ ...newEmp, password: 'fleet2026' });
    setSaving(false);
    setNewEmp(emptyForm);
    setShowAddForm(false);
  };

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditData({
      vacationDaysTotal: emp.vacationDaysTotal ?? 20,
      vacationRole: emp.vacationRole ?? 'user',
      jobTitle: emp.jobTitle ?? '',
      educationLevel: (emp.educationLevel ?? '') as '' | 'SSS' | 'VSS',
      nesStartDate: emp.nesStartDate ?? '',
      hasChildrenUnder15: emp.hasChildrenUnder15 ?? false,
      isSingleParent: emp.isSingleParent ?? false,
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateEmployeeVacation(editingId, editData);
    setEditingId(null);
  };

  const recalcEdit = () => {
    const calc = calcVacationDays(editData);
    setEditData(p => ({ ...p, vacationDaysTotal: calc }));
  };

  const roleLabel = (role: string) => {
    if (role === 'admin') return 'Admin';
    if (role === 'sector_admin') return 'Sector Admin';
    return 'Employee';
  };

  const roleColor = (role: string) => {
    if (role === 'admin') return 'bg-purple-500/20 text-purple-400';
    if (role === 'sector_admin') return 'bg-green-500/20 text-green-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Employees ({employees.length})</h3>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-app-bg border border-app-line-muted hover:border-gray-500 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={() => { setShowAddForm(v => !v); setNewEmp(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-app-bg border border-green-500/30 rounded-xl p-5 mb-5 space-y-4">
          <h4 className="text-white font-medium flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-400" /> New Employee
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Full Name *</label>
              <input type="text" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} required placeholder="Nikola Luković" className={inputCls} />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Email *</label>
              <input type="email" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} required placeholder="ime@nes.rs" className={inputCls} />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Job Title</label>
              <input type="text" value={newEmp.jobTitle} onChange={e => setNewEmp({ ...newEmp, jobTitle: e.target.value })} placeholder="Direktor tehničkih operacija" className={inputCls} />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Sector *</label>
              <select value={newEmp.sector} onChange={e => setNewEmp({ ...newEmp, sector: e.target.value })} required className={inputCls}>
                <option value="">Select sector</option>
                {topLevelDepts.map(dept => (
                  <optgroup key={dept.id} label={dept.name}>
                    <option value={dept.name}>{dept.name}</option>
                    {subDepts(dept.id).map(sub => (
                      <option key={sub.id} value={`${dept.name} - ${sub.name}`}>{dept.name} - {sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Stručna sprema</label>
              <select value={newEmp.educationLevel} onChange={e => setNewEmp({ ...newEmp, educationLevel: e.target.value as any, vacationDaysTotal: calcVacationDays({ ...newEmp, educationLevel: e.target.value }) })} className={inputCls}>
                <option value="">—</option>
                <option value="SSS">SSS (+3 dana)</option>
                <option value="VSS">VŠS/VSS (+4 dana)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Datum početka rada u NES</label>
              <input type="date" value={newEmp.nesStartDate} onChange={e => setNewEmp({ ...newEmp, nesStartDate: e.target.value, vacationDaysTotal: calcVacationDays({ ...newEmp, nesStartDate: e.target.value }) })} className={inputCls} />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Vacation Role</label>
              <select value={newEmp.vacationRole} onChange={e => setNewEmp({ ...newEmp, vacationRole: e.target.value })} className={inputCls}>
                <option value="user">Employee</option>
                <option value="sector_admin">Sector Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Vacation Days / Year</label>
              <input type="number" min={0} max={365} value={newEmp.vacationDaysTotal} onChange={e => setNewEmp({ ...newEmp, vacationDaysTotal: parseInt(e.target.value) || 0 })} className={inputCls} />
            </div>
            <div className="flex flex-col gap-2 justify-center pt-3">
              <label className="flex items-center gap-2 text-gray-400 text-xs cursor-pointer">
                <input type="checkbox" checked={newEmp.hasChildrenUnder15} onChange={e => setNewEmp({ ...newEmp, hasChildrenUnder15: e.target.checked, vacationDaysTotal: calcVacationDays({ ...newEmp, hasChildrenUnder15: e.target.checked }) })} className="accent-green-500" />
                Roditelj dece do 15g (+1 dan)
              </label>
              <label className="flex items-center gap-2 text-gray-400 text-xs cursor-pointer">
                <input type="checkbox" checked={newEmp.isSingleParent} onChange={e => setNewEmp({ ...newEmp, isSingleParent: e.target.checked, vacationDaysTotal: calcVacationDays({ ...newEmp, isSingleParent: e.target.checked }) })} className="accent-green-500" />
                Samohrani roditelj (+1 dan)
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-app-line-muted text-gray-400 rounded-lg text-sm hover:bg-app-hover transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg text-sm transition-colors font-medium">{saving ? 'Saving...' : 'Add Employee'}</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-app-line">
              {['Name', 'Email', 'Sector', 'Vacation Role', 'Total Days', 'Used', 'Remaining', ''].map(h => (
                <th key={h} className="text-left text-gray-400 text-sm font-medium py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              const used = getUsedDays(emp.id);
              const remaining = (emp.vacationDaysTotal ?? 20) - used;
              return (
                <Fragment key={emp.id}>
                  <tr className="border-b border-app-line hover:bg-app-hover/20">
                    <td className="py-3 px-4">
                      <p className="text-white">{emp.name}</p>
                      {emp.jobTitle
                        ? <p className="text-gray-500 text-xs mt-0.5">{emp.jobTitle}</p>
                        : <p className="text-gray-600 text-xs mt-0.5 italic">radno mesto nije uneto</p>
                      }
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {emp.educationLevel
                          ? <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400">{emp.educationLevel}</span>
                          : <span className="px-1.5 py-0.5 rounded text-xs bg-gray-500/10 text-gray-600">SS?</span>
                        }
                        {emp.nesStartDate
                          ? <span className="px-1.5 py-0.5 rounded text-xs bg-gray-500/10 text-gray-400">
                              {Math.floor((Date.now() - new Date(emp.nesStartDate).getTime()) / (365.25 * 24 * 3600 * 1000))}g NES
                            </span>
                          : <span className="px-1.5 py-0.5 rounded text-xs bg-gray-500/10 text-gray-600">staž?</span>
                        }
                        {emp.hasChildrenUnder15 && <span className="px-1.5 py-0.5 rounded text-xs bg-gray-500/10 text-gray-400">deca &lt;15g</span>}
                        {emp.isSingleParent && <span className="px-1.5 py-0.5 rounded text-xs bg-gray-500/10 text-gray-400">sam. roditelj</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{emp.email}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{emp.sector}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${roleColor(emp.vacationRole ?? 'user')}`}>
                        {roleLabel(emp.vacationRole ?? 'user')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{emp.vacationDaysTotal ?? 20}</td>
                    <td className="py-3 px-4 text-gray-400">{used}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${remaining <= 3 ? 'text-red-400' : remaining <= 7 ? 'text-orange-400' : 'text-green-400'}`}>{remaining}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-end">
                        <IconBtn icon={editingId === emp.id ? X : Edit} color={editingId === emp.id ? 'gray' : 'blue'} onClick={() => editingId === emp.id ? setEditingId(null) : startEdit(emp)} />
                        <IconBtn icon={Trash2} color="red" onClick={() => confirm('Delete this employee?') && deleteEmployee(emp.id)} />
                      </div>
                    </td>
                  </tr>
                  {editingId === emp.id && (
                    <tr className="bg-app-hover/10">
                      <td colSpan={8} className="px-4 pb-4 pt-2">
                        <div className="bg-app-bg border border-green-500/30 rounded-xl p-4 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Job Title / Radno mesto</label>
                              <input type="text" value={editData.jobTitle} onChange={e => setEditData(p => ({ ...p, jobTitle: e.target.value }))} placeholder="Direktor tehničkih operacija" className={inputCls} />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Stručna sprema</label>
                              <select value={editData.educationLevel} onChange={e => setEditData(p => ({ ...p, educationLevel: e.target.value as any }))} className={inputCls}>
                                <option value="">—</option>
                                <option value="SSS">SSS (+3 dana)</option>
                                <option value="VSS">VŠS/VSS (+4 dana)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Datum početka rada u NES</label>
                              <input type="date" value={editData.nesStartDate} onChange={e => setEditData(p => ({ ...p, nesStartDate: e.target.value }))} className={inputCls} />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Vacation Role</label>
                              <select value={editData.vacationRole} onChange={e => setEditData(p => ({ ...p, vacationRole: e.target.value }))} className={inputCls}>
                                <option value="user">Employee</option>
                                <option value="sector_admin">Sector Admin</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Vacation Days / Year</label>
                              <div className="flex gap-1">
                                <input type="number" min={0} max={365} value={editData.vacationDaysTotal} onChange={e => setEditData(p => ({ ...p, vacationDaysTotal: parseInt(e.target.value) || 0 }))} className={inputCls} />
                                <button type="button" onClick={recalcEdit} title="Auto-izračunaj iz kriterijuma" className="flex-shrink-0 px-2 py-1 bg-green-600/20 border border-green-600/40 text-green-400 rounded text-xs hover:bg-green-600/30 transition-colors">
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 justify-center">
                              <label className="flex items-center gap-2 text-gray-400 text-xs cursor-pointer">
                                <input type="checkbox" checked={editData.hasChildrenUnder15} onChange={e => setEditData(p => ({ ...p, hasChildrenUnder15: e.target.checked }))} className="accent-green-500" />
                                Roditelj dece do 15g (+1 dan)
                              </label>
                              <label className="flex items-center gap-2 text-gray-400 text-xs cursor-pointer">
                                <input type="checkbox" checked={editData.isSingleParent} onChange={e => setEditData(p => ({ ...p, isSingleParent: e.target.checked }))} className="accent-green-500" />
                                Samohrani roditelj (+1 dan)
                              </label>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 border-t border-app-line pt-3">
                            <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border border-app-line-muted text-gray-400 rounded-lg text-sm hover:bg-app-hover transition-colors">Cancel</button>
                            <button type="button" onClick={saveEdit} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors font-medium flex items-center gap-1.5">
                              <Save className="w-3.5 h-3.5" /> Save
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Requests Tab ───────────────────────────────────────────────────────────────

function nextWorkingDay(dateStr: string): Date {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}

function fmtSR(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d + 'T00:00:00') : d;
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}.`;
}

const FONT = 'Calibri';
const SZ = 21; // 10.5pt in half-points
const LINE_115 = 276; // 1.15 line spacing (276 = 240 × 1.15)
const DIRECTOR = 'Miloš Colić';
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } as const;

function tr(text: string, bold = false): TextRun {
  return new TextRun({ text, font: FONT, size: SZ, bold });
}

function body(runs: TextRun[], opts: { center?: boolean; indent?: number; spaceAfter?: number } = {}): Paragraph {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.BOTH,
    indent: opts.indent !== undefined ? { left: opts.indent } : { right: -540 },
    spacing: { after: opts.spaceAfter ?? 160, line: LINE_115, lineRule: 'auto' as any },
    children: runs,
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.BOTH,
    indent: { left: 720, hanging: 360, right: -540 },
    spacing: { after: 0, line: LINE_115, lineRule: 'auto' as any },
    children: [tr('•  ' + text)],
  });
}

function subBullet(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.BOTH,
    indent: { left: 1080, right: -540 },
    spacing: { after: 0, line: LINE_115, lineRule: 'auto' as any },
    children: [tr(text)],
  });
}

function dostaviti(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    indent: { left: 720, hanging: 360, right: -540 },
    spacing: { after: 0, line: LINE_115, lineRule: 'auto' as any },
    children: [tr('•  ' + text)],
  });
}

async function downloadResenje(req: VacationRequest, emp: Employee | undefined, remainingDays: number) {
  const year = new Date(req.startDate + 'T00:00:00').getFullYear();
  const returnDate = nextWorkingDay(req.endDate);
  const jobTitle = emp?.jobTitle ?? '___________________';
  const totalDays = (emp?.educationLevel || emp?.nesStartDate)
    ? calcVacationDays(emp!)
    : (emp?.vacationDaysTotal ?? 20);
  const docDate = req.approvedAt ? fmtSR(new Date(req.approvedAt)) : fmtSR(new Date());

  // Fetch logo
  let logoImage: Uint8Array | undefined;
  try {
    const resp = await fetch('/logo.jpg');
    logoImage = new Uint8Array(await resp.arrayBuffer());
  } catch { /* skip logo if unavailable */ }

  // Signature table: date left | line + name + title right
  const sigTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideH: NO_BORDER, insideV: NO_BORDER },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            children: [new Paragraph({ children: [tr(`U Beogradu, ${docDate} godine`)] })],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
              bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
            },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [tr(DIRECTOR)] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [tr('Direktor')] }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    creator: 'NES Fleet & Leave',
    sections: [{
      properties: { page: { margin: { top: 90, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        // Logo top-right
        ...(logoImage ? [new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 200, line: LINE_115, lineRule: 'auto' as any },
          children: [new ImageRun({ data: logoImage, transformation: { width: 180, height: 110 } })],
        })] : [new Paragraph({ children: [tr('')], spacing: { after: 200 } })]),

        // Legal preamble
        body([tr('Na osnovu člana 68. do 70. i 75. Zakona o radu („Sl. glasnik RS”, br. 24/2005, 61/2005, 32/2013 i 75/2014), a u skladu s ugovorom o radu,')]),
        body([tr(`Generalni direktor, NEW ENERGY SOLUTIONS DOO Tošin bunar 270, 11000, Beograd-Novi Beograd, Srbija, ${DIRECTOR}, donosi:`)]),

        // Empty line before REŠENJE
        new Paragraph({ children: [tr('')], spacing: { after: 0, line: LINE_115, lineRule: 'auto' as any } }),

        // REŠENJE title
        new Paragraph({
          alignment: AlignmentType.LEFT,
          indent: { left: 2880, firstLine: 1080 },
          spacing: { after: 60, line: LINE_115, lineRule: 'auto' as any },
          children: [new TextRun({ text: 'REŠENJE', font: FONT, size: 36, bold: true })],
        }),

        // Subtitle
        body([tr(`O KORIŠĆENJU GODIŠNJEG ODMORA ZA ${year}. GODINU`, true)], { center: true, spaceAfter: 240 }),

        // First paragraph
        body([
          tr(` Zaposleni `), tr(req.employeeName),
          tr(' na radnom mestu '), tr(jobTitle),
          tr(`, utvrđuje se pravo na godišnji odmor za ${year}. godinu, u trajanju od `),
          tr(`${totalDays} radnih dana`), tr('.'),
        ]),

        // Second paragraph
        body([
          tr(` Prema planu korišćenja godišnjih odmora, zaposleni će koristiti godišnji odmor (u trajanju od `),
          tr(`${req.daysCount} radnih dana`),
          tr(') u periodu od '), tr(fmtSR(req.startDate)),
          tr(' do '), tr(fmtSR(req.endDate)),
          tr(' godine, s tim da se na posao javi '), tr(fmtSR(returnDate)),
          tr(' godine.'),
        ]),

        // Pravilnik
        body([tr('U skladu sa Pravilnikom o radu od 01.05.2019. godine na osnovu člana broj 25, dužina godišnjeg odmora utvrđuje se tako što se zakonski minimum od 20 radnih dana uvećava po osnovu sledećih kriterijuma:')], { spaceAfter: 60 }),

        bullet('Za poslove sa srednjom stručnom spremom - 3 radna dana,'),
        bullet('Za poslove sa višom i visokom stručnom spremom - 4 radna dana.'),
        bullet('Po osnovu staža osiguranja u New Energy Solutions i to:'),
        subBullet('- za staž osiguranja do 3 godine 1 radni dan,'),
        subBullet('- za staž osiguranja od 3 do 5 godina 2 radna dana,'),
        subBullet('- za staž osiguranja od 5 do 15 godina 3 radna dana,'),
        subBullet('- za staž osiguranja od 15 godina 4 radna dana,'),
        bullet('Za roditelje sa decom do 15 godina 1 radni dan,'),
        bullet('Za samohrane roditelje 1 radni dan'),

        new Paragraph({ children: [tr('')], spacing: { after: 80 } }),

        body([tr('Bez obzira na gore navedeno, ukupno trajanje godišnjeg odmora u toku jedne godine ne može biti duže od 27 radnih dana.')]),

        // Remaining + finality in one paragraph
        body([
          tr(`Ukupan broj preostalih dana za ${year}. godinu počev od `),
          tr(fmtSR(returnDate)), tr(' iznosi '), tr(`${remainingDays} dana`), tr('. '),
          tr('Ovo rešenje je konačno', true), tr('.'),
        ]),

        new Paragraph({ children: [tr('')], spacing: { after: 80 } }),

        // Legal notice
        body([tr('Pouka o pravnom leku', true), tr(': protiv ovog rešenja zaposleni može pokrenuti spor pred nadležnim opštinskim sudom u roku od 90 dana od dana dostavljanja ovog rešenja.')]),

        // Dostaviti
        body([tr('Dostaviti', true), tr(':')], { spaceAfter: 40 }),
        dostaviti('Zaposlenom'),
        dostaviti('Knjigovodstvenoj službi'),
        dostaviti('Arhivi'),

        new Paragraph({ children: [tr('')], spacing: { after: 400 } }),

        // Signature
        sigTable,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Resenje_${req.employeeName.replace(/\s+/g, '_')}_${req.startDate}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function RequestsTab() {
  const { currentUser, employees, vacationRequests, approveRequest, rejectRequest, deleteRequest, getRemainingDays } = useVacation();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const isFullAdmin = currentUser.vacationRole === 'admin';

  const visible = vacationRequests.filter(r => {
    if (!isFullAdmin) {
      const parentSector = r.sector.includes(' - ') ? r.sector.split(' - ')[0] : r.sector;
      if (parentSector !== currentUser.sector && r.sector !== currentUser.sector) return false;
    }
    if (filter !== 'all' && r.status !== filter) return false;
    return true;
  });

  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 whitespace-nowrap"><CheckCircle className="w-3 h-3" />Approved</span>;
    if (status === 'pending')  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-500/15 text-orange-400 whitespace-nowrap"><Clock className="w-3 h-3" />Pending</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400 whitespace-nowrap"><XCircle className="w-3 h-3" />Rejected</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">
          {isFullAdmin ? 'All Requests' : `${currentUser.sector} — Requests`} ({visible.length})
        </h3>
        <div className="flex gap-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${filter === f ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-app-hover hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">No requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-app-line">
                <th className="text-left text-gray-400 font-medium py-2.5 px-3 whitespace-nowrap">Status</th>
                <th className="text-left text-gray-400 font-medium py-2.5 px-3">Employee</th>
                <th className="text-left text-gray-400 font-medium py-2.5 px-3">Sector</th>
                <th className="text-left text-gray-400 font-medium py-2.5 px-3 whitespace-nowrap">Period</th>
                <th className="text-left text-gray-400 font-medium py-2.5 px-3">Days</th>
                <th className="text-left text-gray-400 font-medium py-2.5 px-3">Notes</th>
                <th className="text-left text-gray-400 font-medium py-2.5 px-3 whitespace-nowrap">Approved by</th>
                <th className="text-right text-gray-400 font-medium py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(req => (
                <tr key={req.id} className="border-b border-app-line/50 hover:bg-app-hover/20">
                  <td className="py-2.5 px-3">{statusBadge(req.status)}</td>
                  <td className="py-2.5 px-3 text-white font-medium whitespace-nowrap">{req.employeeName}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs">{req.sector}</td>
                  <td className="py-2.5 px-3 text-gray-300 whitespace-nowrap">{fmt(req.startDate)} – {fmt(req.endDate)}</td>
                  <td className="py-2.5 px-3 text-white font-medium">{req.daysCount}</td>
                  <td className="py-2.5 px-3 text-gray-500 text-xs max-w-[140px] truncate italic">{req.notes || '—'}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs whitespace-nowrap">{req.approvedBy || '—'}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1 justify-end">
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => approveRequest(req.id)} className="px-2.5 py-1 bg-green-600/20 border border-green-600/50 text-green-400 rounded text-xs hover:bg-green-600/30 transition-colors">
                            Approve
                          </button>
                          <button onClick={() => rejectRequest(req.id)} className="px-2.5 py-1 bg-red-600/20 border border-red-600/50 text-red-400 rounded text-xs hover:bg-red-600/30 transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      {req.status === 'approved' && (
                        <button
                          onClick={() => downloadResenje(req, employees.find(e => e.id === req.employeeId), getRemainingDays(req.employeeId))}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 border border-blue-600/50 text-blue-400 rounded text-xs hover:bg-blue-600/30 transition-colors whitespace-nowrap"
                        >
                          <FileDown className="w-3 h-3" />
                          Rešenje
                        </button>
                      )}
                      {isFullAdmin && (
                        <IconBtn icon={Trash2} color="red" onClick={() => confirm('Delete this request?') && deleteRequest(req.id)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = 'w-full bg-app-bg border border-app-line-muted rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-500';

function IconBtn({ icon: Icon, color, onClick }: { icon: any; color: 'green' | 'red' | 'blue' | 'gray'; onClick: () => void }) {
  const colors = {
    green: 'text-green-500 hover:bg-green-500/10',
    red:   'text-red-500 hover:bg-red-500/10',
    blue:  'text-blue-500 hover:bg-blue-500/10',
    gray:  'text-gray-400 hover:bg-gray-500/10',
  };
  return (
    <button onClick={onClick} className={`p-1.5 rounded transition-colors ${colors[color]}`}>
      <Icon className="w-4 h-4" />
    </button>
  );
}
