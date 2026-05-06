import { Car, CheckCircle, Calendar, Clock } from 'lucide-react';
import { useFleet } from '../context/FleetContext';

export function SummaryCards() {
  const { vehicles, reservations } = useFleet();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const totalVehicles = vehicles.length;

  const availableNow = vehicles.filter(vehicle => {
    if (vehicle.status === 'maintenance') return false;
    return !reservations.some(res =>
      res.vehicleId === vehicle.id &&
      res.status === 'approved' &&
      new Date(res.startDate) <= now &&
      new Date(res.endDate) >= now
    );
  }).length;

  const bookedToday = vehicles.filter(vehicle =>
    reservations.some(res =>
      res.vehicleId === vehicle.id &&
      res.status === 'approved' &&
      new Date(res.startDate) <= todayEnd &&
      new Date(res.endDate) >= todayStart
    )
  ).length;

  const pendingApproval = reservations.filter(res => res.status === 'pending').length;

  const cards = [
    {
      title: 'Total Vehicles',
      value: totalVehicles,
      icon: Car,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Available Now',
      value: availableNow,
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'Booked Today',
      value: bookedToday,
      icon: Calendar,
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
            className={`bg-[#1a1d29] border ${card.borderColor} rounded-xl p-6 ${card.bgColor} hover:scale-105 transition-transform duration-200`}
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
