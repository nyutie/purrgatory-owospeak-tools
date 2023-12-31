class AutoTranslator {
  constructor() {
    this.fileData = null;
  }

  clearFile() {
    this.fileData = null;
    const outputDiv = document.getElementById('outputAutoTranslator');
    outputDiv.innerHTML = '';
  }

  download() {
    console.log(this.fileData)
    const blob = new Blob(this.fileData, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    link.download = `${window.main.selectedSheetData.title}-owoified.xlsx`;
    link.href = URL.createObjectURL(blob);
    console.log(link.href);
    link.click();
  }

  applyRules(sheetInput, rules) {
    const outputDiv = document.getElementById('outputAutoTranslator');
    outputDiv.innerHTML = 'processing sheet...';

    // reset text saying downloading or converting
    window.main.resetSheetReadyText();

    // Run the cellCounter function in the separate Web Worker thread
    this.cellCounterWorker = new Worker('scripts/script-autoTranslatorWorker.js');
    this.cellCounterWorker.onmessage = (event) => {
      if (event.data.error) {
        outputDiv.innerHTML = '<br>' + event.data.error;
        return;
      }

      if (!event.data.finished) {
        outputDiv.innerHTML = '<br>Unknown error!';
        return;
      }

      // Clear the output div
      outputDiv.innerHTML = '';

      // Tell user that the file is ready
      outputDiv.innerHTML += 'file ready for download.'

      // Display unknown sheets
      if (event.data.unknownSheets.length > 0) {
        outputDiv.innerHTML += `<br><br><br>unknown sheets: `;
        event.data.unknownSheets.forEach((sheetName) => {
          outputDiv.innerHTML += `'${sheetName}', `;
        });
        outputDiv.innerHTML = outputDiv.innerHTML.slice(0, -2); // Remove the trailing comma and space
      }

      this.fileData = event.data.fileData;
      window.main.ui.autoTranslator.enableDownloadButton(true);
      
      window.main.finishedProcessingTranslator();
    };


    window.main.processingTranslator();
    // Send message to the worker to start processing
    sheetInput.rules = rules;
    this.cellCounterWorker.postMessage(sheetInput);
  }
}

export default AutoTranslator;