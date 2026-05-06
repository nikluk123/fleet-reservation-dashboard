import emailjs from '@emailjs/browser';
import type { Employee, Reservation, Vehicle } from '../app/data/mockData';

const SERVICE_ID = 'service_rd1t6sm';
const TEMPLATE_ADMIN = 'template_fawr1cl';   // novi zahtev → admini
const TEMPLATE_USER  = 'template_9ts5ner';   // status promenjen → podnosilac
const PUBLIC_KEY     = 'OKiDRQvpHMiOQQo9T';

emailjs.init(PUBLIC_KEY);

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

// Poziva se kada korisnik podnese novi zahtev — šalje svim adminima
export async function notifyAdminsNewRequest(
  reservation: Omit<Reservation, 'id'>,
  vehicle: Vehicle,
  admins: Employee[]
) {
  const params = {
    vehicle_model:  vehicle.model,
    vehicle_plate:  vehicle.plate,
    booker_name:    reservation.bookerName,
    booker_sector:  reservation.sector,
    start_date:     fmt(reservation.startDate),
    end_date:       fmt(reservation.endDate),
    project:        reservation.project || '—',
    notes:          reservation.notes   || '—',
  };

  const sends = admins.map(admin =>
    emailjs.send(SERVICE_ID, TEMPLATE_ADMIN, { ...params, to_email: admin.email })
      .catch(err => console.error(`Failed to notify admin ${admin.email}:`, err))
  );

  await Promise.allSettled(sends);
}

// Poziva se kada admin odobri ili odbije zahtev — šalje podnosiocu
export async function notifyUserStatusChange(
  reservation: Reservation,
  vehicle: Vehicle,
  status: 'approved' | 'rejected',
  approvedBy: string,
  bookerEmail: string
) {
  await emailjs.send(SERVICE_ID, TEMPLATE_USER, {
    to_email:      bookerEmail,
    booker_name:   reservation.bookerName,
    vehicle_model: vehicle.model,
    vehicle_plate: vehicle.plate,
    start_date:    fmt(reservation.startDate),
    end_date:      fmt(reservation.endDate),
    status:        status === 'approved' ? 'approved ✅' : 'rejected ❌',
    approved_by:   approvedBy,
  }).catch(err => console.error('Failed to notify user:', err));
}
