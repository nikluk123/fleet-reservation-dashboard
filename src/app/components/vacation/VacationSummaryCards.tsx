import { Users, UserCheck, Palmtree, Clock } from 'lucide-react';
import { useVacation } from '../../context/VacationContext';

export function VacationSummaryCards() {
  const { employees, vacationRequests } = useVacation();

  const today = new Date().toISOString().split('T')[0];

  const totalEmployees = employees.length;

  const onLeaveToday = employees.filter(emp =>
    vacationRequests.some(r =>
      r.employeeId === emp.id &&
      r.status === 'approved' &&
      r.startDate <= today &&
      r.endDate >= today
    )
  ).length;

  const atWorkToday = totalEmployees - onLeaveToday;

  const pendingApproval = vacationRequests.filter(r => r.status === 'pending').length;

  const cards = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      icon: Users,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'At Work Today',
      value: atWorkToday,
      icon: UserCheck,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'On Leave Today',
      value: onLeaveToday,
      icon: Palmtree,
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-500/30',
    },
    {
      title: 'Pending Approval',
      value: pendingApproval,
      icon: Clock,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-app-surface border ${card.borderColor} rounded-xl p-6 ${card.bgColor} hover:scale-105 transition-transform duration-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${card.bgColor} rounded-lg border ${card.borderColor}`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{card.title}</p>
            <p className="text-white text-3xl font-bold">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
