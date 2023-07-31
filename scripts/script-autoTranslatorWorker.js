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

  // Function to check if the cell has the background color #d6f4f2


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
    const workbook = new ExcelJS.Workbook();

      // Function to check if the cell is to be translated
    function isCellToBeCounted(cell) {
      return cell && cell.value !== null && cell.value !== '' && cell.value !== '_pass';
    }

    // Function to check if the cell is not approved
    function isCellOkayToOverwrite(cell) {
      function isMarkedWithBackgroundColor(cell) {
        
        if (!cell.fill || !cell.fill.fgColor) return false;
      
        const fgColor = cell.fill.fgColor.argb;
      
        return fgColor === 'FFD6F4F2';
      }

      if (cell.model.type === 0) { // if a cell does not contain a value
        return true;
      }

      return isMarkedWithBackgroundColor(cell);
    }

    workbook.xlsx.load(sheetUint8Data).then(() => {
      const unknownSheets = [];
  
      workbook.eachSheet((worksheet) => {
        const sheetName = worksheet.name;
        const columnsToCheck = this.getColumnsForSheet(sheetName);
  
        if (columnsToCheck) {
          const [originalText, translatedColumn] = columnsToCheck[0];
  
          // Loop through the rows in the specified columns and check if they are to be translated
          worksheet.eachRow({ includeEmpty: false }, (row, rowIndex) => {
            if (rowIndex > 1) {
              const cellWithOriginalText = row.getCell(originalText);
              const cellToTheRight = row.getCell(translatedColumn);
  
              if (isCellToBeCounted(cellWithOriginalText) && sheetName === 'numa') {
                if (isCellOkayToOverwrite(cellToTheRight)) {
                  console.log(cellToTheRight)

                  cellToTheRight.value = 'hello world';
                  cellToTheRight.style = {
                    ...cellToTheRight.style,
                    fill: {
                      ...cellToTheRight.fill,
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: { argb: 'FFD6F4F2' }
                    }
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
      workbook.xlsx.writeBuffer().then((buffer) => {
        self.postMessage({
          finished: true,
          fileData: [buffer],
          unknownSheets: unknownSheets,
        });
      });
    });
  }
}

// Create a CellTrackerWorker instance
const autoTranslatorWorker = new AutoTranslatorWorker();