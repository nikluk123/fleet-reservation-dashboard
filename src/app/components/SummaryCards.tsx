import { Car, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { useFleet } from '../context/FleetContext';

export function SummaryCards() {
  const { vehicles, reservations, getVehicleStatus } = useFleet();

  // Calculate metrics dynamically
  const totalVehicles = vehicles.length;

  // Available Now: vehicles with no approved reservation overlapping current time
  const now = new Date('2026-01-11T10:00:00'); // Current simulated time
  const availableNow = vehicles.filter(vehicle => {
    if (vehicle.status === 'maintenance') return false;
    
    const hasActiveReservation = reservations.some(res => {
      if (res.vehicleId !== vehicle.id) return false;
      if (res.status !== 'approved') return false;
      
      const start = new Date(res.startDate);
      const end = new Date(res.endDate);
      
      return start <= now && end >= now;
    });
    
    return !hasActiveReservation;
  }).length;

  // Booked Today: vehicles with at least one approved reservation that includes today
  const todayStart = new Date('2026-01-11T00:00:00');
  const todayEnd = new Date('2026-01-11T23:59:59');
  
  const bookedToday = vehicles.filter(vehicle => {
    return reservations.some(res => {
      if (res.vehicleId !== vehicle.id) return false;
      if (res.status !== 'approved') return false;
      
      const start = new Date(res.startDate);
      const end = new Date(res.endDate);
      
      return start <= todayEnd && end >= todayStart;
    });
  }).length;

  // Upcoming Reservations: total count of approved/pending reservations starting in the future
  const upcomingReservations = reservations.filter(res => {
    if (res.status === 'rejected') return false;
    const start = new Date(res.startDate);
    return start > now;
  }).length;

  const cards = [
    {
      title: 'Total Vehicles',
      value: totalVehicles,
      icon: Car,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/50'
    },
    {
      title: 'Available Now',
      value: availableNow,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
      borderColor: 'border-green-500/50'
    },
    {
      title: 'Booked Today',
      value: bookedToday,
      icon: Calendar,
      color: 'orange',
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-500/50'
    },
    {
      title: 'Upcoming Reservations',
      value: upcomingReservations,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-500/50'
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
            <div>
              <p className="text-gray-400 text-sm mb-1">{card.title}</p>
              <p className="text-white text-3xl font-bold">{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
