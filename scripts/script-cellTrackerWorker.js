importScripts("https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js");

class CellTrackerWorker {
  constructor() {
    // Listen for messages from the main thread
    self.onmessage = (event) => {
      const sheetInput = event.data;
      if (sheetInput.type === 'googlesheets') {
        console.log(sheetInput);
        this.trackCellsAndSendProgress(sheetInput.content);
      }
      else if (sheetInput.type === 'file') {
        console.log(sheetInput);
        this.trackCellsAndSendProgress(sheetInput.content);
      } else {
        console.log(sheetInput)
        self.postMessage({ error: 'invalid sheetInput type?? something went very wrong...' });
      }
    };

    this.columnsDEandJK = [
      'objects',
      'inventory',
      'receptionist',
      'oliver and kyungsoon intro',
      'kyungsoon',
      'oliver',
      'ttt',
      'numa',
      'flowers',
      'elijah',
      'slam',
      'poems',
      'sean',
      'piano',
      'tori',
      'natalie',
      'ending',
      'ending2',
      'heaven'
    ];
    this.columnsBC = [
      'flashbacks',
      'other'
    ];
  }

  // Function to fetch Google Sheets data using the export link
  fetchSheetsData(sheetsID) {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetsID}/export?format=xlsx`;

    return fetch(exportUrl)
      .then((response) => response.arrayBuffer())
      .then((data) => new Uint8Array(data));
  }

  // Function to check if the cell is to be translated
  isCellToBeCounted(cellValue) {
    return cellValue !== '' && cellValue !== '_pass';
  }

  // Function to check if the cell is translated
  isCellTranslated(cellValue) {
    return cellValue !== '';
  }

  // Function to determine the columns based on sheet name
  getColumnsForSheet(sheetName) {
    if (this.columnsDEandJK.includes(sheetName)) {
      return [['D', 'E'], ['J', 'K']];
    } else if (this.columnsBC.includes(sheetName)) {
      return [['B', 'C']];
    } else {
      return null; // Unknown sheet, will be added to unknownSheets list
    }
  }

  isMarkedWithBackgroundColor(cell) {
    const cellStyle = cell.s;
    if (!cellStyle || !cellStyle.fgColor) return false;
    if (cellStyle.fgColor.rgb === 'D6F4F2') return true;
  }

  // Function to track cells and calculate progress
  trackCellsAndSendProgress(sheetUint8Data) {
    const workbook = XLSX.read(sheetUint8Data, { type: 'array', cellStyles: true });

    let totalOriginalCount = 0;
    let totalTranslatedCount = 0;
    const unknownSheets = [];

    let sheetsProgress = {}; // stores string of 'translatedCells/originalCells' per sheet to be displayed

    workbook.SheetNames.forEach((sheetName) => {
      const columnsToCheck = this.getColumnsForSheet(sheetName);

      if (columnsToCheck) {
        const sheetsData = workbook.Sheets[sheetName];
        let originalCells = 0;
        let translatedCells = 0;

        // Loop through the cells in the specified columns and check if they are to be counted
        for (const [columnToBeTranslated, translatedColumn] of columnsToCheck) {
          let isFirstCell = true;

          for (const cellReference in sheetsData) {
            if (cellReference.startsWith(columnToBeTranslated)) {
              // ignore first cell in column:
              if (isFirstCell) {
                isFirstCell = false;
                continue;
              }

              const cellValue = sheetsData[cellReference].v ?? '';

              const cellReferenceToTheRight = cellReference.replace(columnToBeTranslated, translatedColumn);

              if (this.isCellToBeCounted(cellValue)) {
                originalCells++;
                totalOriginalCount++;

                if (sheetsData[cellReferenceToTheRight] && this.isCellTranslated(sheetsData[cellReferenceToTheRight].v || '')) {
                  if (!this.isMarkedWithBackgroundColor(sheetsData[cellReferenceToTheRight])) {
                    translatedCells++;
                    totalTranslatedCount++;
                  }
                }
              }
            }
          }
        }
        
          sheetsProgress[sheetName] = `${translatedCells}/${originalCells}`;
        } else {
          unknownSheets.push(sheetName);
        }
      });

      // Calculate total progress in %
      const totalProgress = (totalTranslatedCount / totalOriginalCount) * 100;

      // Post the progress data back to the main thread
      self.postMessage({
        totalProgress: totalProgress,
        sheetsProgress: sheetsProgress,
        unknownSheets: unknownSheets,
      });
  }
}

// Create a CellTrackerWorker instance
const cellTrackerWorker = new CellTrackerWorker();