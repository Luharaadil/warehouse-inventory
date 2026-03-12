import { Search, Map, List, Package, RefreshCw, Globe } from 'lucide-react';
import { Language, t } from '../i18n';

interface HeaderProps {
  view: 'map' | 'list';
  setView: (v: 'map' | 'list') => void;
  activeTab: 'L101_GF' | 'L101_1F' | 'L103_GF';
  setActiveTab: (t: 'L101_GF' | 'L101_1F' | 'L103_GF') => void;
  searchTerm: string;
  setSearchTerm: (t: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  lang: Language;
  setLang: (l: Language) => void;
}

export default function Header({ view, setView, activeTab, setActiveTab, searchTerm, setSearchTerm, onSync, isSyncing, lang, setLang }: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-blue-600">
          <Package size={24} />
          <h1 className="font-bold text-xl hidden sm:block">{t(lang, 'title')}</h1>
        </div>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t(lang, 'searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            >
              <Globe size={16} />
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {(['L101_GF', 'L101_1F', 'L103_GF'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors border ${
                isSyncing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'
              }`}
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              <span className="hidden sm:block">{isSyncing ? t(lang, 'syncing') : t(lang, 'syncData')}</span>
            </button>

            <div className="flex bg-gray-100 p-1 rounded-lg ml-2">
              <button
                onClick={() => setView('map')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                  view === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map size={16} />
                <span className="hidden sm:block">{t(lang, 'mapView')}</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                  view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} />
                <span className="hidden sm:block">{t(lang, 'listView')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
