import { useVacation } from '../../context/VacationContext';

export function VacationHeader() {
  const { currentUser, getRemainingDays } = useVacation();
  const remaining = getRemainingDays(currentUser.id);

  return (
    <header className="bg-app-surface border-b border-app-line px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">LeaveFlow Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track vacation requests</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-app-bg border border-app-line-muted rounded-lg px-4 py-2 flex items-center gap-3">
            <span className="text-2xl">🏖️</span>
            <div>
              <p className="text-gray-400 text-xs">Remaining days</p>
              <p className={`text-lg font-bold ${remaining <= 3 ? 'text-red-400' : remaining <= 7 ? 'text-orange-400' : 'text-green-400'}`}>
                {remaining} days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-app-line-muted">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{currentUser.name}</p>
              <p className="text-gray-400 text-xs">{currentUser.sector}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
