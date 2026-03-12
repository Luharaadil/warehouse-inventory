import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import ListView from './components/ListView';
import Header from './components/Header';
import { LocationData, MaterialTotal } from './types';
import { initialLocations } from './data/initialData';
import { fetchInventoryData } from './services/googleSheetsService';
import { Language } from './i18n';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('warehouse_lang') as Language) || 'zh';
  });

  const [locations, setLocations] = useState<LocationData[]>(() => {
    const saved = localStorage.getItem('warehouse_locations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LocationData[];
        // Merge parsed with initialLocations to ensure new bins are included
        const merged = [...initialLocations];
        parsed.forEach(savedLoc => {
          const index = merged.findIndex(l => l.id === savedLoc.id);
          if (index !== -1) {
            merged[index] = { ...merged[index], ...savedLoc };
          } else {
            merged.push(savedLoc);
          }
        });
        return merged;
      } catch (e) {
        console.error('Failed to parse locations from local storage');
      }
    }
    return initialLocations;
  });

  const [materialTotals, setMaterialTotals] = useState<MaterialTotal[]>(() => {
    const saved = localStorage.getItem('warehouse_material_totals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse material totals from local storage');
      }
    }
    return [];
  });

  const [view, setView] = useState<'map' | 'list'>('map');
  const [activeTab, setActiveTab] = useState<'L101_GF' | 'L101_1F' | 'L103_GF'>('L101_GF');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem('warehouse_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('warehouse_material_totals', JSON.stringify(materialTotals));
  }, [materialTotals]);

  const updateLocation = (updatedLocation: LocationData) => {
    setLocations(prev => prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
  };

  const updateLocations = (updatedLocations: LocationData[]) => {
    setLocations(prev => prev.map(loc => {
      const update = updatedLocations.find(u => u.id === loc.id);
      return update ? update : loc;
    }));
  };

  useEffect(() => {
    localStorage.setItem('warehouse_lang', lang);
  }, [lang]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { updates, materialTotals: newTotals } = await fetchInventoryData();
      
      setLocations(prevLocations => {
        const newLocations = [...prevLocations];
        
        // Update existing locations
        const updatedLocations = newLocations.map(loc => {
          const update = updates[loc.id];
          if (update) {
            return {
              ...loc,
              material: update.material || '',
              description: update.description || '',
              batch: update.batch || '',
              quantity: update.quantity || '',
              weight: update.weight || '',
              status: update.status || 'occupied'
            };
          } else {
            // If location is not in the sheet, mark it as empty
            return {
              ...loc,
              material: '',
              description: '',
              batch: '',
              quantity: '',
              weight: '',
              status: 'empty'
            };
          }
        });

        // Add any new locations from the sheet that aren't in our initial data
        Object.keys(updates).forEach(binId => {
          if (!updatedLocations.find(loc => loc.id === binId)) {
            const update = updates[binId];
            updatedLocations.push({
              id: binId,
              row: binId.charAt(0),
              index: parseInt(binId.slice(1), 10) || 0,
              material: update.material || '',
              description: update.description || '',
              batch: update.batch || '',
              quantity: update.quantity || '',
              weight: update.weight || '',
              status: update.status || 'occupied'
            });
          }
        });

        return updatedLocations;
      });
      setMaterialTotals(newTotals);
      alert('同步成功！');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('同步失敗，請檢查網路連線或資料表權限。');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header 
        view={view} 
        setView={setView} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        onSync={handleSync}
        isSyncing={isSyncing}
        lang={lang}
        setLang={setLang}
      />
      <main className="flex-1 p-4 overflow-hidden">
        {view === 'map' ? (
          <MapView 
            locations={locations} 
            updateLocation={updateLocation} 
            updateLocations={updateLocations}
            searchTerm={searchTerm} 
            activeTab={activeTab}
            lang={lang}
          />
        ) : (
          <ListView 
            locations={locations} 
            updateLocation={updateLocation} 
            updateLocations={updateLocations}
            searchTerm={searchTerm} 
            materialTotals={materialTotals}
            lang={lang}
          />
        )}
      </main>
    </div>
  );
}
