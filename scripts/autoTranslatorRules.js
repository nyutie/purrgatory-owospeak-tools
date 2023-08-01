class AutoTranslateRules {
  constructor() {
    this.marker = '##=##'; // used to mark parts of string where a rule has already been applied

    this.ruleIds = {
      'r': 'rule1',
      'l': 'rule2',
      'purrgatory': 'rule3',
      'numa': 'rule4',
      'oliver': 'rule5',
      'tori': 'rule6',
      'fuck': 'rule7',
      'fucking': 'rule8',
      'sure': 'rule9',
      'alright': 'rule10',
      'spelled': 'rule11',
      'your': 'rule12',
      'you\\\'re': 'rule13',
      'their': 'rule14',
      'they\\\'re': 'rule15',
      'her': 'rule16',
      'flowers': 'rule17',
      'll': 'rule18',
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
      'you\\\'re': 'you\\\'re', // results in: - you\'re - same as in the sheets
      'their': 'their',
      'they\\\'re': 'they\\\'re',
      'her': 'her',
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
  
    // Check if the word contains the markers
    if (word.includes(this.marker)) {
      // Split the word into segments based on the markers
      const segments = word.split(this.marker);
  
      // Apply the replacement rules only outside the markers
      const modifiedSegments = segments.map((segment, index) => {
        if (index % 2 === 0) {
          // Outside the markers, apply the letter replacement rules
          for (const [letter, replacement] of Object.entries(letterRules)) {
            const ruleId = this.ruleIds[letter];
  
            if (ruleId && rules[ruleId]) {
              segment = segment.replace(new RegExp(letter, 'g'), replacement);
            }
          }
        }
        return segment;
      });
  
      // Reassemble the word with the modified segments
      word = modifiedSegments.join(this.marker);
    } else {
      // If the markers are not present, apply the letter replacement rules to the entire word
      for (const [letter, replacement] of Object.entries(letterRules)) {
        const ruleId = this.ruleIds[letter];
  
        if (ruleId && rules[ruleId]) {
          word = word.replace(new RegExp(letter, 'g'), replacement);
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

rules = {
  "rule1": true, // r -> w
  "rule2": true, // l -> w
  "rule3": true, // purrgatory -> purrgatowy
  "rule4": true, // numa -> nyuma
  "rule5": true, // oliver -> owiver
  "rule6": true, // tori -> towi
  "rule7": true, // fuck -> fwick
  "rule8": true, // fucking -> fwicking
  "rule9": true, // sure -> shyure
  "rule10": true, // alright -> alwight
  "rule11": true, // spelled -> spewt
  "rule12": true, // your -> your
  "rule13": true, // you're -> you're
  "rule14": true, // their -> their
  "rule15": true, // they're -> they're
  "rule16": true, // her -> her
  "rule17": true, // flowers -> flowehs
  "rule18": true  // ll -> ll
}

  
const translator = new AutoTranslateRules();
const inputString = 'r l purrgatory numa oliver tori fuck fucking sure alright spelled your you\\\'re their they\\\'re her flowers ll';
const translatedString = translator.applyRules(inputString, rules);
console.log(translatedString);