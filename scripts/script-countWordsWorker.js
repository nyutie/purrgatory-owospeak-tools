importScripts("https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js");

class WordCounterWorker {
  constructor() {
    // Listen for messages from the main thread
    self.onmessage = (event) => {
      const sheetInput = event.data;
      if (sheetInput.type === 'googlesheets') {
        console.log(sheetInput);
        this.countWordsInSheetsAndSendResult(sheetInput.content);
      }
      else if (sheetInput.type === 'file') {
        console.log(sheetInput);
        this.countWordsInSheetsAndSendResult(sheetInput.content);
      } else {
        console.log(sheetInput)
        self.postMessage({ error: 'invalid sheetInput type?? something went very wrong...' });
      }
    };
  }

  // Function to count words in a string
  countWordsInString(text) {
    return text.trim().split(/\s+/).filter((word) => word !== '').length;
  }

  // Function to count words in each sheet of Google Sheets
  countWordsInSheets(sheetsData) {
    const wordCounts = {};

    Object.keys(sheetsData).forEach((cellReference) => {
      const sheetName = cellReference.replace(/[^A-Za-z]/g, ''); // Extract sheet name from cell reference
      const cellValue = sheetsData[cellReference].v;

      if (cellValue) {
        wordCounts[sheetName] = (wordCounts[sheetName] || 0) + this.countWordsInString(cellValue);
      }
    });

    return wordCounts;
  }

  // Function to count words and send the result back to the main thread
  countWordsInSheetsAndSendResult(sheetUint8Data) {
    const workbook = XLSX.read(sheetUint8Data, { type: 'array' });

    const wordCounts = {};

    workbook.SheetNames.forEach((sheetName) => {
      const sheetsData = workbook.Sheets[sheetName];
      const sheetWordCounts = this.countWordsInSheets(sheetsData);

      // Sum up word counts for each sheet
      wordCounts[sheetName] = Object.values(sheetWordCounts).reduce((acc, count) => acc + count, 0);
    });

    // Post the word counts back to the main thread
    self.postMessage(wordCounts);
  }
}

// Create a WordCounterWorker instance
const wordCounterWorker = new WordCounterWorker();