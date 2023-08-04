class WordCounter {
  constructor() {
    this.originalWordCounts = {
      'objects': 5596,
      'inventory': 226,
      'receptionist': 495,
      'oliver and kyungsoon intro': 2313,
      'kyungsoon': 3364,
      'oliver': 7260,
      'ttt': 1009,
      'numa': 4960,
      'flowers': 347,
      'elijah': 7815,
      'slam': 4149,
      'poems': 476,
      'sean': 5912,
      'piano': 722,
      'tori': 8366,
      'natalie': 5845,
      'ending': 8381,
      'ending2': 7793,
      'heaven': 1378,
      'flashbacks': 716,
      'other': 640,
      'total': 77763
    };
  }

  // Main function to count words and update the UI
  countWords(sheetInput) {
    const outputDiv = document.getElementById('outputWords');
    outputDiv.innerHTML = 'processing sheet...';

    // reset text saying downloading or converting
    window.main.resetSheetReadyText();

    // Run the countWords function in the separate Web Worker thread
    const countWordsWorker = new Worker('./scripts/script-countWordsWorker.js');
    countWordsWorker.onmessage = (event) => {
      const wordCounts = event.data;

      if (wordCounts.error) {
        outputDiv.innerHTML = '<br>' + wordCounts.error;
        return;
      }

      // Display the word counts in the UI
      outputDiv.innerHTML = '';

      const unknownWordCounts = {};

      // Subtract known sheets and accumulate unknown sheets
      for (const sheetName in wordCounts) {
        if (this.originalWordCounts.hasOwnProperty(sheetName)) {
          const diff = wordCounts[sheetName] - this.originalWordCounts[sheetName];
          outputDiv.innerHTML += `word count in '${sheetName}': ${diff}<br>`;
        } else {
          unknownWordCounts[sheetName] = wordCounts[sheetName];
        }
      }

      // Calculate the total word count
      const totalWordCount = Object.values(wordCounts).reduce((acc, count) => acc + count, 0);
      outputDiv.innerHTML += `<br>Total word count: ${totalWordCount - this.originalWordCounts.total}`;

      // Display unknown sheets separately
      if (Object.keys(unknownWordCounts).length > 0) {
        outputDiv.innerHTML += `<br><br><br>unknown sheets: `;
        Object.keys(unknownWordCounts).forEach((sheetName) => {
          outputDiv.innerHTML += `'${sheetName}', `;
        });
        outputDiv.innerHTML = outputDiv.innerHTML.slice(0, -2); // Remove the trailing comma and space
      }

      // tell main we're done
      window.main.finishedProcessingWordCount();
    };

    // Send message to the worker to start processing
    countWordsWorker.postMessage(sheetInput);
  }
}

export default WordCounter;