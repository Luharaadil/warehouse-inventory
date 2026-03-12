import { LocationData } from '../types';

const generateRow = (rowPrefix: string, start: number, end: number, defaultMaterial: string = '', quantities: (number|string)[] = []): LocationData[] => {
  const locations: LocationData[] = [];
  for (let i = start; i <= end; i++) {
    const id = `${rowPrefix}${i.toString().padStart(2, '0')}`;
    const qIndex = i - start;
    const quantity = quantities[qIndex] !== undefined ? quantities[qIndex] : '';
    locations.push({
      id,
      row: rowPrefix,
      index: i,
      material: defaultMaterial,
      quantity: quantity,
      weight: '',
      status: defaultMaterial ? 'occupied' : 'empty'
    });
  }
  return locations;
};

export const initialLocations: LocationData[] = [
  // Row K
  ...generateRow('K', 13, 16),
  ...generateRow('K', 17, 22, '824'),
  ...generateRow('K', 23, 28, '7000GR', [7, 8, 8, 8, 8, 8]),
  ...generateRow('K', 29, 34, '7000GR', [5, '', '', 4, 8]),
  ...generateRow('K', 35, 37, '233G', [8, 8, 8]),
  ...generateRow('K', 38, 43, '233G', [8, 8, 4]),
  ...generateRow('K', 46, 50, 'N234_P', [8, 8, 2, '', 4]),
  ...generateRow('K', 51, 56, 'N234_P', [8, 8, 8, 8, 8, 8]),
  ...generateRow('K', 57, 64, 'N234_P', [8, 8, 8, 8, 8, 8, 8, 8]),
  ...generateRow('K', 65, 83),

  // Row L
  ...generateRow('L', 11, 16, 'N550_P', ['', 3, 10, 10, 10, 10]),
  ...generateRow('L', 17, 22, 'N550_P', [10, 10, 2]),
  ...generateRow('L', 23, 25, 'N330_P', [10, 8]),
  ...generateRow('L', 26, 31, 'N330_P', [1, 10, 10, 10, 10]),
  ...generateRow('L', 32, 37, 'TRIAL CARBON'),
  ...generateRow('L', 38, 47, 'N339_P', ['', '', '', '', '', 5, 5, 5, 5, 5]),
  ...generateRow('L', 48, 52, 'N339_P', [14, 14, 14, 14, 4]),
  ...generateRow('L', 53, 90),

  // Row M
  ...generateRow('M', 20, 20, 'ML6073', [8]),
  ...generateRow('M', 21, 21, 'CASTOR OIL', [7]),
  ...generateRow('M', 22, 22, 'B30S', [5]),
  ...generateRow('M', 23, 23, 'ML6082', [2]),
  ...generateRow('M', 24, 25, 'ML6082', [6]),
  ...generateRow('M', 26, 30, 'N326_P', [5, 6, 8, 8, 8]),
  ...generateRow('M', 31, 36, 'N660 CCIPL', ['', '', 4, 6]),
  ...generateRow('M', 37, 42, 'N220_C', [2, 7, 7, 7, 7]),
  ...generateRow('M', 43, 48, 'N220_C', [7, 7, 1]),
  ...generateRow('M', 49, 59, 'N220_C'),
  ...generateRow('M', 60, 84),

  // Row N
  ...generateRow('N', 1, 1, 'MP21_RED', [4]),
  ...generateRow('N', 2, 2, 'MP21_WHITE', [1]),
  ...generateRow('N', 3, 3, 'MP41_BLUE', [1]),
  ...generateRow('N', 4, 6, 'SP_2892', ['', 8, 6]),
  ...generateRow('N', 7, 11, 'BR150_T', [17, 29, 30, 30]),
  ...generateRow('N', 12, 16, 'BR150_T', [30, 30, 30, 30, 30]),
  ...generateRow('N', 17, 18, 'BR150_T', [30, 3]),
  ...generateRow('N', 19, 23, 'SBR1723_I', ['', '', 13, 24]),
  ...generateRow('N', 24, 28, 'SBR1723_I'),
  ...generateRow('N', 29, 29, 'TRIAL RUBBER', [5]),
  ...generateRow('N', 30, 31, '4850'),
  ...generateRow('N', 32, 33, '268S'),
  ...generateRow('N', 40, 57),

  // Row P
  ...generateRow('P', 3, 3, 'SI69', [4]),
  ...generateRow('P', 4, 4, 'XIAMETER_0347', [2]),
  ...generateRow('P', 5, 5, 'XIAMETER_0075', [5]),
  ...generateRow('P', 6, 6, 'PRIMAL', [9]),
  ...generateRow('P', 7, 7, 'FP45', [2]),
  ...generateRow('P', 8, 8, 'TRIAL LIQUID'),
  ...generateRow('P', 9, 10, 'PC-36', [7]),
  ...generateRow('P', 11, 12, 'TK_1205', [3]),
  ...generateRow('P', 13, 14, 'HT-4000', [5]),
  ...generateRow('P', 15, 19, 'Y031', [22, 24, 3]),
  ...generateRow('P', 20, 24, 'BR2222', [18, 19]),
  ...generateRow('P', 25, 29, 'E680', [20, 24, 24, 24]),
  ...generateRow('P', 30, 34, 'E680', [24, 24, 24, 21]),
  ...generateRow('P', 35, 39, 'BRR', ['', 13]),
  ...generateRow('P', 40, 44, 'SBR1502_I', [16, 20]),
  ...generateRow('P', 45, 49, 'SBR1502_I', ['', '', 15]),
  ...generateRow('P', 50, 53, 'KEP435', ['', 11]),
  ...generateRow('P', 54, 65, 'KEP330'),
  ...generateRow('P', 66, 88),

  // L101_1F Bins
  ...generateRow('S', 1, 16),
  ...generateRow('S', 18, 46),
  ...generateRow('S', 48, 76),
  ...generateRow('S', 78, 102),

  ...generateRow('T', 1, 15),
  ...generateRow('T', 18, 46),
  ...generateRow('T', 48, 68),
  ...generateRow('T', 81, 102),

  ...generateRow('F', 1, 15),
  ...generateRow('F', 18, 46),
  ...generateRow('F', 72, 102),

  ...generateRow('Q', 1, 12),

  ...generateRow('G', 1, 16),
  ...generateRow('G', 18, 25),
  ...generateRow('G', 31, 46),

  ...generateRow('H', 18, 34),

  ...generateRow('I', 1, 16),
  ...generateRow('I', 18, 36),

  // L103_GF Bins
  ...generateRow('U', 1, 31),
  ...generateRow('V', 1, 18),
];
