import emailjs from '@emailjs/browser';
import type { Employee } from '../app/data/mockData';
import type { VacationRequest } from '../app/data/vacationTypes';

const SERVICE_ID = 'service_rd1t6sm';
const TEMPLATE_ADMIN = 'template_vac_admin';
const TEMPLATE_USER  = 'template_vac_user';
const PUBLIC_KEY     = 'OKiDRQvpHMiOQQo9T';

emailjs.init(PUBLIC_KEY);

function fmt(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { dateStyle: 'medium' });
}

// Sent to sector_admin(s) of that sector + all main admins when request is submitted
export async function notifyVacationAdmins(
  request: Omit<VacationRequest, 'id'>,
  recipients: Employee[]
) {
  const params = {
    employee_name: request.employeeName,
    sector:        request.sector,
    start_date:    fmt(request.startDate),
    end_date:      fmt(request.endDate),
    days_count:    request.daysCount,
    notes:         request.notes || '—',
  };

  const sends = recipients.map(r =>
    emailjs.send(SERVICE_ID, TEMPLATE_ADMIN, { ...params, to_email: r.email })
      .catch(err => console.error(`Failed to notify ${r.email}:`, err))
  );

  await Promise.allSettled(sends);
}

// Sent to the employee + main admin when approved or rejected
export async function notifyVacationStatusChange(
  request: VacationRequest,
  status: 'approved' | 'rejected',
  approvedBy: string,
  recipients: { email: string }[]
) {
  const params = {
    employee_name: request.employeeName,
    start_date:    fmt(request.startDate),
    end_date:      fmt(request.endDate),
    days_count:    request.daysCount,
    status:        status === 'approved' ? 'approved ✅' : 'rejected ❌',
    approved_by:   approvedBy,
  };

  const sends = recipients.map(r =>
    emailjs.send(SERVICE_ID, TEMPLATE_USER, { ...params, to_email: r.email })
      .catch(err => console.error(`Failed to notify ${r.email}:`, err))
  );

  await Promise.allSettled(sends);
}
