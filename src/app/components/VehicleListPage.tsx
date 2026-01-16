import { MapPin, User, Circle, Search } from 'lucide-react';
import { useState } from 'react';
import { type Vehicle } from '../data/mockData';
import { useFleet } from '../context/FleetContext';

interface VehicleListPageProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function VehicleListPage({ vehicles, onSelectVehicle }: VehicleListPageProps) {
  const { reservations } = useFleet();
  const [sortBy, setSortBy] = useState<'model' | 'plate' | 'status'>('model');

  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (sortBy === 'model') return a.model.localeCompare(b.model);
    if (sortBy === 'plate') return a.plate.localeCompare(b.plate);
    return a.status.localeCompare(b.status);
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Complete Vehicle List</h2>
            <p className="text-gray-400">Total: {vehicles.length} vehicles</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-gray-400 text-sm">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="model">Model</option>
              <option value="plate">Plate</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Model</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Plate</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Type</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Status</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Location</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Last User</th>
                <th className="text-right text-gray-400 text-sm font-medium py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="py-4 px-4 text-white font-medium">{vehicle.model}</td>
                  <td className="py-4 px-4 text-gray-400 font-mono">{vehicle.plate}</td>
                  <td className="py-4 px-4 text-gray-400">{vehicle.type}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Circle 
                        className={`w-2 h-2 ${
                          vehicle.status === 'available' 
                            ? 'text-green-500 fill-green-500' 
                            : vehicle.status === 'booked'
                            ? 'text-red-500 fill-red-500'
                            : 'text-orange-500 fill-orange-500'
                        }`}
                      />
                      <span className={`text-sm capitalize ${
                        vehicle.status === 'available' 
                          ? 'text-green-500' 
                          : vehicle.status === 'booked'
                          ? 'text-red-500'
                          : 'text-orange-500'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span className="text-sm">{vehicle.currentLocation || '-'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {vehicle.lastUser ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <User className="w-3 h-3" />
                        <span className="text-sm">{vehicle.lastUser}</span>
                      </div>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => onSelectVehicle(vehicle)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}