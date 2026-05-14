import emailjs from '@emailjs/browser';
import type { Employee } from '../app/data/mockData';
import type { VacationRequest } from '../app/data/vacationTypes';

const SERVICE_ID     = 'service_rd1t6sm';
const TEMPLATE_ADMIN = 'template_fawr1cl';
const TEMPLATE_USER  = 'template_9ts5ner';
const PUBLIC_KEY     = 'OKiDRQvpHMiOQQo9T';

emailjs.init(PUBLIC_KEY);

function fmt(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { dateStyle: 'medium' });
}

export async function notifyVacationAdmins(
  request: Omit<VacationRequest, 'id'>,
  recipients: Employee[]
) {
  const subject = `New vacation request — ${request.employeeName} (${request.daysCount} days)`;
  const message =
    `${request.employeeName} (${request.sector}) submitted a vacation request.\n\n` +
    `Dates: ${fmt(request.startDate)} → ${fmt(request.endDate)}\n` +
    `Working days: ${request.daysCount}\n` +
    `Notes: ${request.notes || '—'}\n\n` +
    `Please review and approve/reject in LeaveFlow.`;

  const sends = recipients.map(r =>
    emailjs.send(SERVICE_ID, TEMPLATE_ADMIN, { to_email: r.email, subject, message })
      .catch(err => console.error(`Failed to notify ${r.email}:`, err))
  );

  await Promise.allSettled(sends);
}

export async function notifyVacationStatusChange(
  request: VacationRequest,
  status: 'approved' | 'rejected',
  approvedBy: string,
  recipients: { email: string; name?: string }[]
) {
  const statusLabel = status === 'approved' ? 'approved ✅' : 'rejected ❌';
  const subject = `Vacation request ${statusLabel} — ${request.employeeName}`;
  const message =
    `Hi,\n\n` +
    `The vacation request for ${request.employeeName} has been ${statusLabel} by ${approvedBy}.\n\n` +
    `Dates: ${fmt(request.startDate)} → ${fmt(request.endDate)}\n` +
    `Working days: ${request.daysCount}`;

  const sends = recipients.map(r =>
    emailjs.send(SERVICE_ID, TEMPLATE_USER, { to_email: r.email, subject, message })
      .catch(err => console.error(`Failed to notify ${r.email}:`, err))
  );

  await Promise.allSettled(sends);
}
