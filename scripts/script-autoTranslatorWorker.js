importScripts("https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js");

class AutoTranslatorWorker {
  constructor() {
    // Listen for messages from the main thread
    self.onmessage = (event) => {
      const sheetInput = event.data;
      if (sheetInput.type === 'googlesheets') {
        // console.log(sheetInput);
        this.createNewFile(sheetInput.content);
      } else if (sheetInput.type === 'file') {
        // console.log(sheetInput);
        this.createNewFile(sheetInput.content);
      } else {
        // console.log(sheetInput);
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
      'heaven',
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
  isCellToBeCounted(cell) {
    return cell.v !== undefined && cell.v !== '' && cell.v !== '_pass';
  }

  // Function to check if the cell is not approved
  isCellNotApproved(cell) {
    if (cell.v === undefined || cell.v === '') {
      return true;
    }
  
    return this.isMarkedWithBackgroundColor(cell);
  }

  // Function to check if the cell has the background color #d6f4f2
  isMarkedWithBackgroundColor(cell) {
    const cellStyle = cell.s;
    if (!cellStyle || !cellStyle.bgColor || !cellStyle.fgColor) return false;
    if (cellStyle.bgColor.rgb === 'D6F4F2' && cellStyle.fgColor.rgb === 'D6F4F2') return true;
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

  // Function to track cells and calculate progress
  createNewFile(sheetUint8Data) {
    const workbook = XLSX.read(sheetUint8Data, { type: 'array', cellStyles: true });
  
    const unknownSheets = [];
  
    workbook.SheetNames.forEach((sheetName) => {
      const columnsToCheck = this.getColumnsForSheet(sheetName);
  
      if (columnsToCheck) {
        const sheetsData = workbook.Sheets[sheetName];
  
        // Loop through the cells in the specified columns and check if they are to be translated
        for (const [columnToBeTranslated, translatedColumn] of columnsToCheck) {
          let isFirstCell = true;
  
          for (const cellReference in sheetsData) {
            if (cellReference.startsWith(columnToBeTranslated)) {
              // ignore first cell in column:
              if (isFirstCell) {
                isFirstCell = false;
                continue;
              }
  
              const cellReferenceToTheRight = cellReference.replace(columnToBeTranslated, translatedColumn);
  
              if (this.isCellToBeCounted(sheetsData[cellReference]) && sheetName === 'numa') {
                if (this.isCellNotApproved(sheetsData[cellReferenceToTheRight])) {
                  // in the new file, set the cell to the right to 'hello world'
                  sheetsData[cellReferenceToTheRight].v = 'hello world';
                  sheetsData[cellReferenceToTheRight].t = 's';
                  
                  sheetsData[cellReferenceToTheRight].s.patternType = 'solid';
                  sheetsData[cellReferenceToTheRight].s.bgColor = { rgb: 'D6F4F2' };
                  sheetsData[cellReferenceToTheRight].s.fgColor = { rgb: 'D6F4F2' };
                }
              }
            }
          }
        }
      } else {
        unknownSheets.push(sheetName);
      }
    });
  
    // Add the new file data to the message
    const newFileData = XLSX.write(workbook, { type: 'array', bookType: 'xlsx', cellStyles: true });
    self.postMessage({
      finished: true,
      fileData: [new Uint8Array(newFileData)],
      unknownSheets: unknownSheets,
    });
  }
}

// Create a CellTrackerWorker instance
const autoTranslatorWorker = new AutoTranslatorWorker();