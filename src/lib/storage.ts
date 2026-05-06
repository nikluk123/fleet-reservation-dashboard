// localStorage keys
const KEYS = {
  vehicles: 'fleetflow_vehicles',
  reservations: 'fleetflow_reservations',
  employees: 'fleetflow_employees',
  projects: 'fleetflow_projects',
  departments: 'fleetflow_departments',
  passwords: 'fleetflow_passwords',
};

const DEFAULT_PASSWORD = 'fleet2026';

export function loadState<T>(key: keyof typeof KEYS, fallback: T): T {
  try {
    const raw = localStorage.getItem(KEYS[key]);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: keyof typeof KEYS, value: T): void {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch {
    // storage full or unavailable — ignore
  }
}

// Password helpers
export function getPassword(employeeId: string): string {
  const map = loadState<Record<string, string>>('passwords', {});
  return map[employeeId] ?? DEFAULT_PASSWORD;
}

export function setPassword(employeeId: string, newPassword: string): void {
  const map = loadState<Record<string, string>>('passwords', {});
  map[employeeId] = newPassword;
  saveState('passwords', map);
}

export function verifyPassword(employeeId: string, password: string): boolean {
  return getPassword(employeeId) === password;
}
