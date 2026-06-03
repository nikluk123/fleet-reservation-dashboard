import { useMemo } from 'react';
import { Package, Armchair, Monitor, Keyboard, Mouse, Smartphone, Laptop } from 'lucide-react';
import { useFleet } from '../context/FleetContext';
import { type InventoryItem } from '../data/mockData';

function CategoryIcon({ type }: { type: string }) {
  const t = type.toUpperCase();
  if (t.includes('LAP')) return <Laptop className="w-4 h-4" />;
  if (t.includes('MONITOR')) return <Monitor className="w-4 h-4" />;
  if (t.includes('TASTATUR')) return <Keyboard className="w-4 h-4" />;
  if (t.includes('MIŠ')) return <Mouse className="w-4 h-4" />;
  if (t.includes('TELEFON')) return <Smartphone className="w-4 h-4" />;
  return <Package className="w-4 h-4" />;
}

function ConditionBadge({ condition }: { condition: string }) {
  const colors: Record<string, string> = {
    'ISPRAVNO': 'bg-green-500/10 text-green-400 border-green-500/20',
    'OŠTEĆENO': 'bg-red-500/10 text-red-400 border-red-500/20',
    'U POPRAVCI': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'RASHODOVANO': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[condition] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      {condition}
    </span>
  );
}

function ItemCard({ item }: { item: InventoryItem }) {
  const isIT = item.category === 'IT';
  return (
    <div className="bg-app-surface border border-app-line rounded-xl p-4 hover:border-blue-500/30 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isIT ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
            {isIT ? <CategoryIcon type={item.itemType} /> : <Armchair className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{item.itemType}</p>
            <span className={`font-mono text-xs ${isIT ? 'text-blue-400' : 'text-purple-400'}`}>{item.barcodeId}</span>
          </div>
        </div>
        <ConditionBadge condition={item.condition} />
      </div>

      <div className="space-y-1.5 text-xs">
        {isIT ? (
          <>
            {(item.manufacturer || item.model) && (
              <div className="flex justify-between">
                <span className="text-gray-500">Proizvođač / Model</span>
                <span className="text-gray-300">{[item.manufacturer, item.model].filter(Boolean).join(' ')}</span>
              </div>
            )}
            {item.serialNumber && (
              <div className="flex justify-between">
                <span className="text-gray-500">Serijski broj</span>
                <span className="text-gray-400 font-mono">{item.serialNumber}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {item.material && (
              <div className="flex justify-between">
                <span className="text-gray-500">Materijal</span>
                <span className="text-gray-300">{item.material}</span>
              </div>
            )}
            {item.dimensions && (
              <div className="flex justify-between">
                <span className="text-gray-500">Dimenzije</span>
                <span className="text-gray-300">{item.dimensions}</span>
              </div>
            )}
          </>
        )}
        {item.location && (
          <div className="flex justify-between">
            <span className="text-gray-500">Lokacija</span>
            <span className="text-gray-300">{item.location}</span>
          </div>
        )}
        {item.assignedDate && (
          <div className="flex justify-between">
            <span className="text-gray-500">Datum zaduženja</span>
            <span className="text-gray-300">{item.assignedDate}</span>
          </div>
        )}
        {item.notes && (
          <div className="flex justify-between">
            <span className="text-gray-500">Napomena</span>
            <span className="text-gray-300 text-right max-w-[60%]">{item.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MyInventoryPage() {
  const { inventoryItems, currentUser } = useFleet();

  const myItems = useMemo(() => {
    const normalize = (s: string) => s.trim().toLowerCase().normalize('NFC');
    const userName = normalize(currentUser.name);
    return inventoryItems.filter(item =>
      item.employeeName ? normalize(item.employeeName) === userName : false
    );
  }, [inventoryItems, currentUser.name]);

  const itItems = myItems.filter(i => i.category === 'IT');
  const furnitureItems = myItems.filter(i => i.category === 'Namestaj');

  if (myItems.length === 0) {
    return (
      <div className="bg-app-surface border border-app-line rounded-xl p-16 text-center">
        <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-white font-semibold text-lg mb-2">Nema zaduženog inventara</h3>
        <p className="text-gray-400 text-sm">Za korisnika <span className="text-white">{currentUser.name}</span> nije evidentiran inventar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-app-surface border border-app-line rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className="text-white font-semibold text-xl">{currentUser.name}</h2>
            <p className="text-gray-400 text-sm">{currentUser.sector}</p>
          </div>
          <div className="ml-auto flex gap-4">
            <div className="text-center">
              <p className="text-blue-400 text-2xl font-bold">{itItems.length}</p>
              <p className="text-gray-400 text-xs">IT stavki</p>
            </div>
            <div className="text-center">
              <p className="text-purple-400 text-2xl font-bold">{furnitureItems.length}</p>
              <p className="text-gray-400 text-xs">Nameštaj</p>
            </div>
          </div>
        </div>
      </div>

      {/* IT Oprema */}
      {itItems.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            IT Oprema
            <span className="text-gray-400 text-sm font-normal">({itItems.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itItems.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {/* Nameštaj */}
      {furnitureItems.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Armchair className="w-5 h-5 text-purple-400" />
            Nameštaj
            <span className="text-gray-400 text-sm font-normal">({furnitureItems.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {furnitureItems.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        </div>
      )}
    </div>
  );
}
