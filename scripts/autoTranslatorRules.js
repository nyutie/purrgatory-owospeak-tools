class AutoTranslateRules {
  constructor() {
    this.marker = '##=##'; // used to mark parts of string where a rule has already been applied

    this.ruleIds = {
      'r': 'rule1',
      'l': 'rule2',
      'purrogatory': 'rule3',
      'numa': 'rule4',
      'oliver': 'rule5',
      'tori': 'rule6',
      'fuck': 'rule7',
      'fucking': 'rule8',
      'sure': 'rule9',
      'alright': 'rule10',
      'spelled': 'rule11',
      'your': 'rule12',
      'you\'re': 'rule13',
      'flowers': 'rule14',
      'll': 'rule15',
    }
  }

  applyBuiltInRules(inputString) {
    const regex = /{[^{}]*}/g; // Regular expression to match text within curly braces
  
    inputString = inputString.replace(regex, (match) => {
      return this.marker + match + this.marker; // Mark the text within curly braces
    });
    
    return inputString;
  }

  applyWordRules(word, rules) {
    const wordRules = {
      'purrgatory': 'purrgatowy',
      'numa': 'nyuma',
      'oliver': 'owiver',
      'tori': 'towi',
      'fuck': 'fwick',
      'fucking': 'fwicking',
      'sure': 'shyure',
      'alright': 'alwight',
      'spelled': 'spewt',
      'your': 'your',
      "you're": "you're",
      'flowers': 'flowehs',
    };

    const matchingWord = Object.keys(wordRules).find((key) => word.indexOf(key) !== -1);
    const ruleId = matchingWord ? this.ruleIds[matchingWord] : null;

    if (ruleId && rules[ruleId]) {
      if (!word.includes(this.marker)) {
        word = this.marker + word.replace(matchingWord, wordRules[matchingWord]) + this.marker;
      }
    }

    return word;
  }

  applyOtherRules(word, rules) {
    const otherRules = {
      'll': 'll',
    };

    for (const [key, value] of Object.entries(otherRules)) {
      const ruleId = this.ruleIds[key];

      if (ruleId && rules[ruleId]) {
        if (!word.includes(this.marker)) {
          word = word.replace(new RegExp(key, 'g'), this.marker + value + this.marker);
        }
      }
    }

    return word;
  }

  applyLetterRules(word, rules) {
    const letterRules = {
      'r': 'w',
      'l': 'w',
    };

    for (const [letter, replacement] of Object.entries(letterRules)) {
      const ruleId = this.ruleIds[letter];

      if (ruleId && rules[ruleId]) {
        if (!word.includes(this.marker)) {
          word = word.replace(new RegExp(letter, 'g'), this.marker + replacement + this.marker);
        }
      }
    }

    return word;
  }

  applyRules(inputString, rules) {
    inputString = this.applyBuiltInRules(inputString);

    const words = inputString.split(' ');

    for (let i = 0; i < words.length; i++) {
      let word = words[i];

      // Apply word rules
      word = this.applyWordRules(word, rules);

      // Apply other rules
      word = this.applyOtherRules(word, rules);

      // Apply letter rules
      word = this.applyLetterRules(word, rules);

      words[i] = word;
    }

    // Remove marker variable from the words
    const outputString = words.map((word) => word.replace(new RegExp(this.marker, 'g'), '')).join(' ');
    return outputString;
  }
}

// rules ={
//   "rule1": true,
//   "rule2": true,
//   "rule3": true,
//   "rule4": true,
//   "rule5": true,
//   "rule6": true,
//   "rule7": true,
//   "rule8": true,
//   "rule9": true,
//   "rule10": true,
//   "rule11": true,
//   "rule12": true,
//   "rule13": true,
//   "rule14": true,
//   "rule15": true
// }

  
// const translator = new AutoTranslateRules();
// const inputString = 'I love purrgatory and numa flowers.';
// const translatedString = translator.applyRules(inputString, rules);
// console.log(translatedString);