// Minimal CSV parsing for the content/*.csv files. Handles quoted values
// (including commas and doubled "" quotes inside them) but not values that
// span multiple lines. Blank lines are skipped, and a row with fewer values
// than headers gets '' for the missing columns.

function parseLine(line: string) {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { values.push(value.trim()); value = ''; }
    else value += character;
  }
  values.push(value.trim());
  return values;
}

/** Parses a CSV string into one `{ header: value }` record per row. */
export function parseCsv(raw: string): Record<string, string>[] {
  const [headerLine, ...lines] = raw.trim().split(/\r?\n/);
  const headers = parseLine(headerLine);
  return lines.filter((line) => line.trim()).map((line) => {
    const values = parseLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}
