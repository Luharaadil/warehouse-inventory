import { useState, useEffect, useRef } from 'react';
import { LocationData } from '../types';
import EditModal from './EditModal';
import AreaModal from './AreaModal';
import { Language, t } from '../i18n';
import { CheckSquare, Square, X } from 'lucide-react';

const getAreaColorClasses = (areaName: string, horizontalText: boolean = false) => {
  const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', hover: 'hover:bg-blue-200' },
    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', hover: 'hover:bg-green-200' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', hover: 'hover:bg-purple-200' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300', hover: 'hover:bg-pink-200' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', hover: 'hover:bg-orange-200' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300', hover: 'hover:bg-teal-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', hover: 'hover:bg-indigo-200' },
    { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', hover: 'hover:bg-rose-200' },
  ];
  
  let hash = 0;
  for (let i = 0; i < areaName.length; i++) {
    hash = areaName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  const c = colors[index];
  
  const baseClasses = `text-center text-base font-bold rounded-lg border-2 truncate cursor-pointer transition-colors shadow-sm ${c.bg} ${c.text} ${c.border} ${c.hover}`;
  
  if (horizontalText) {
    return `${baseClasses} [writing-mode:vertical-rl] px-3 py-4 h-0 min-h-full`;
  }
  return `${baseClasses} px-4 py-3 w-0 min-w-full`;
};

interface MapViewProps {
  locations: LocationData[];
  updateLocation: (loc: LocationData) => void;
  updateLocations: (locs: LocationData[]) => void;
  searchTerm: string;
  activeTab: 'L101_GF' | 'L101_1F' | 'L103_GF';
  lang: Language;
}

export default function MapView({ locations, updateLocation, updateLocations, searchTerm, activeTab, lang }: MapViewProps) {
  const [selectedLoc, setSelectedLoc] = useState<LocationData | null>(null);
  const [selectedArea, setSelectedArea] = useState<{ name: string, locs: LocationData[] } | null>(null);
  
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedLocIds, setSelectedLocIds] = useState<Set<string>>(new Set());
  const [showBatchEditModal, setShowBatchEditModal] = useState(false);
  const [batchCustomArea, setBatchCustomArea] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [mapHeight, setMapHeight] = useState(1000);

  const getTargetWidth = () => {
    if (activeTab === 'L101_GF') return 1900;
    if (activeTab === 'L101_1F') return 1850;
    return 1200; // L103_GF
  };
  const TARGET_WIDTH = getTargetWidth();

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const scaleX = width / TARGET_WIDTH;
        const scaleY = height / (mapHeight || 1000);
        setScale(Math.min(scaleX, scaleY));
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [activeTab, TARGET_WIDTH, mapHeight]);

  useEffect(() => {
    if (mapRef.current) {
      setMapHeight(mapRef.current.scrollHeight);
    }
  }, [locations, activeTab]);

  const renderLocationBlock = (rowPrefix: string, startIndex: number, endIndex: number) => {
    const blockLocs = locations.filter(l => l.row === rowPrefix && l.index >= startIndex && l.index <= endIndex);
    
    const groups: { customArea: string | undefined, locs: LocationData[] }[] = [];
    let currentGroup: { customArea: string | undefined, locs: LocationData[] } | null = null;

    blockLocs.forEach(loc => {
      if (!currentGroup) {
        currentGroup = { customArea: loc.customArea, locs: [loc] };
      } else if (currentGroup.customArea === loc.customArea) {
        currentGroup.locs.push(loc);
      } else {
        groups.push(currentGroup);
        currentGroup = { customArea: loc.customArea, locs: [loc] };
      }
    });
    if (currentGroup) {
      groups.push(currentGroup);
    }

    return (
      <div className="flex gap-[2px] items-end">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1">
            {group.customArea && (
              <div 
                className={getAreaColorClasses(group.customArea)}
                onClick={() => {
                  const areaLocs = locations.filter(l => l.customArea === group.customArea);
                  setSelectedArea({ name: group.customArea!, locs: areaLocs });
                }}
              >
                {group.customArea}
              </div>
            )}
            <div className="flex gap-[2px]">
              {group.locs.map(loc => {
                const isMatch = searchTerm && (
                  loc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  loc.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (loc.description && loc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (loc.batch && loc.batch.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                const isDimmed = searchTerm && !isMatch;

                const isSelected = selectedLocIds.has(loc.id);
                let bgColor = 'bg-white border-gray-400 text-gray-600';
                if (loc.status === 'occupied') bgColor = 'bg-[#a67c00] border-[#8b6508] text-white'; 
                if (loc.status === 'ng') bgColor = 'bg-red-600 border-red-800 text-white';
                if (isMatch) bgColor = 'bg-blue-500 border-blue-700 text-white shadow-lg transform scale-110 z-10';
                if (isSelected) bgColor = 'bg-blue-200 border-blue-500 text-blue-900 shadow-md ring-2 ring-blue-500';

                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      if (isMultiSelectMode) {
                        const newSet = new Set(selectedLocIds);
                        if (newSet.has(loc.id)) newSet.delete(loc.id);
                        else newSet.add(loc.id);
                        setSelectedLocIds(newSet);
                      } else {
                        setSelectedLoc(loc);
                      }
                    }}
                    className={`
                      relative w-8 h-24 border flex flex-col items-center justify-between py-1 cursor-pointer transition-all
                      ${bgColor}
                      ${isDimmed && !isSelected ? 'opacity-20' : 'opacity-100 hover:shadow-md hover:-translate-y-1'}
                    `}
                    title={`${loc.id}\n${loc.material}\n${loc.description || ''}\nBatch: ${loc.batch || ''}\n數量: ${loc.quantity}\n重量: ${loc.weight}`}
                  >
                    {isMultiSelectMode && (
                      <div className="absolute top-0 right-0 p-0.5">
                        {isSelected ? <CheckSquare size={12} className="text-blue-600 bg-white rounded-sm" /> : <Square size={12} className="text-gray-400 bg-white/50 rounded-sm" />}
                      </div>
                    )}
                    <div className="flex-1 flex items-center justify-center min-h-0 w-full">
                      <span className="font-black text-lg leading-none -rotate-90 whitespace-nowrap tracking-wider">{loc.id}</span>
                    </div>
                    <div className="flex flex-col items-center w-full shrink-0 min-w-0">
                      <span className="text-sm font-mono font-bold bg-white/80 text-black w-full text-center truncate py-0.5 leading-none">{loc.quantity || '\u00A0'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderL101_GF = () => (
    <div className="flex flex-col gap-12" style={{ width: `${TARGET_WIDTH}px` }}>
      {/* Part 1 */}
      <div className="flex flex-col gap-10 bg-[#f4f400] p-8 rounded-xl shadow-lg">
        <div className="text-2xl font-bold text-gray-800 border-b-2 border-gray-800 pb-2">L101_GF (前半部)</div>
        {/* Row K Left */}
        <div className="flex items-center gap-6">
          {renderLocationBlock('K', 13, 43)}
          <div className="bg-gray-100 border-4 border-purple-500 w-[400px] h-32 flex items-center justify-center font-bold text-4xl text-purple-800 shadow-sm text-center">
            碳煙輸送太空包<br/>投料作業區
          </div>
          <div className="bg-gray-100 border-4 border-gray-500 w-[150px] h-32 flex items-center justify-center font-bold text-3xl text-gray-800 shadow-sm">
            下腳品
          </div>
        </div>

        {/* Row L Left */}
        <div className="flex items-center gap-6">
          <div className="bg-[#a8e6cf] border-2 border-green-600 w-[120px] h-24 flex items-center justify-center font-bold text-lg text-green-900 shadow-sm">
            文書辦公區
          </div>
          <div className="bg-[#dcedc1] border-4 border-blue-500 w-[200px] h-24 flex items-center justify-center font-bold text-3xl text-blue-900 shadow-sm">
            卸貨暫存區
          </div>
          {renderLocationBlock('L', 11, 45)}
        </div>

        {/* Rows M, N, P Left */}
        <div className="flex gap-6">
          <div className="bg-white border-8 border-red-600 w-32 flex items-center justify-center shadow-sm shrink-0 relative">
            <div className="-rotate-90 whitespace-nowrap font-black text-4xl tracking-widest text-gray-800 absolute">
              LOADING BAY / RAMP DN
            </div>
          </div>
          <div className="flex flex-col gap-10 flex-1">
            <div className="flex gap-6 items-stretch">
              <div className="flex flex-col gap-10">
                <div className="flex items-center gap-6">
                  {renderLocationBlock('M', 20, 36)}
                  <div className="bg-red-600 border-4 border-red-800 w-24 h-24 flex items-center justify-center font-black text-3xl text-white shadow-sm shrink-0">
                    NG
                  </div>
                  {renderLocationBlock('M', 37, 63)}
                </div>
                <div className="flex items-center gap-6">
                  {renderLocationBlock('N', 1, 33)}
                  <div className="bg-gray-100 border-4 border-gray-500 w-[300px] h-24 flex items-center justify-center font-bold text-3xl text-gray-800 shadow-sm shrink-0">
                    開箱作業區
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {renderLocationBlock('P', 3, 45)}
            </div>
          </div>
        </div>
      </div>

      {/* Part 2 */}
      <div className="flex flex-col gap-10 bg-[#f4f400] p-8 rounded-xl shadow-lg">
        <div className="text-2xl font-bold text-gray-800 border-b-2 border-gray-800 pb-2">L101_GF (後半部)</div>
        {/* Row K Right */}
        <div className="flex items-center gap-6">
          {renderLocationBlock('K', 46, 83)}
        </div>

        {/* Row L Right */}
        <div className="flex items-center gap-6">
          {renderLocationBlock('L', 46, 90)}
        </div>

        {/* Rows M, N, P Right */}
        <div className="flex gap-6">
          <div className="flex flex-col gap-10 flex-1">
            <div className="flex gap-6 items-stretch">
              <div className="bg-gray-100 border-4 border-yellow-500 w-[400px] flex items-center justify-center font-bold text-4xl text-gray-800 shadow-sm shrink-0">
                件裝膠輸送機
              </div>
              <div className="flex flex-col gap-10">
                <div className="flex items-center gap-6">
                  {renderLocationBlock('M', 66, 84)}
                </div>
                <div className="flex items-center gap-6">
                  {renderLocationBlock('N', 40, 57)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {renderLocationBlock('P', 46, 88)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const generateBins = (prefix: string, start: number, end: number, reverse = false) => {
    const bins = [];
    if (reverse) {
      for (let i = start; i <= end; i++) {
        bins.push(`${prefix}${i.toString().padStart(2, '0')}`);
      }
    } else {
      for (let i = start; i >= end; i--) {
        bins.push(`${prefix}${i.toString().padStart(2, '0')}`);
      }
    }
    return bins;
  };

  const renderL101_1F = () => {
    return (
      <div className="flex flex-col gap-12" style={{ width: `${TARGET_WIDTH}px` }}>
        {/* Part 1 */}
        <div className="flex flex-col gap-10 bg-[#f4f400] p-8 rounded-xl shadow-lg">
          <div className="text-2xl font-bold text-gray-800 border-b-2 border-gray-800 pb-2">L101_1F (前半部)</div>
          <div className="flex flex-col gap-12 bg-white p-6 rounded-lg shadow-sm">
            {/* Row 1 */}
            <div className="flex items-center gap-6">
              {renderFlexLocationBlock(generateBins('S', 102, 78), 'w-8 h-24')}
            </div>
            {/* Row 2 */}
            <div className="flex items-center gap-6">
              {renderFlexLocationBlock(generateBins('T', 102, 81), 'w-8 h-24')}
              <div className="border-4 border-blue-400 bg-blue-50 w-[300px] h-24 flex items-center justify-center text-2xl font-bold text-blue-800 shadow-sm">TEMP</div>
            </div>
            {/* Row 3 */}
            <div className="flex items-center gap-6">
              {renderFlexLocationBlock(generateBins('F', 102, 72), 'w-8 h-24')}
              <div className="border-4 border-green-500 bg-green-50 w-[400px] h-24 flex items-center justify-center text-2xl font-bold text-green-800 shadow-sm">Mixing Area</div>
            </div>
            {/* Row 4 */}
            <div className="flex items-start gap-6">
              <div className="border-4 border-purple-600 bg-yellow-300 w-[700px] h-48 flex items-center justify-center text-3xl font-bold text-gray-800 shadow-sm">小藥品秤量作業區</div>
              <div className="flex flex-col gap-12">
                {renderFlexLocationBlock(generateBins('Q', 1, 12, true), 'w-8 h-24')}
                <div className="border-4 border-blue-800 bg-orange-300 w-[400px] h-24 flex items-center justify-center text-3xl font-bold text-gray-800 shadow-sm">單刀切膠作業區</div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2 */}
        <div className="flex flex-col gap-10 bg-[#f4f400] p-8 rounded-xl shadow-lg">
          <div className="text-2xl font-bold text-gray-800 border-b-2 border-gray-800 pb-2">L101_1F (後半部)</div>
          <div className="flex flex-col gap-12 bg-white p-6 rounded-lg shadow-sm">
            {/* Row 1 */}
            <div className="flex items-center gap-6">
              {renderFlexLocationBlock(generateBins('S', 46, 18), 'w-8 h-24')}
              <div className="w-8"></div>
              {renderFlexLocationBlock(generateBins('S', 16, 1), 'w-8 h-24')}
            </div>
            {/* Row 2 */}
            <div className="flex items-center gap-6">
              {renderFlexLocationBlock(generateBins('T', 46, 18), 'w-8 h-24')}
              <div className="w-16"></div>
              {renderFlexLocationBlock(generateBins('T', 15, 1), 'w-8 h-24')}
            </div>
            {/* Row 3 */}
            <div className="flex items-center gap-6">
              <div className="border-4 border-green-500 bg-green-50 w-24 h-24 flex items-center justify-center text-xl font-bold text-green-800 shadow-sm">Mix</div>
              {renderFlexLocationBlock(generateBins('F', 46, 18), 'w-8 h-24')}
              <div className="w-16"></div>
              {renderFlexLocationBlock(generateBins('F', 15, 1), 'w-8 h-24')}
            </div>
            {/* Row 4 */}
            <div className="flex items-center gap-6">
              {renderFlexLocationBlock(generateBins('G', 46, 31), 'w-8 h-24')}
              <div className="border-4 border-blue-400 bg-blue-50 w-[160px] h-24 flex items-center justify-center text-xl font-bold text-blue-800 shadow-sm">樓梯</div>
              {renderFlexLocationBlock(generateBins('G', 25, 18), 'w-8 h-24')}
              <div className="w-8"></div>
              {renderFlexLocationBlock(generateBins('G', 16, 1), 'w-8 h-24')}
            </div>
            {/* Row 5 & 6 */}
            <div className="flex items-start gap-6">
              <div className="border-4 border-blue-800 bg-orange-300 w-[300px] h-[240px] flex items-center justify-center text-2xl font-bold text-gray-800 shadow-sm">單刀切膠作業區</div>
              <div className="flex flex-col gap-12">
                <div className="flex items-center gap-6">
                  {renderFlexLocationBlock(generateBins('H', 34, 18), 'w-8 h-24')}
                  <div className="w-8"></div>
                  {renderFlexLocationBlock(generateBins('I', 16, 1), 'w-8 h-24')}
                </div>
                <div className="flex items-center gap-6">
                  {renderFlexLocationBlock(generateBins('I', 36, 18), 'w-8 h-24')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFlexLocationBlock = (ids: string[], className: string, horizontalText: boolean = false) => {
    const blockLocs = ids.map(id => locations.find(l => l.id === id) || { id, status: 'empty', material: '', description: '', batch: '', quantity: '', weight: '', row: id.charAt(0), index: parseInt(id.slice(1), 10) } as LocationData);
    
    const groups: { customArea: string | undefined, locs: LocationData[] }[] = [];
    let currentGroup: { customArea: string | undefined, locs: LocationData[] } | null = null;

    blockLocs.forEach(loc => {
      if (!currentGroup) {
        currentGroup = { customArea: loc.customArea, locs: [loc] };
      } else if (currentGroup.customArea === loc.customArea) {
        currentGroup.locs.push(loc);
      } else {
        groups.push(currentGroup);
        currentGroup = { customArea: loc.customArea, locs: [loc] };
      }
    });
    if (currentGroup) {
      groups.push(currentGroup);
    }

    return (
      <div className={`flex gap-1 ${horizontalText ? 'flex-col' : 'items-end'}`}>
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className={`flex gap-1 ${horizontalText ? 'flex-row items-center' : 'flex-col'}`}>
            {group.customArea && (
              <div 
                className={getAreaColorClasses(group.customArea, horizontalText)}
                onClick={() => {
                  const areaLocs = locations.filter(l => l.customArea === group.customArea);
                  setSelectedArea({ name: group.customArea!, locs: areaLocs });
                }}
              >
                {group.customArea}
              </div>
            )}
            <div className={`flex gap-1 ${horizontalText ? 'flex-col' : ''}`}>
              {group.locs.map(loc => {
                const isMatch = searchTerm && (
                  loc.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  loc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  loc.batch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  loc.id.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                const isSelected = selectedLocIds.has(loc.id);
                let bgColor = 'bg-white border-gray-400 text-gray-600';
                if (loc.status === 'occupied') bgColor = 'bg-[#a67c00] border-[#8b6508] text-white'; 
                if (loc.status === 'ng') bgColor = 'bg-red-600 border-red-800 text-white';
                if (isMatch) bgColor = 'bg-blue-500 border-blue-700 text-white shadow-lg transform scale-110 z-10';
                if (isSelected) bgColor = 'bg-blue-200 border-blue-500 text-blue-900 shadow-md ring-2 ring-blue-500';
                
                return (
                  <div
                    key={loc.id}
                    className={`relative border flex items-center justify-between cursor-pointer transition-all overflow-hidden shrink-0
                      ${horizontalText ? 'flex-row px-2' : 'flex-col py-1'}
                      ${bgColor} ${className}
                      ${searchTerm && !isMatch && !isSelected ? 'opacity-20' : 'opacity-100 hover:shadow-md hover:-translate-y-1'}
                    `}
                    onClick={() => {
                      if (isMultiSelectMode) {
                        const newSet = new Set(selectedLocIds);
                        if (newSet.has(loc.id)) newSet.delete(loc.id);
                        else newSet.add(loc.id);
                        setSelectedLocIds(newSet);
                      } else {
                        setSelectedLoc(loc);
                      }
                    }}
                    title={`${loc.id}\n${loc.material}\n${loc.description || ''}\nBatch: ${loc.batch || ''}\n數量: ${loc.quantity}\n重量: ${loc.weight}`}
                  >
                    {isMultiSelectMode && (
                      <div className="absolute top-0 right-0 p-0.5">
                        {isSelected ? <CheckSquare size={12} className="text-blue-600 bg-white rounded-sm" /> : <Square size={12} className="text-gray-400 bg-white/50 rounded-sm" />}
                      </div>
                    )}
                    <div className={`flex-1 flex items-center justify-center min-h-0 min-w-0 ${horizontalText ? 'h-full' : 'w-full'}`}>
                      <span className={`font-black text-lg leading-none whitespace-nowrap tracking-wider ${horizontalText ? '' : '-rotate-90'}`}>{loc.id}</span>
                    </div>
                    {loc.status === 'occupied' && (
                      <div className={`flex items-center shrink-0 min-w-0 ${horizontalText ? 'w-auto ml-1' : 'flex-col w-full mt-1'}`}>
                        <span className="text-sm font-mono font-bold bg-white/80 text-black text-center truncate px-1 py-0.5 leading-none w-full">{loc.quantity || '\u00A0'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderL103_GF = () => {
    const rowU1 = generateBins('U', 18, 1);
    const rowU2_1 = generateBins('U', 31, 27);
    const rowU2_2 = generateBins('U', 26, 23);
    const rowU2_3 = generateBins('U', 22, 19);
    
    const colV1 = generateBins('V', 1, 10, true);
    const colV2 = generateBins('V', 11, 18, true);

    return (
      <div className="flex flex-col gap-6 bg-[#ffff00] p-8 rounded-xl shadow-lg" style={{ width: `${TARGET_WIDTH}px` }}>
        <div className="flex justify-between items-end mb-2">
          <div className="text-2xl font-bold text-gray-800 border-b-2 border-gray-800 pb-2">L103_GF</div>
          <div className="border-4 border-[#00a2e8] bg-gray-100 w-48 h-20 flex items-center justify-center text-2xl font-bold text-gray-800 shadow-sm">
            暫存區
          </div>
        </div>

        {/* Top Rows (U) */}
        <div className="flex flex-col gap-4 bg-white p-6 rounded-lg border-2 border-gray-300 shadow-sm">
          {/* U18 - U01 */}
          <div className="flex flex-col">
            <div className="flex text-center text-sm font-bold text-gray-600 mb-1">
              <div className="w-[72px]">N/A</div>
              <div className="flex-1 border-x border-gray-400">1260D/2/23.5E N6 SRF</div>
              <div className="w-[300px]">0.955MM TATA STEEL</div>
            </div>
            <div className="flex gap-1">
              {renderFlexLocationBlock(rowU1, 'w-[72px] h-24')}
            </div>
          </div>
          
          {/* U31 - U19 */}
          <div className="flex flex-col mt-4">
            <div className="flex text-center text-sm font-bold text-gray-600 mb-1">
              <div className="w-[376px] border-r border-gray-400">1260D/2/25E N6 SRF</div>
              <div className="flex-1">1260D/2/23.5E N6 SRF</div>
            </div>
            <div className="flex gap-1">
              {renderFlexLocationBlock(rowU2_1, 'w-[72px] h-24')}
              <div className="w-[72px] h-24 bg-[#b5651d] border-2 border-[#8b4513]"></div>
              {renderFlexLocationBlock(rowU2_2, 'w-[72px] h-24')}
              <div className="w-[72px] h-24 bg-red-600 border-2 border-red-800 flex items-center justify-center">
                <span className="text-white font-bold tracking-widest" style={{ writingMode: 'vertical-rl' }}>吊掛區</span>
              </div>
              {renderFlexLocationBlock(rowU2_3, 'w-[72px] h-24')}
            </div>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="flex gap-6 mt-4">
          {/* V Column */}
          <div className="flex flex-col gap-1 bg-white p-4 rounded-lg border-2 border-gray-300 w-fit shadow-sm">
            {renderFlexLocationBlock(colV1, 'w-24 h-12', true)}
            <div className="w-24 h-12 bg-yellow-300 border-2 border-yellow-500"></div>
            {renderFlexLocationBlock(colV2, 'w-24 h-12', true)}
          </div>

          {/* Stairs */}
          <div className="w-24 bg-[#00a2e8] border-2 border-blue-600 flex items-center justify-center h-[400px] shadow-sm">
            <span className="text-3xl font-bold text-black tracking-widest" style={{ writingMode: 'vertical-rl' }}>樓梯</span>
          </div>

          {/* Steel Wire Workspace */}
          <div className="flex-1 border-[24px] border-red-600 bg-gray-100 flex items-center justify-center min-h-[600px] shadow-sm">
            <span className="text-7xl font-bold text-black tracking-widest">鋼絲作業區</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full relative">
      {isMultiSelectMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white rounded-full shadow-lg border border-blue-200 px-6 py-3 flex items-center gap-4">
          <span className="font-bold text-blue-800">
            {t(lang, 'selectedCount', { count: selectedLocIds.size })}
          </span>
          <div className="w-px h-6 bg-gray-300"></div>
          <button
            onClick={() => setSelectedLocIds(new Set())}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t(lang, 'clearSelection')}
          </button>
          <button
            onClick={() => setShowBatchEditModal(true)}
            disabled={selectedLocIds.size === 0}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(lang, 'batchEditArea')}
          </button>
          <button
            onClick={() => {
              setIsMultiSelectMode(false);
              setSelectedLocIds(new Set());
            }}
            className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-md text-sm font-bold hover:bg-gray-300"
          >
            {t(lang, 'exitMultiSelect')}
          </button>
        </div>
      )}
      {!isMultiSelectMode && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={() => setIsMultiSelectMode(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm font-bold hover:bg-gray-50 flex items-center gap-2"
          >
            <CheckSquare size={18} />
            {t(lang, 'multiSelectMode')}
          </button>
        </div>
      )}
      
      <div className="flex gap-4 flex-1 min-h-0">
        <div ref={containerRef} className="bg-gray-200 rounded-xl shadow-inner flex-1 overflow-hidden p-4 flex justify-center items-center">
          <div style={{ height: mapHeight * scale, width: TARGET_WIDTH * scale, transition: 'height 0.2s, width 0.2s' }}>
            <div 
              ref={mapRef}
              style={{ 
                transform: `scale(${scale})`, 
                transformOrigin: 'top left',
                width: `${TARGET_WIDTH}px`
              }}
              className="relative"
            >
              {activeTab === 'L101_GF' && renderL101_GF()}
              {activeTab === 'L101_1F' && renderL101_1F()}
              {activeTab === 'L103_GF' && renderL103_GF()}
            </div>
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

          {selectedArea && (
            <AreaModal
              areaName={selectedArea.name}
              locations={selectedArea.locs}
              onClose={() => setSelectedArea(null)}
              lang={lang}
            />
          )}
        </div>
      </div>

      {showBatchEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <h3 className="text-lg font-bold">{t(lang, 'batchEditArea')}</h3>
              <button type="button" onClick={() => setShowBatchEditModal(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'customArea')}</label>
              <input
                type="text"
                value={batchCustomArea}
                onChange={e => setBatchCustomArea(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t(lang, 'customAreaPlaceholder')}
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowBatchEditModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                {t(lang, 'cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const updatedLocs = Array.from(selectedLocIds).map((id: string) => {
                    const loc = locations.find(l => l.id === id);
                    return {
                      ...(loc || { id, status: 'empty', material: '', description: '', batch: '', quantity: '', weight: '', row: id.charAt(0), index: parseInt(id.slice(1), 10) }),
                      customArea: batchCustomArea || undefined
                    } as LocationData;
                  });
                  updateLocations(updatedLocs);
                  setShowBatchEditModal(false);
                  setIsMultiSelectMode(false);
                  setSelectedLocIds(new Set());
                  setBatchCustomArea('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {t(lang, 'save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
