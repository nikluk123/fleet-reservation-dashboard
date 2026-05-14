import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Employee } from '../data/mockData';
import { type VacationRequest } from '../data/vacationTypes';
import { supabase } from '../../lib/supabaseClient';
import { notifyVacationAdmins, notifyVacationStatusChange } from '../../lib/vacationEmailService';
import { toast } from 'sonner';

interface VacationContextType {
  employees: Employee[];
  vacationRequests: VacationRequest[];
  currentUser: Employee;

  submitRequest: (req: Omit<VacationRequest, 'id' | 'status'>) => Promise<void>;
  approveRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;

  updateEmployeeVacation: (id: string, data: { vacationDaysTotal?: number; vacationRole?: string }) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  changePassword: (currentPwd: string, newPwd: string) => Promise<'ok' | 'wrong-password'>;

  getUsedDays: (employeeId: string) => number;
  getRemainingDays: (employeeId: string) => number;

  logout: () => void;
}

const VacationContext = createContext<VacationContextType | undefined>(undefined);

export function useVacation() {
  const ctx = useContext(VacationContext);
  if (!ctx) throw new Error('useVacation must be used inside VacationProvider');
  return ctx;
}

const mapEmployee = (row: any): Employee => ({
  id: row.id,
  name: row.name,
  email: row.email,
  sector: row.sector,
  role: row.role,
  vacationRole: row.vacation_role ?? 'user',
  vacationDaysTotal: row.vacation_days_total ?? 20,
});

const mapRequest = (row: any): VacationRequest => ({
  id: row.id,
  employeeId: row.employee_id,
  employeeName: row.employee_name,
  sector: row.sector,
  startDate: row.start_date,
  endDate: row.end_date,
  daysCount: row.days_count,
  notes: row.notes ?? undefined,
  status: row.status,
  approvedBy: row.approved_by ?? undefined,
  approvedAt: row.approved_at ?? undefined,
});

interface Props {
  initialUser: Employee;
  onLogout: () => void;
  children: ReactNode;
}

