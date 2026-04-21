// Crie um arquivo ou coloque como método estático:
export function pathfind(
  start: { col: number; row: number },
  target: { col: number; row: number },
  mapGrid: number[][]
): { dCol: number; dRow: number } | null {
  const queue: { col: number; row: number; path: { dCol: number; dRow: number }[] }[] = [
    { ...start, path: [] }
  ];
  const visited = new Set<string>();
  visited.add(`${start.col},${start.row}`);

  const directions = [
    { dCol: 0, dRow: -1 }, { dCol: 0, dRow: 1 },
    { dCol: -1, dRow: 0 }, { dCol: 1, dRow: 0 }
  ];

  while (queue.length > 0) {
    const { col, row, path } = queue.shift()!;

    if (col === target.col && row === target.row) {
      return path.length > 0 ? path[0] : null; // Retorna o primeiro passo do caminho encontrado
    }

    for (const d of directions) {
      const nCol = col + d.dCol;
      const nRow = row + d.dRow;
      const key = `${nCol},${nRow}`;

      if (
        mapGrid[nRow]?.[nCol] === 0 && // É chão?
        !visited.has(key)
      ) {
        visited.add(key);
        // Armazenamos o primeiro movimento feito para chegar aqui
        const firstStep = path.length === 0 ? d : path[0];
        queue.push({ col: nCol, row: nRow, path: [firstStep] });
      }
    }
  }
  return null;
}

