import Papa from 'papaparse';
import { LocationData, MaterialTotal } from '../types';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1gQN98nrZx0HYfqXE35_HVjxMy0Y7XVXD/export?format=csv&gid=1029866475';

export interface SheetRow {
  'Material': string;
  'Storage Bin': string;
  'Available stock': string;
  'Material Description': string;
  'Batch': string;
  [key: string]: any;
}

export async function fetchInventoryData(): Promise<{ updates: Record<string, Partial<LocationData>>, materialTotals: MaterialTotal[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as SheetRow[];
        
        // Group by Storage Bin -> Material -> { quantity, weight, description, batches }
        const binData: Record<string, Record<string, { quantity: number; weight: number; description: string; batches: Set<string> }>> = {};
        
        // Group by Material -> { description, totalWeight, totalQuantity, locations }
        const totalsData: Record<string, { description: string; totalWeight: number; totalQuantity: number; locations: Set<string> }> = {};

        data.forEach(row => {
          const bin = row['Storage Bin']?.trim();
          const material = row['Material']?.trim() || '';
          const description = row['Material Description']?.trim() || '';
          const stockStr = row['Available stock']?.trim() || '0';
          const batch = row['Batch']?.trim() || '';

          const stock = parseFloat(stockStr.replace(/,/g, '')) || 0;

          if (material) {
            if (!totalsData[material]) {
              totalsData[material] = { description, totalWeight: 0, totalQuantity: 0, locations: new Set() };
            }
            totalsData[material].totalWeight += stock;
            totalsData[material].totalQuantity += 1;
            if (bin) {
              totalsData[material].locations.add(bin);
            }
            // Update description if it was empty before
            if (!totalsData[material].description && description) {
              totalsData[material].description = description;
            }
          }

          if (!bin) return;

          if (!binData[bin]) {
            binData[bin] = {};
          }
          if (!binData[bin][material]) {
            binData[bin][material] = { quantity: 0, weight: 0, description, batches: new Set() };
          }

          binData[bin][material].quantity += 1;
          binData[bin][material].weight += stock;
          if (batch) {
            binData[bin][material].batches.add(batch);
          }
          if (!binData[bin][material].description && description) {
            binData[bin][material].description = description;
          }
        });

        // Convert to Partial<LocationData>
        const updates: Record<string, Partial<LocationData>> = {};
        for (const [bin, materials] of Object.entries(binData)) {
          const materialCodes = Object.keys(materials).filter(Boolean);
          
          let totalQuantity = 0;
          let materialNames: string[] = [];
          let materialDescriptions: string[] = [];
          let weightDisplays: string[] = [];
          let batchDisplays: string[] = [];

          if (materialCodes.length > 1) {
            for (const code of materialCodes) {
              const info = materials[code];
              totalQuantity += info.quantity;
              materialNames.push(code);
              if (info.description) materialDescriptions.push(info.description);
              // If multiple materials in one bin, show "Code: Weight"
              weightDisplays.push(`${code}: ${info.weight}`);
              if (info.batches.size > 0) {
                batchDisplays.push(`${code}: ${Array.from(info.batches).join(', ')}`);
              }
            }
          } else if (materialCodes.length === 1) {
            const code = materialCodes[0];
            const info = materials[code];
            totalQuantity += info.quantity;
            materialNames.push(code);
            if (info.description) materialDescriptions.push(info.description);
            weightDisplays.push(info.weight.toString());
            if (info.batches.size > 0) {
              batchDisplays.push(Array.from(info.batches).join(', '));
            }
          } else {
            // Fallback if no material code but has weight
            const emptyMat = materials[''];
            if (emptyMat) {
              totalQuantity += emptyMat.quantity;
              if (emptyMat.description) materialDescriptions.push(emptyMat.description);
              weightDisplays.push(emptyMat.weight.toString());
              if (emptyMat.batches.size > 0) {
                batchDisplays.push(Array.from(emptyMat.batches).join(', '));
              }
            }
          }

          updates[bin] = {
            material: materialNames.join(', '),
            description: materialDescriptions.join(', '),
            quantity: totalQuantity,
            weight: weightDisplays.join(', ') || '0',
            batch: batchDisplays.join(' | '),
            status: totalQuantity > 0 ? 'occupied' : 'empty'
          };
        }

        const materialTotals: MaterialTotal[] = Object.entries(totalsData).map(([material, info]) => ({
          material,
          description: info.description,
          totalWeight: info.totalWeight,
          totalQuantity: info.totalQuantity,
          locations: Array.from(info.locations).sort()
        })).sort((a, b) => b.totalWeight - a.totalWeight);

        resolve({ updates, materialTotals });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}
