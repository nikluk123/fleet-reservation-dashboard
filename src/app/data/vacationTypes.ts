export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  sector: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export function calcVacationDays(emp: {
  educationLevel?: string;
  nesStartDate?: string;
  hasChildrenUnder15?: boolean;
  isSingleParent?: boolean;
}): number {
  let days = 20;
  if (emp.educationLevel === 'SSS') days += 3;
  else if (emp.educationLevel === 'VSS') days += 4;
  if (emp.nesStartDate) {
    const years = (Date.now() - new Date(emp.nesStartDate).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (years >= 15) days += 4;
    else if (years >= 5) days += 3;
    else if (years >= 3) days += 2;
    else days += 1;
  }
  if (emp.hasChildrenUnder15) days += 1;
  if (emp.isSingleParent) days += 1;
  return Math.min(days, 27);
}

export function countWorkingDays(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}
