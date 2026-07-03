export type KeyDef = { id: string; label: string; w: number; row: number; col: number }

const ROWS: [string, number][][] = [
  [['`',1],['1',1],['2',1],['3',1],['4',1],['5',1],['6',1],['7',1],['8',1],['9',1],['0',1],['BACKSPACE',2]],
  [['TAB',1.5],['Q',1],['W',1],['E',1],['R',1],['T',1],['Y',1],['U',1],['I',1],['O',1],['P',1],['·',1.5]],
  [['CAPS',1.8],['A',1],['S',1],['D',1],['F',1],['G',1],['H',1],['J',1],['K',1],['L',1],['Ñ',1],['ENTER',2.2]],
  [['SHIFT',2.4],['Z',1],['X',1],['C',1],['V',1],['B',1],['N',1],['M',1],[',',1],['SHIFT2',2.6]],
  [['CTRL',1.3],['ALT',1.3],['SPACE',6.5],['FN',1.3],['GD',1.3]],
]

export const KEYS: KeyDef[] = ROWS.flatMap((row, r) => {
  let x = 0
  return row.map(([label, w]) => {
    const def = { id: label, label: label.length > 1 ? '' : label, w, row: r, col: x }
    x += w
    return def
  })
})
export const BOARD_COLS = Math.max(...ROWS.map((r) => r.reduce((a, [, w]) => a + w, 0)))
export const KEY_UNIT = 0.55
