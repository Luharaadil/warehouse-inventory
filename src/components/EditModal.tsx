import React, { useState, useEffect } from 'react';
import { LocationData } from '../types';
import { X } from 'lucide-react';
import { Language, t } from '../i18n';

interface EditModalProps {
  location: LocationData;
  onClose: () => void;
  onSave: (loc: LocationData) => void;
  lang: Language;
}

export default function EditModal({ location, onClose, onSave, lang }: EditModalProps) {
  const [formData, setFormData] = useState<LocationData>(location);

  useEffect(() => {
    setFormData(location);
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-update status based on material
    let newStatus = formData.status;
    if (formData.material && formData.status === 'empty') {
      newStatus = 'occupied';
    } else if (!formData.material && formData.status === 'occupied') {
      newStatus = 'empty';
    }

    onSave({ ...formData, status: newStatus });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h3 className="text-lg font-bold">{t(lang, 'editLocation')} {location.id}</h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'customArea')}</label>
              <input
                type="text"
                value={formData.customArea || ''}
                onChange={e => setFormData({ ...formData, customArea: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t(lang, 'customAreaPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'status')}</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="empty">{t(lang, 'statusEmpty')}</option>
                <option value="occupied">{t(lang, 'statusOccupied')}</option>
                <option value="ng">{t(lang, 'statusNG')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'sapCode')}</label>
              <input
                type="text"
                value={formData.material}
                onChange={e => setFormData({ ...formData, material: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                placeholder={t(lang, 'sapCodePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'batch')}</label>
              <input
                type="text"
                value={formData.batch || ''}
                onChange={e => setFormData({ ...formData, batch: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t(lang, 'batchPlaceholder')}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'materialDesc')}</label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t(lang, 'materialDescPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'quantity')}</label>
              <input
                type="text"
                value={formData.quantity || ''}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'weight')}</label>
              <input
                type="text"
                value={formData.weight || ''}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.0"
              />
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 bg-white"
            >
              {t(lang, 'cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              {t(lang, 'save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
