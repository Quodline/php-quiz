addEventListener('DOMContentLoaded', main);

function undef(obj) {
  return obj === undefined;
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Quiz(content, answer, ...wrongs) {
  this.content = content;
  this.answer = answer;
  this.wrongs = [...wrongs];
}

class BooleanQuiz extends Quiz {
  constructor(statement, answer) {
    const trueOrFalse = ['False', 'True'];
    super(statement, trueOrFalse[+answer], trueOrFalse[+!answer]);
  }
}

class Option {
  constructor(text, isCorrect = false, isSelected = false, showAnswer = false) {
    this.text = text;
    this.isCorrect = isCorrect;
    this.isSelected = isSelected;
    this.showAnswer = showAnswer;
  }

  get className() {
    const isCorrect = this.showAnswer && this.isCorrect,
      isWrong = this.showAnswer && this.isSelected && !this.isCorrect;
    return isCorrect ? 'is-correct'
      : isWrong ? 'is-wrong'
        : this.isSelected ? 'is-selected'
          : '';
  }
}

const QUIZZES_PER_ROUND = 5;

const possibleQuizzes = [
  new Quiz('Which of the following is known as null coalesce operator?', '??', '?:', '||', '<=>'),
  new BooleanQuiz('Traits can have a constructor', true),
  new BooleanQuiz('If a function\'s return type is not specified, void is used as the default', false),
  new BooleanQuiz('Static closures cannot be bound to an object', true),
  new BooleanQuiz('By default, type hints are ignored by the interpreter', true),
  new BooleanQuiz('show_source function can be used to output a syntax highlighted version of a source code to the client side', true),
  new BooleanQuiz(' PHP has native support for enums', false),
  new BooleanQuiz('PHP can be used for front end development', false),
  new BooleanQuiz('If the yield keyword is found in a function, the function will return a Generator object', true),
  new BooleanQuiz('PHP can be used as a template engine', true),
  new Quiz(`What will be the output?<br><code>echo 'H' <=> 'h';</code>`, '-1', 'false', '0', 'null'),
  new Quiz('The default interpreter for PHP is?', 'Zend Engine', 'HHVM', 'PHPCS', 'GNU C/C++'),
  new Quiz('Which of the following will enable gradual typing (type declarations) in the current PHP script?', 'declare(strict_types=1);', 'declare(gradual_types=1);', 'ini_set(\'type_hinting\', \'On\');', 'STRICT_TYPE=1'),
  new Quiz('What is the default value of register_globals directive in php.ini?', 'OFF', 'ON'),
  new Quiz('An error_reporting level of -1 will...', 'Report all errors', 'Report no error', 'Report fatal errors only', 'Report notices and warnings only'),
  new Quiz('Who is the creator of PHP?', 'Rasmus Lerdorf', 'Sebastian Bergmann', 'Mark Zuckerberg', 'Larry Wall'),
  new Quiz('The main configuration file for PHP is called?', 'php.ini', 'httpd.conf', 'config.inc.php', 'phpunit.xml'),
  new Quiz('In the statement, <code>$x = array(1, 2, 3);</code>, array() is a ...?', 'Construct', 'Function', 'Operator', 'Closure'),
  new Quiz('The list() construct is used to ...', 'Unpack an array', 'Create an ordered list', 'Create an unordered list', 'Sort an array'),
  new Quiz('What is the valid way of importing a built-in class called PDO?', 'use PDO;', 'use \\PDO;', 'use /PDO;', 'use __DIR__ . \'/PDO\';'),
  new Quiz('T_PAAMAYIM_NEKUDOTAYIM represents which token?', '::', '<<', '<<<', 'abstract'),
  new BooleanQuiz('An asynchronous function is declared with `async` keyword', false),
  new Quiz('T_INC represents which token?', '++', 'include()', 'namespace', '__NAMESPACE__'),
  new Quiz('What is returned by the print() function?', '1', 'Nothing', 'Its argument', 'false'),
  new Quiz('What is the valid way to output an instance variable?', 'echo $this->attr;', 'echo $this.attr;', 'echo this::$attr;', 'echo $this->$attr;'),
  new BooleanQuiz('The <code>final</code> keyword can be used to signify that an instance variable may not be changed after instantiation', false),
  new BooleanQuiz('A trait can be declared final', false),
  new BooleanQuiz('<code>print</code> is an alias for <code>echo</code>', false),
  new Quiz('What PSR recommendation provides a common interface for HTTP requests and responses?', 'PSR-7: HTTP Message Interface', 'PSR-12: Extended Coding Style Guide', 'PSR-15: HTTP Handlers', 'PSR-17: HTTP Factories'),
  new BooleanQuiz('The closing tag `?>` is optional in a file containing only PHP code', true),
];

const QuizOption = {
  template: `<li @click="option.showAnswer || select()"><slot></slot></li>`,
  props: {
    option: Option,
  },
  methods: {
    select() {
      this.$emit('select', this.option);
    },
  },
};

function aQuizData() {
  return {
    selectedOption: undefined,
    hasSubmitted: false,
  };
}

const AQuiz = {
  template: `<div class="a-quiz">
        <blockquote class="a-quiz__question" v-html="quiz.content"></blockquote>
        <ul class="a-quiz__options">
            <quiz-option v-for="(option, index) of options" :option="option"
                @select="evSelect" :key="option.text" :class="option.className">{{ option.text }}</quiz-option>
        </ul>
        <button @click="submit" class="a-quiz__button" :disabled="undef(selectedOption)"><slot name="button">Continue</slot></button>
    </div>`,
  components: {
    QuizOption,
  },
  props: {
    quiz: Quiz,
    correct: String,
  },
  data() {
    return aQuizData();
  },
  computed: {
    options() {
      return shuffleArray([this.quiz.answer, ...this.quiz.wrongs])
        .map(text => new Option(text, this.isCorrect(text)));
    },
  },
  methods: {
    isCorrect(option = this.selectedOption.text) {
      return option === this.correct;
    },
    evSelect(option) {
      this.options.forEach(op => op.isSelected = false);
      option.isSelected = true;
      this.selectedOption = option;
    },
    submit() {
      if (!this.hasSubmitted) {
        this.$emit('submit', this.isCorrect());
        this.hasSubmitted = true;
        this.options.forEach(op => op.showAnswer = true);
      } else {
        this.$emit('next');
        Object.assign(this, aQuizData());
      }
    }
  },
};

const QuizRound = {
  template: `<article class="quiz-round">
        <p class="quiz-round__dots">
            <span :class="isCurrent(n-1)" v-for="n in quizzes.length">
                <span v-if="result[n-1]" v-html="result[n-1]"></span>
                <span v-else>&bull;</span>
            </span>
        </p>
        <a-quiz v-bind:quiz="quiz" v-bind:correct="answer" @submit="evSubmit" @next="evNext">
            <span slot="button">{{ buttonText }}</span>
        </a-quiz>
    </article>`,
  components: {
    AQuiz,
  },
  props: {
    quizzes: Array,
  },
  data() {
    return {
      index: 0,
      buttonText: 'Continue',
      result: [],
    };
  },
  computed: {
    quiz() {
      return this.quizzes[this.index];
    },
    answer() {
      return this.quiz.answer;
    },
  },
  methods: {
    isCurrent(index) {
      return (index === this.index) && 'is-current';
    },
    evSubmit(e) {
      this.buttonText = 'Next';
      this.result.push(e ? '&check;' : '&times;');
    },
    evNext(e) {
      if (++this.index < QUIZZES_PER_ROUND) {
        this.buttonText = 'Continue';
      } else {
        this.$emit('complete', this.result);
      }
    }
  },
};

const PerformanceReport = {
  template: `<article class="performance-report">
        <h4>{{ remark }}</h4>
        <p class="performance-report__score">{{ score|fraction(quizCount) }}</p>
        <button class="performance-report__try-again" @click="$emit('retry')">Try again</button>
    </article>`,
  props: {
    result: Array,
  },
  data() {
    return {
      quizCount: QUIZZES_PER_ROUND,
    };
  },
  computed: {
    score() {
      return this.result.filter(mark => mark === '&check;').length;
    },
    remark() {
      return this.score <= 3 ? 'Not so good' : 'Excellent';
    },
  },
  filters: {
    fraction(numerator, denominator) {
      return `${numerator}/${denominator}`;
    },
  },
};

function main() {
  const STATE_INITIAL = 'Welcome to the PHP Quiz. You will be given 5 quizzes to answer. Report any error in the comment section',
    STATE_IN_PROGRESS = 'Best of luck!',
    STATE_COMPLETED = 'Result';

  function data() {
    return {
      state: STATE_INITIAL,
      result: '',
    };
  }

  new Vue({
    el: '.app',
    components: {
      QuizRound,
      PerformanceReport,
    },
    data,
    computed: {
      title() {
        return this.state;
      },
    },
    methods: {
      is(state) {
        return this.state === eval(`STATE_${state.toUpperCase()}`);
      },
      start() {
        this.state = STATE_IN_PROGRESS;
      },
      generateQuizzes() {
        return shuffleArray(possibleQuizzes).slice(0, QUIZZES_PER_ROUND);
      },
      showResult(e) {
        this.state = STATE_COMPLETED;
        this.result = e;
      },
      restart() {
        Object.assign(this, data());
      },
    },
  });
}
