class CellTracker {
  constructor() {

  }

  getProgress(sheetInput) {

    const outputDiv = document.getElementById('outputCell');
    outputDiv.innerHTML = 'processing sheet...';

    // reset text saying downloading or converting
    window.main.resetSheetReadyText();

    // Run the cellCounter function in the separate Web Worker thread
    this.cellCounterWorker = new Worker('scripts/script-cellTrackerWorker.js');
    this.cellCounterWorker.onmessage = (event) => {
      const progressData = event.data;

      if (progressData.error) {
        outputDiv.innerHTML = '<br>' + progressData.error;
        return;
      }

      // Clear the output div
      outputDiv.innerHTML = '';

      // Display each sheet's progress
      for (const sheetName in progressData.sheetsProgress) {
        const sheetProgress = progressData.sheetsProgress[sheetName];
        outputDiv.innerHTML += `cells translated in '${sheetName}': ${sheetProgress}<br>`;
      }

      if (progressData.unknownSheets.length > 0) {
        outputDiv.innerHTML += `<br><br>unknown sheets: `;
        progressData.unknownSheets.forEach((sheetName) => {
          outputDiv.innerHTML += `'${sheetName}', `;
        })
        outputDiv.innerHTML = outputDiv.innerHTML.slice(0, -2); // Remove the trailing comma and space
        outputDiv.innerHTML += `<br><br>`;
      }

      // Display the total progress
      outputDiv.innerHTML += `<br>total progress: ${progressData.totalProgress.toFixed(2)}%`;

      // tell main we're done
      window.main.finishedProcessingCellProgress();
    };

    // Send message to the worker to start processing
    this.cellCounterWorker.postMessage(sheetInput);
  }
}

export default CellTracker;