export function VacationProvider({ initialUser, onLogout, children }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee>(initialUser);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('employees').select('*').order('name'),
      supabase.from('vacation_requests').select('*').order('created_at', { ascending: false }),
    ]).then(([empRes, reqRes]) => {
      if (empRes.error) { setLoadError(empRes.error.message); setLoading(false); return; }
      if (reqRes.error) { setLoadError(reqRes.error.message); setLoading(false); return; }
      const emps = (empRes.data ?? []).map(mapEmployee);
      setEmployees(emps);
      setVacationRequests((reqRes.data ?? []).map(mapRequest));
      const me = emps.find(e => e.id === initialUser.id);
      if (me) setCurrentUser(me);
      setLoading(false);
    });
  }, []);

  const getUsedDays = (employeeId: string) => {
    const year = new Date().getFullYear();
    return vacationRequests
      .filter(r => r.employeeId === employeeId && r.status === 'approved' && new Date(r.startDate).getFullYear() === year)
      .reduce((sum, r) => sum + r.daysCount, 0);
  };

  const getRemainingDays = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    return (emp?.vacationDaysTotal ?? 20) - getUsedDays(employeeId);
  };

  const submitRequest = async (req: Omit<VacationRequest, 'id' | 'status'>) => {
    const id = Date.now().toString();
    const newReq: VacationRequest = { ...req, id, status: 'pending' };
    setVacationRequests(prev => [newReq, ...prev]);

    const { error } = await supabase.from('vacation_requests').insert({
      id,
      employee_id:   req.employeeId,
      employee_name: req.employeeName,
      sector:        req.sector,
      start_date:    req.startDate,
      end_date:      req.endDate,
      days_count:    req.daysCount,
      notes:         req.notes ?? null,
      status:        'pending',
    });

    if (error) {
      setVacationRequests(prev => prev.filter(r => r.id !== id));
      toast.error('Failed to submit request');
      return;
    }

    toast.success('Vacation request submitted');

    // Notify sector admins + main admins
    const recipients = employees.filter(e =>
      (e.vacationRole === 'sector_admin' && e.sector === req.sector) ||
      e.vacationRole === 'admin'
    );
    if (recipients.length > 0) notifyVacationAdmins(req, recipients);
  };

  const approveRequest = async (id: string) => {
    const req = vacationRequests.find(r => r.id === id);
    if (!req) return;
    const now = new Date().toISOString();
    setVacationRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'approved', approvedBy: currentUser.name, approvedAt: now } : r
    ));

    const { error } = await supabase.from('vacation_requests').update({
      status:      'approved',
      approved_by: currentUser.name,
      approved_at: now,
    }).eq('id', id);

    if (error) {
      setVacationRequests(prev => prev.map(r => r.id === id ? req : r));
      toast.error('Failed to approve request');
      return;
    }

    toast.success('Request approved');

    const booker = employees.find(e => e.name === req.employeeName);
    const mainAdmins = employees.filter(e => e.vacationRole === 'admin' && e.id !== booker?.id);
    const recipients = [...(booker ? [booker] : []), ...mainAdmins];
    if (recipients.length > 0) {
      const approved: VacationRequest = { ...req, status: 'approved', approvedBy: currentUser.name };
      notifyVacationStatusChange(approved, 'approved', currentUser.name, recipients);
    }
  };

  const rejectRequest = async (id: string) => {
    const req = vacationRequests.find(r => r.id === id);
    if (!req) return;
    setVacationRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'rejected' } : r
    ));

    const { error } = await supabase.from('vacation_requests').update({ status: 'rejected' }).eq('id', id);

    if (error) {
      setVacationRequests(prev => prev.map(r => r.id === id ? req : r));
      toast.error('Failed to reject request');
      return;
    }

    toast.error('Request rejected');

    const booker = employees.find(e => e.name === req.employeeName);
    const mainAdmins = employees.filter(e => e.vacationRole === 'admin' && e.id !== booker?.id);
    const recipients = [...(booker ? [booker] : []), ...mainAdmins];
    if (recipients.length > 0) {
      const rejected: VacationRequest = { ...req, status: 'rejected' };
      notifyVacationStatusChange(rejected, 'rejected', currentUser.name, recipients);
    }
  };

  const deleteRequest = async (id: string) => {
    const prev = vacationRequests.find(r => r.id === id);
    setVacationRequests(p => p.filter(r => r.id !== id));
    const { error } = await supabase.from('vacation_requests').delete().eq('id', id);
    if (error) {
      if (prev) setVacationRequests(p => [prev, ...p]);
      toast.error('Failed to delete request');
    } else {
      toast.success('Request deleted');
    }
  };

  const cancelRequest = async (id: string) => {
    const req = vacationRequests.find(r => r.id === id);
    if (!req || req.status !== 'pending') return;
    setVacationRequests(p => p.filter(r => r.id !== id));
    const { error } = await supabase.from('vacation_requests').delete().eq('id', id);
    if (error) {
      if (req) setVacationRequests(p => [req, ...p]);
      toast.error('Failed to cancel request');
    } else {
      toast.success('Request cancelled');
    }
  };

  const deleteEmployee = async (id: string) => {
    const prev = employees.find(e => e.id === id);
    setEmployees(p => p.filter(e => e.id !== id));
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
      if (prev) setEmployees(p => [...p, prev]);
      toast.error('Failed to delete employee');
    } else {
      toast.success('Employee deleted');
    }
  };

  const changePassword = async (currentPwd: string, newPwd: string): Promise<'ok' | 'wrong-password'> => {
    const { data } = await supabase
      .from('employees')
      .select('password')
      .eq('id', currentUser.id)
      .single();
    if (!data || data.password !== currentPwd) return 'wrong-password';
    await supabase.from('employees').update({ password: newPwd }).eq('id', currentUser.id);
    return 'ok';
  };

  const updateEmployeeVacation = async (id: string, data: { vacationDaysTotal?: number; vacationRole?: string }) => {
    const prev = employees.find(e => e.id === id);
    setEmployees(p => p.map(e => e.id === id
      ? { ...e, vacationDaysTotal: data.vacationDaysTotal ?? e.vacationDaysTotal, vacationRole: (data.vacationRole as any) ?? e.vacationRole }
      : e
    ));

    const updates: any = {};
    if (data.vacationDaysTotal !== undefined) updates.vacation_days_total = data.vacationDaysTotal;
    if (data.vacationRole !== undefined) updates.vacation_role = data.vacationRole;

    const { error } = await supabase.from('employees').update(updates).eq('id', id);
    if (error) {
      if (prev) setEmployees(p => p.map(e => e.id === id ? prev : e));
      toast.error('Failed to update employee');
    } else {
      toast.success('Employee updated');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <p className="text-red-400 font-semibold mb-2">Failed to load data</p>
          <p className="text-gray-400 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <VacationContext.Provider value={{
      employees, vacationRequests, currentUser,
      submitRequest, approveRequest, rejectRequest, deleteRequest, cancelRequest,
      updateEmployeeVacation, deleteEmployee, changePassword,
      getUsedDays, getRemainingDays,
      logout: onLogout,
    }}>
      {children}
    </VacationContext.Provider>
  );
}
