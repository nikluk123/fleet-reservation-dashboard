import { Filter, Calendar, X, TrendingUp, Navigation } from 'lucide-react';
import { useMemo } from 'react';
import { useFleet } from '../context/FleetContext';

interface FiltersProps {
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  selectedVehicleType: string;
  setSelectedVehicleType: (type: string) => void;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  filtersApplied: boolean;
}

const vehicleTypes = ['All Types', 'SUV', 'Compact SUV', 'Sedan', 'City Car', 'Van'];

export function Filters({ 
  selectedDepartment, 
  setSelectedDepartment,
  selectedVehicleType,
  setSelectedVehicleType,
  selectedProject,
  setSelectedProject,
  dateRange,
  setDateRange,
  onApplyFilters,
  onClearFilters,
  filtersApplied
}: FiltersProps) {
  const { departments, projects, reservations, vehicles } = useFleet();

  // Calculate analytics metrics
  const analytics = useMemo(() => {
    if (!filtersApplied) {
      return { vehicleDays: 0, estimatedKm: 0 };
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    let totalVehicleDays = 0;
    let totalEstimatedKm = 0;

    // Filter reservations based on applied filters
    const filteredReservations = reservations.filter(res => {
      // Only approved reservations
      if (res.status !== 'approved') return false;

      // Date range filter
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);
      if (resEnd < startDate || resStart > endDate) return false;

      // Department filter
      if (selectedDepartment !== 'all' && res.sector !== selectedDepartment) return false;

      // Project filter
      if (selectedProject !== 'All Projects' && res.project !== selectedProject) return false;

      // Vehicle type filter
      if (selectedVehicleType !== 'All Types') {
        const vehicle = vehicles.find(v => v.id === res.vehicleId);
        if (vehicle?.type !== selectedVehicleType) return false;
      }

      return true;
    });

    // Calculate vehicle-days and estimated km
    filteredReservations.forEach(res => {
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);

      // Calculate days within the filter range
      const effectiveStart = resStart > startDate ? resStart : startDate;
      const effectiveEnd = resEnd < endDate ? resEnd : endDate;

      // Calculate number of days (inclusive)
      const timeDiff = effectiveEnd.getTime() - effectiveStart.getTime();
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

      totalVehicleDays += days;

      // Find project and calculate km
      if (res.project) {
        const project = projects.find(p => p.name === res.project);
        if (project) {
          totalEstimatedKm += days * project.kmPerDay;
        }
      }
    });

    return {
      vehicleDays: totalVehicleDays,
      estimatedKm: totalEstimatedKm
    };
  }, [filtersApplied, reservations, vehicles, projects, dateRange, selectedDepartment, selectedProject, selectedVehicleType]);

  const activeFilters = [];
  if (selectedDepartment !== 'all') activeFilters.push({ key: 'department', label: selectedDepartment, clear: () => setSelectedDepartment('all') });
  if (selectedVehicleType !== 'All Types') activeFilters.push({ key: 'type', label: selectedVehicleType, clear: () => setSelectedVehicleType('All Types') });
  if (selectedProject !== 'All Projects') activeFilters.push({ key: 'project', label: selectedProject, clear: () => setSelectedProject('All Projects') });

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Filters & Analytics</h2>
          </div>
          <div className="flex items-center gap-3">
            {filtersApplied && (
              <button
                onClick={onClearFilters}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onApplyFilters}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Apply Analytics Filters
            </button>
          </div>
        </div>

        {/* Active Filters Chips */}
        {filtersApplied && activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">Active:</span>
            {activeFilters.map((filter) => (
              <div
                key={filter.key}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/50 rounded-full text-blue-400 text-sm"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => {
                    filter.clear();
                    onApplyFilters();
                  }}
                  className="hover:bg-blue-500/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department Filter */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Department/Sector</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Departments</option>
              {departments.filter(d => !d.parent).map(dept => (
                <optgroup key={dept.id} label={dept.name}>
                  <option value={dept.name}>{dept.name}</option>
                  {departments
                    .filter(d => d.parent === dept.id)
                    .map(subDept => (
                      <option key={subDept.id} value={`${dept.name} - ${subDept.name}`}>
                        {dept.name} - {subDept.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Vehicle Type</label>
            <select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {vehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All Projects">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.name}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-gray-400 text-sm mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="flex-1 bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="flex-1 bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Metrics */}
      {filtersApplied && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle-Days Used */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Vehicle-Days Used</p>
                <p className="text-gray-500 text-xs">In selected date range</p>
              </div>
            </div>
            <p className="text-blue-400 text-4xl font-bold">{analytics.vehicleDays}</p>
            <p className="text-gray-500 text-sm mt-2">
              {analytics.vehicleDays === 1 ? 'vehicle-day' : 'vehicle-days'} of approved reservations
            </p>
          </div>

          {/* Total Estimated Kilometers */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Navigation className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Estimated Kilometers</p>
                <p className="text-gray-500 text-xs">Based on project KM/day rates</p>
              </div>
            </div>
            <p className="text-green-400 text-4xl font-bold">{analytics.estimatedKm.toLocaleString()}</p>
            <p className="text-gray-500 text-sm mt-2">km</p>
          </div>
        </div>
      )}
    </div>
  );
}
