import { LocationData } from '../types';
import { X } from 'lucide-react';
import { Language, t } from '../i18n';

interface AreaModalProps {
  areaName: string;
  locations: LocationData[];
  onClose: () => void;
  lang: Language;
}

export default function AreaModal({ areaName, locations, onClose, lang }: AreaModalProps) {
  // 總計重量
  const totalWeight = locations.reduce((sum, loc) => {
    const w = parseFloat(String(loc.weight));
    return sum + (isNaN(w) ? 0 : w);
  }, 0);

  // 總計數量(件數)
  const totalQuantity = locations.reduce((sum, loc) => {
    const q = parseFloat(String(loc.quantity));
    return sum + (isNaN(q) ? 0 : q);
  }, 0);

  // 原材料 (Material)
  const descriptions = Array.from(new Set(locations.map(l => l.description).filter(Boolean)));

  // SAP CODE (Material 欄位A)
  const materials = Array.from(new Set(locations.map(l => l.material).filter(Boolean)));

  // Batch
  const batches = Array.from(new Set(locations.map(l => l.batch).filter(Boolean)));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{t(lang, 'areaInfo')}: {areaName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-600 font-medium mb-1">{t(lang, 'totalWeight')}</div>
              <div className="text-2xl font-bold text-blue-900">{totalWeight.toLocaleString()} <span className="text-sm font-normal">kg</span></div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-green-600 font-medium mb-1">{t(lang, 'totalQuantity')}</div>
              <div className="text-2xl font-bold text-green-900">{totalQuantity.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 font-medium mb-1">{t(lang, 'materialDesc')}</div>
            <div className="font-medium text-gray-800">
              {descriptions.length > 0 ? descriptions.join(', ') : '-'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 font-medium mb-1">{t(lang, 'sapCode')}</div>
            <div className="font-medium text-gray-800">
              {materials.length > 0 ? materials.join(', ') : '-'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 font-medium mb-1">{t(lang, 'batch')}</div>
            <div className="font-medium text-gray-800">
              {batches.length > 0 ? batches.join(', ') : '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
