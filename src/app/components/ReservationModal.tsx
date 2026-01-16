import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useFleet } from '../context/FleetContext';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reservation: any) => void;
  preselectedVehicle?: string;
}

export function ReservationModal({ isOpen, onClose, onSubmit, preselectedVehicle }: ReservationModalProps) {
  const { vehicles, employees, projects, reservations, currentUser } = useFleet();
  
  const [formData, setFormData] = useState({
    bookerName: currentUser.name,
    employeeId: currentUser.id,
    sector: currentUser.sector,
    vehicleId: preselectedVehicle || '',
    project: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const [employeeSearch, setEmployeeSearch] = useState(currentUser.name);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [conflict, setConflict] = useState<any>(null);

  useEffect(() => {
    if (preselectedVehicle) {
      setFormData(prev => ({ ...prev, vehicleId: preselectedVehicle }));
    }
  }, [preselectedVehicle]);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const checkConflict = (vehicleId: string, startDate: string, endDate: string) => {
    if (!vehicleId || !startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflictingReservation = reservations.find(res => {
      if (res.vehicleId !== vehicleId || res.status === 'rejected') return false;
      
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);
      
      return (start <= resEnd && end >= resStart);
    });

    return conflictingReservation || null;
  };

  const handleEmployeeSelect = (employee: typeof employees[0]) => {
    setFormData({
      ...formData,
      bookerName: employee.name,
      employeeId: employee.id,
      sector: employee.sector
    });
    setEmployeeSearch(employee.name);
    setShowEmployeeDropdown(false);
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Check for conflicts when vehicle or dates change
    if (field === 'vehicleId' || field === 'startDate' || field === 'endDate') {
      const conflictFound = checkConflict(
        field === 'vehicleId' ? value : newFormData.vehicleId,
        field === 'startDate' ? value : newFormData.startDate,
        field === 'endDate' ? value : newFormData.endDate
      );
      setConflict(conflictFound);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (conflict) {
      return;
    }

    const reservation = {
      vehicleId: formData.vehicleId,
      bookerName: formData.bookerName,
      sector: formData.sector,
      project: formData.project || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes || undefined,
      status: 'pending' as const,
    };

    onSubmit(reservation);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      bookerName: currentUser.name,
      employeeId: currentUser.id,
      sector: currentUser.sector,
      vehicleId: '',
      project: '',
      startDate: '',
      endDate: '',
      notes: '',
    });
    setEmployeeSearch(currentUser.name);
    setConflict(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-semibold text-white">New Reservation</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Employee Selector */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-2">Employee *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  setShowEmployeeDropdown(true);
                }}
                onFocus={() => setShowEmployeeDropdown(true)}
                placeholder="Search employees..."
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            
            {showEmployeeDropdown && filteredEmployees.length > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowEmployeeDropdown(false)}
                />
                <div className="absolute z-20 w-full mt-1 bg-[#1a1d29] border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {filteredEmployees.map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => handleEmployeeSelect(employee)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
                    >
                      <div className="text-white font-medium">{employee.name}</div>
                      <div className="text-gray-400 text-sm">{employee.email}</div>
                      <div className="text-gray-500 text-xs mt-1">{employee.sector}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sector (Auto-filled, read-only) */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Department/Sector</label>
            <input
              type="text"
              value={formData.sector}
              readOnly
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Vehicle *</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => handleInputChange('vehicleId', e.target.value)}
              className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.model} - {vehicle.plate} ({vehicle.status})
                </option>
              ))}
            </select>
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Project</label>
            <select
              value={formData.project}
              onChange={(e) => handleInputChange('project', e.target.value)}
              className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select a project (optional)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.name}>
                  {project.name} ({project.kmPerDay} km/day)
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          {/* Conflict Warning */}
          {conflict && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-red-500 font-medium">Scheduling Conflict</p>
                <p className="text-red-400 text-sm mt-1">
                  This vehicle is already {conflict.status} for {conflict.bookerName} during this time period.
                </p>
                <p className="text-red-400/80 text-xs mt-1">
                  {new Date(conflict.startDate).toLocaleString()} - {new Date(conflict.endDate).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Success Indicator */}
          {!conflict && formData.vehicleId && formData.startDate && formData.endDate && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-500 text-sm">Vehicle is available for the selected dates</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!conflict}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              Submit Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}