import { MapPin, User, Circle } from 'lucide-react';
import { type Vehicle } from '../data/mockData';
import { useFleet } from '../context/FleetContext';
import { useEffect, useState } from 'react';
import { getVehicles } from '../../lib/queries'; // ako @ ne radi, promeni u '../../lib/queries'

interface VehicleGridProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function VehicleGrid({ onSelectVehicle }: VehicleGridProps) {
  const { reservations } = useFleet();
  const [displayVehicles, setDisplayVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    async function fetchVehicles() {
      const realVehicles = await getVehicles();
      // Mapiramo podatke iz baze da pašu uz Vehicle interface
      const mappedVehicles = realVehicles.map((v: any) => ({
        ...v,
        currentLocation: v.location || null,  // location → currentLocation
        lastUser: null,  // za sada null (kasnije računamo iz rezervacija ako hoćeš)
      }));
      setDisplayVehicles(mappedVehicles as Vehicle[]);
    }
    fetchVehicles();
  }, []);

  return (
    <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Fleet Overview</h3>
        <span className="text-gray-400 text-sm">{displayVehicles.length} vehicles</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-[#0f1117] border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-all cursor-pointer group"
            onClick={() => onSelectVehicle(vehicle)}
          >
            {/* Vehicle Image Placeholder */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg h-32 mb-4 flex items-center justify-center overflow-hidden">
              <div className="text-gray-600 text-center">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="space-y-3">
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">{vehicle.model}</h4>
                <p className="text-gray-400 text-xs font-mono">{vehicle.plate}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{vehicle.type}</span>
                <div className="flex items-center gap-1">
                  <Circle 
                    className={`w-2 h-2 ${
                      vehicle.status === 'available' 
                        ? 'text-green-500 fill-green-500' 
                        : vehicle.status === 'booked'
                        ? 'text-red-500 fill-red-500'
                        : 'text-orange-500 fill-orange-500'
                    }`}
                  />
                  <span className={`text-xs capitalize ${
                    vehicle.status === 'available' 
                      ? 'text-green-500' 
                      : vehicle.status === 'booked'
                      ? 'text-red-500'
                      : 'text-orange-500'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>

              {vehicle.currentLocation && (
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>{vehicle.currentLocation}</span>
                </div>
              )}

              {vehicle.lastUser && vehicle.status === 'booked' && (
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <User className="w-3 h-3" />
                  <span>{vehicle.lastUser}</span>
                </div>
              )}
            </div>

            {/* Hover Effect */}
            <div className="mt-4 pt-4 border-t border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}