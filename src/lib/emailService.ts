import emailjs from '@emailjs/browser';
import type { Employee, Reservation, Vehicle } from '../app/data/mockData';

const SERVICE_ID    = 'service_rd1t6sm';
const TEMPLATE_ADMIN = 'template_fawr1cl';
const TEMPLATE_USER  = 'template_9ts5ner';
const PUBLIC_KEY     = 'OKiDRQvpHMiOQQo9T';

emailjs.init(PUBLIC_KEY);

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export async function notifyAdminsNewRequest(
  reservation: Omit<Reservation, 'id'>,
  vehicle: Vehicle,
  admins: Employee[]
) {
  const subject = `New vehicle reservation — ${vehicle.model} (${vehicle.plate})`;
  const message =
    `${reservation.bookerName} (${reservation.sector}) submitted a vehicle reservation.\n\n` +
    `Vehicle: ${vehicle.model} — ${vehicle.plate}\n` +
    `Dates: ${fmt(reservation.startDate)} → ${fmt(reservation.endDate)}\n` +
    `Project: ${reservation.project || '—'}\n` +
    `Notes: ${reservation.notes || '—'}`;

  const sends = admins.map(admin =>
    emailjs.send(SERVICE_ID, TEMPLATE_ADMIN, { to_email: admin.email, subject, message })
      .catch(err => console.error(`Failed to notify admin ${admin.email}:`, err))
  );

  await Promise.allSettled(sends);
}

export async function notifyUserStatusChange(
  reservation: Reservation,
  vehicle: Vehicle,
  status: 'approved' | 'rejected',
  approvedBy: string,
  bookerEmail: string
) {
  const statusLabel = status === 'approved' ? 'approved ✅' : 'rejected ❌';
  const subject = `Your vehicle reservation has been ${statusLabel}`;
  const message =
    `Hi ${reservation.bookerName},\n\n` +
    `Your reservation has been ${statusLabel} by ${approvedBy}.\n\n` +
    `Vehicle: ${vehicle.model} — ${vehicle.plate}\n` +
    `Dates: ${fmt(reservation.startDate)} → ${fmt(reservation.endDate)}`;

  await emailjs.send(SERVICE_ID, TEMPLATE_USER, { to_email: bookerEmail, subject, message })
    .catch(err => console.error('Failed to notify user:', err));
}
