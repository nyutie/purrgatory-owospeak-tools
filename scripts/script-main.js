import 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js';

import Ui from './script-ui.js';
import WordCounter from './script-countWords.js';
import CellTracker from './script-cellTracker.js';
import AutoTranslator from './script-autoTranslator.js';

class Main {
  constructor() {
    this.ui = new Ui();
    this.wordCounter = new WordCounter();
    this.cellTracker = new CellTracker();
    this.autoTranslator = new AutoTranslator();
    
    this.originalSheetReadyText = '';

    this.finishedProcessing = { 'wordCount': null, 'cellProgress': null };

    this.selectedSheetData = { type: null, content: null, title: null };
  }
  
  clearFile() {
    this.selectedSheetData = { type: null, content: null, title: null };
    this.autoTranslator.clearFile()
    window.main.ui.autoTranslator.enableDownloadButton(false);
  }

  checkIfFinishedProcessing() {
    if (
      this.finishedProcessing.wordCount === true &&
      this.finishedProcessing.cellProgress === true
      ) {
        this.ui.inputs.enableAllInputs(true);
    }
  }

  finishedProcessingWordCount() {
    this.finishedProcessing.wordCount = true;
    this.checkIfFinishedProcessing();
  }

  finishedProcessingCellProgress() {
    this.finishedProcessing.cellProgress = true;
    this.checkIfFinishedProcessing();
  }

  finishedProcessingTranslator() {
    this.ui.inputs.enableAllInputs(true);
  }

  processingTranslator() {
    this.ui.inputs.enableAllInputs(false);
  }

  resetSheetReadyText() {
    document.getElementById('sheet-ready').innerHTML = this.originalSheetReadyText;
  }

  async fetchSheetsData(sheetsID) {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetsID}/export?format=xlsx`;

    return fetch(exportUrl)
      .then((response) => response.arrayBuffer())
      .then((data) => new Uint8Array(data));
  }

  processSheet(sheetInput) {
    this.originalSheetReadyText = document.getElementById('sheet-ready').innerHTML;
    this.finishedProcessing = { 'wordCount': false, 'cellProgress': false };

    this.ui.inputs.enableAllInputs(false);

    if (sheetInput.type === 'link') {
      document.getElementById('sheet-ready').innerHTML = 'downloading sheet...';
      const sheetsID = sheetInput.content.match(/[-\w]{25,}/);
      this.fetchSheetsData(sheetsID).then((data) => {
        this.selectedSheetData = { type: 'googlesheets', content: data, title: sheetInput.title };
        this.ui.autoTranslator.fileReady(true);
        this.wordCounter.countWords(this.selectedSheetData);
        this.cellTracker.getProgress(this.selectedSheetData);
      });
    } else if (sheetInput.type === 'file') {
      document.getElementById('sheet-ready').innerHTML = 'converting sheet...';
      const file = sheetInput.content;
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        this.selectedSheetData = { type: 'file', content: data, title: sheetInput.title };
        this.ui.autoTranslator.fileReady(true);
        this.wordCounter.countWords(this.selectedSheetData);
        this.cellTracker.getProgress(this.selectedSheetData);
      };
      reader.readAsArrayBuffer(file);
    } 
  }

  translateSheet(rules) {
    console.log(rules);
    this.autoTranslator.applyRules(this.selectedSheetData, rules)
  }
}

window.main = new Main();