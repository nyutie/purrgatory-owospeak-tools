importScripts("https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js");

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
    return cell && cell.value !== undefined && cell.value !== '' && cell.value !== '_pass';
  }
  
  // Function to check if the cell is not approved
  isCellOkayToOverwrite(cell) {
    console.log(cell)
    if (cell.value === null) {
      return true;
    }
    return this.isMarkedWithBackgroundColor(cell);
  }

  // Function to check if the cell has the background color #d6f4f2
  isMarkedWithBackgroundColor(cell) {
    const cellFill = cell.style.fill;

    console.log(cell)
    
    if (!cellFill || !cellFill.fgColor || !cellFill.bgColor) return false;
  
    const fgColor = cellFill.fgColor.argb;
    const bgColor = cellFill.bgColor.argb;
  
    return fgColor === 'FFD6F4F2' && bgColor === 'FFD6F4F2';
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
  async createNewFile(sheetUint8Data) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(sheetUint8Data);
  
    const unknownSheets = [];
  
    workbook.eachSheet((worksheet) => {
      const sheetName = worksheet.name;
      const columnsToCheck = this.getColumnsForSheet(sheetName);
  
      if (columnsToCheck) {
        const [columnToBeTranslated, translatedColumn] = columnsToCheck[0];
  
        // Loop through the rows in the specified columns and check if they are to be translated
        worksheet.eachRow({ includeEmpty: false }, (row, rowIndex) => {
          if (rowIndex > 1) {
            const cellToBeTranslated = row.getCell(columnToBeTranslated);
            const cellToTheRight = row.getCell(translatedColumn);
  
            if (this.isCellToBeCounted(cellToBeTranslated) && sheetName === 'numa') {
              // console.log("aaa");
              if (this.isCellOkayToOverwrite(cellToTheRight)) {
                // console.log("bbb");
                // in the new file, set the cell to the right to 'hello world'
                cellToTheRight.value = 'hello world';
                cellToTheRight.style.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFD6F4F2' },
                  bgColor: { argb: 'FFD6F4F2' }
                };
              }
            }
          }
        });
      } else {
        unknownSheets.push(sheetName);
      }
    });
  
    // Convert the workbook to binary data
    const buffer = await workbook.xlsx.writeBuffer();
    self.postMessage({
      finished: true,
      fileData: [buffer],
      unknownSheets: unknownSheets,
    });
  }
}

// Create a CellTrackerWorker instance
const autoTranslatorWorker = new AutoTranslatorWorker();