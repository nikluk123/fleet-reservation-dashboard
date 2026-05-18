import { MapPin, User, Circle } from 'lucide-react';
import { type Vehicle } from '../data/mockData';
import { useFleet } from '../context/FleetContext';

interface VehicleGridProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function VehicleGrid({ vehicles, onSelectVehicle }: VehicleGridProps) {
  const { getVehicleStatus } = useFleet();

  const getStatusColor = (status: string) => {
    if (status === 'available') return 'text-green-500 fill-green-500';
    if (status === 'booked') return 'text-red-500 fill-red-500';
    if (status === 'pending') return 'text-orange-500 fill-orange-500';
    return 'text-orange-500 fill-orange-500';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'pending') return 'pending';
    return status;
  };

  return (
    <div className="bg-app-surface border border-app-line rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Fleet Overview</h3>
        <span className="text-gray-400 text-sm">{vehicles.length} vehicles</span>
      </div>

      {vehicles.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No vehicles match the current filter.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vehicles.map((vehicle) => {
          const liveStatus = getVehicleStatus(vehicle.id);
          const displayStatus = vehicle.status === 'maintenance' ? 'maintenance' : liveStatus;

          return (
            <div
              key={vehicle.id}
              className="bg-app-bg border border-app-line-muted rounded-xl p-4 hover:border-blue-500 transition-all cursor-pointer group"
              onClick={() => onSelectVehicle(vehicle)}
            >
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg h-32 mb-4 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5 1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">{vehicle.model}</h4>
                  <p className="text-gray-400 text-xs font-mono">{vehicle.plate}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">{vehicle.type}</span>
                  <div className="flex items-center gap-1">
                    <Circle className={`w-2 h-2 ${getStatusColor(displayStatus)}`} />
                    <span className={`text-xs capitalize ${getStatusColor(displayStatus).split(' ')[0]}`}>
                      {getStatusLabel(displayStatus)}
                    </span>
                  </div>
                </div>

                {vehicle.currentLocation && (
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{vehicle.currentLocation}</span>
                  </div>
                )}

                {vehicle.lastUser && displayStatus === 'booked' && (
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <User className="w-3 h-3" />
                    <span>{vehicle.lastUser}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-app-line-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
