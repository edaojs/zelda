export function convertTo2DArray(data: number[], width: number): number[][] {
  const grid: number[][] = [];
  
  for (let i = 0; i < data.length; i += width) {
    // Pega um "pedaço" do array original correspondente a uma linha inteira
    const row = data.slice(i, i + width);
    grid.push(row);
  }
  
  return grid;
}