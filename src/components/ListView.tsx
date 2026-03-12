import { useState } from 'react';
import { LocationData, MaterialTotal } from '../types';
import { Edit2 } from 'lucide-react';
import EditModal from './EditModal';
import { Language, t } from '../i18n';

interface ListViewProps {
  locations: LocationData[];
  updateLocation: (loc: LocationData) => void;
  updateLocations: (locs: LocationData[]) => void;
  searchTerm: string;
  materialTotals: MaterialTotal[];
  lang: Language;
}

export default function ListView({ locations, updateLocation, updateLocations, searchTerm, materialTotals, lang }: ListViewProps) {
  const [selectedLoc, setSelectedLoc] = useState<LocationData | null>(null);
  const [selectedLocIds, setSelectedLocIds] = useState<string[]>([]);
  const [customAreaName, setCustomAreaName] = useState('');

  const filtered = locations.filter(loc =>
    loc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loc.description && loc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (loc.batch && loc.batch.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    const regionA = a.customArea || a.row;
    const regionB = b.customArea || b.row;
    if (regionA !== regionB) {
      return regionA.localeCompare(regionB);
    }
    return a.id.localeCompare(b.id);
  });

  const regionSpans: Record<string, number> = {};
  filtered.forEach(loc => {
    const regionKey = loc.customArea || loc.row;
    regionSpans[regionKey] = (regionSpans[regionKey] || 0) + 1;
  });

  const renderedRegions = new Set<string>();

  const filteredMaterialTotals = materialTotals.filter(mt => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      mt.material.toLowerCase().includes(term) ||
      (mt.description && mt.description.toLowerCase().includes(term)) ||
      (mt.locations && mt.locations.some(loc => loc.toLowerCase().includes(term)))
    );
  });

  return (
    <div className="flex gap-4 h-full overflow-hidden">
      <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
        {selectedLocIds.length > 0 && (
          <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center gap-4 shrink-0">
            <span className="text-sm text-blue-800 font-medium">{t(lang, 'selectedCount', { count: selectedLocIds.length })}</span>
            <input 
              type="text" 
              placeholder={t(lang, 'customAreaPlaceholder')}
              value={customAreaName}
              onChange={e => setCustomAreaName(e.target.value)}
              className="border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={() => {
                if (!customAreaName.trim()) {
                  alert(t(lang, 'enterAreaName'));
                  return;
                }
                const updates = selectedLocIds.map(id => {
                  const loc = locations.find(l => l.id === id);
                  return loc ? { ...loc, customArea: customAreaName.trim() } : null;
                }).filter(Boolean) as LocationData[];
                updateLocations(updates);
                setSelectedLocIds([]);
                setCustomAreaName('');
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              {t(lang, 'mergeToArea')}
            </button>
            <button 
              onClick={() => {
                const updates = selectedLocIds.map(id => {
                  const loc = locations.find(l => l.id === id);
                  return loc ? { ...loc, customArea: undefined } : null;
                }).filter(Boolean) as LocationData[];
                updateLocations(updates);
                setSelectedLocIds([]);
              }}
              className="bg-white text-blue-600 border border-blue-200 px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors"
            >
              {t(lang, 'removeArea')}
            </button>
          </div>
        )}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse relative">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
            <tr className="border-b">
              <th className="p-4 font-medium text-gray-600 w-24 text-center border-r border-gray-200">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLocIds(filtered.map(l => l.id));
                    } else {
                      setSelectedLocIds([]);
                    }
                  }}
                  checked={selectedLocIds.length === filtered.length && filtered.length > 0}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-4 font-medium text-gray-600">{t(lang, 'location')}</th>
              <th className="p-4 font-medium text-gray-600">{t(lang, 'sapCode')}</th>
              <th className="p-4 font-medium text-gray-600">{t(lang, 'materialDesc')}</th>
              <th className="p-4 font-medium text-gray-600">{t(lang, 'batch')}</th>
              <th className="p-4 font-medium text-gray-600">{t(lang, 'quantity')}</th>
              <th className="p-4 font-medium text-gray-600">{t(lang, 'weight')}</th>
              <th className="p-4 font-medium text-gray-600 text-right">{t(lang, 'actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(loc => {
              const regionKey = loc.customArea || loc.row;
              const isFirstInRegion = !renderedRegions.has(regionKey);
              if (isFirstInRegion) {
                renderedRegions.add(regionKey);
              }

              return (
              <tr key={loc.id} className="border-b hover:bg-gray-50 transition-colors">
                {isFirstInRegion && (
                  <td 
                    rowSpan={regionSpans[regionKey]} 
                    className="p-4 font-bold text-2xl text-center bg-gray-100 border-r border-gray-200 text-gray-700 align-middle shadow-inner"
                  >
                    {loc.customArea ? `${loc.customArea}` : `${loc.row} ${t(lang, 'area')}`}
                  </td>
                )}
                <td className="p-4 font-medium">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={selectedLocIds.includes(loc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLocIds(prev => [...prev, loc.id]);
                        } else {
                          setSelectedLocIds(prev => prev.filter(id => id !== loc.id));
                        }
                      }}
                    />
                    {loc.id}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium
                      ${loc.status === 'empty' ? 'bg-gray-100 text-gray-600' : ''}
                      ${loc.status === 'occupied' ? 'bg-green-100 text-green-700' : ''}
                      ${loc.status === 'ng' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {loc.status === 'empty' ? t(lang, 'statusEmpty') : loc.status === 'occupied' ? t(lang, 'statusOccupied') : t(lang, 'statusNG')}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-mono text-sm">{loc.material || '-'}</td>
                <td className="p-4 text-sm">{loc.description || '-'}</td>
                <td className="p-4 text-sm">{loc.batch || '-'}</td>
                <td className="p-4">{loc.quantity || '-'}</td>
                <td className="p-4">{loc.weight || '-'}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setSelectedLoc(loc)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Edit2 size={16} />
                    <span className="text-sm">{t(lang, 'editLocation')}</span>
                  </button>
                </td>
              </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  {t(lang, 'noLocationsFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedLoc && (
        <EditModal
          location={selectedLoc}
          onClose={() => setSelectedLoc(null)}
          onSave={(updated) => {
            updateLocation(updated);
            setSelectedLoc(null);
          }}
          lang={lang}
        />
      )}
      </div>

      {/* Right Sidebar for Material Totals */}
      <div className="w-80 bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
          <span>{t(lang, 'inventorySummary')}</span>
          <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{filteredMaterialTotals.length} {t(lang, 'types')}</span>
        </div>
        <div className="overflow-y-auto flex-1 p-3">
          {filteredMaterialTotals.length === 0 ? (
            <div className="text-center text-gray-500 p-4 text-sm mt-10">
              <p>{t(lang, 'noInventoryData')}</p>
              <p className="mt-2 text-xs">{t(lang, 'clickSyncToLoad')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredMaterialTotals.map(mt => (
                <div key={mt.material} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="font-bold text-blue-700 text-sm">{mt.material}</div>
                  <div className="text-gray-600 text-xs mb-2 mt-1 line-clamp-2" title={mt.description}>{mt.description || '-'}</div>
                  <div className="flex justify-between items-center bg-white py-1 px-2 rounded border border-gray-100">
                    <div className="font-mono font-semibold text-gray-800">
                      {mt.totalQuantity} <span className="text-gray-400 text-xs font-sans">{t(lang, 'pieces')}</span>
                    </div>
                    <div className="font-mono font-semibold text-gray-800">
                      {mt.totalWeight.toLocaleString()} <span className="text-gray-400 text-xs font-sans">kg</span>
                    </div>
                  </div>
                  {mt.locations && mt.locations.length > 0 && (
                    <div className="text-xs font-mono text-gray-600 mt-2 flex flex-wrap items-center">
                      {mt.locations.map((locId, index) => {
                        const locData = locations.find(l => l.id === locId);
                        return (
                          <span key={locId} className="flex items-center">
                            <button
                              onClick={() => {
                                if (locData) {
                                  setSelectedLoc(locData);
                                }
                              }}
                              className="text-blue-600 hover:underline hover:text-blue-800 cursor-pointer"
                            >
                              {locId}
                            </button>
                            {index < mt.locations.length - 1 && (
                              <span className="mx-0.5 text-gray-400">_</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
