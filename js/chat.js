const STAGES = {
  WELCOME: 'welcome',
  INITIAL: 'initial',
  CLARIFYING: 'clarifying',
  GENERATING: 'generating',
  STORY: 'story',
  REFLECTION: 'reflection',
  DONE: 'done',
};

export class ChatBot {
  constructor(ui) {
    this.ui = ui;
    this.stage = STAGES.WELCOME;
    this.questionIndex = 0;
    this.answers = {};
    this.preset = null;
    this.allText = '';
  }

  reset() {
    this.stage = STAGES.WELCOME;
    this.questionIndex = 0;
    this.answers = {};
    this.preset = null;
    this.allText = '';
  }

  async start() {
    this.reset();
    await this.ui.clear();
    await this.delay(400);
    await this.ui.showTyping(800);
    await this.ui.addBotMessage(
      'Привет. Я здесь, чтобы вместе с тобой превратить то, что сейчас живёт внутри, в историю — мягкую, образную, без оценок и давления.'
    );
    await this.delay(600);
    await this.ui.showTyping(600);
    await this.ui.addBotMessage(
      'О чём ты хотел(а) бы сегодня поговорить в сказке? Может, есть ситуация, которую хочется увидеть с другой стороны — или чувство, которое сейчас сильнее всего?'
    );
    this.ui.showQuickPicks(true);
    this.stage = STAGES.INITIAL;
    this.ui.setInputEnabled(true);
  }

  async handleTopicChip(topic) {
    const { TOPIC_PRESETS } = await import('./config.js');
    const preset = TOPIC_PRESETS[topic];
    if (!preset) return;

    this.preset = preset;
    this.ui.showQuickPicks(false);
    await this.ui.addUserMessage(preset.intro);
    await this.processInitial(preset.intro);
  }

  async handleUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.ui.showQuickPicks(false);
    await this.ui.addUserMessage(trimmed);
    this.allText += ' ' + trimmed;

    switch (this.stage) {
      case STAGES.INITIAL:
        await this.processInitial(trimmed);
        break;
      case STAGES.CLARIFYING:
        await this.processClarifying(trimmed);
        break;
      case STAGES.REFLECTION:
        await this.processReflection(trimmed);
        break;
      default:
        break;
    }
  }

  async processInitial(text) {
    const { detectEmotion, detectSetting, QUESTIONS } = await import('./config.js');

    if (!this.preset) {
      this.answers._emotion = detectEmotion(text);
      this.answers._setting = detectSetting(text);
    }

    this.answers.initial = text;
    this.stage = STAGES.CLARIFYING;
    this.questionIndex = 0;

    await this.ui.showTyping(900);
    await this.ui.addBotMessage(
      'Спасибо, что поделился(ась). Давай чуть глубже — я задам несколько мягких вопросов, по одному.'
    );
    await this.delay(500);
    await this.askNextQuestion(QUESTIONS);
  }

  async processClarifying(text) {
    const { QUESTIONS } = await import('./config.js');
    const currentQ = QUESTIONS[this.questionIndex];
    this.answers[currentQ.id] = text;

    this.questionIndex++;

    if (this.questionIndex < QUESTIONS.length) {
      await this.askNextQuestion(QUESTIONS);
    } else {
      await this.generateStory();
    }
  }

  async askNextQuestion(questions) {
    const q = questions[this.questionIndex];
    await this.ui.showTyping(700 + Math.random() * 400);
    await this.ui.addBotMessage(q.text);
    this.ui.setInputEnabled(true);
  }

  async generateStory() {
    this.stage = STAGES.GENERATING;
    this.ui.setInputEnabled(false);

    await this.ui.showTyping(1200);
    await this.ui.addBotMessage('Я собрал твою историю. Сейчас превращу её в сказку.');

    await this.ui.showTyping(2000);

    const { generateStory } = await import('./storyEngine.js');
    const story = generateStory(this.answers, this.preset);

    await this.ui.addStory(story);
    this.stage = STAGES.REFLECTION;

    await this.delay(800);
    await this.ui.showTyping(600);
    await this.ui.addBotMessage('Что в этой истории тебе откликнулось больше всего?');
    this.ui.setInputEnabled(true);
  }

  async processReflection(text) {
    this.stage = STAGES.DONE;
    this.ui.setInputEnabled(false);

    await this.ui.showTyping(800);
    await this.ui.addBotMessage(
      'Спасибо, что заглянул(а) внутрь этой истории. Пусть образ, который откликнулся, останется с тобой — как тихий спутник на дороге. Если захочешь — можешь начать новую сказку в любой момент.'
    );
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class ChatUI {
  constructor() {
    this.chat = document.getElementById('chat');
    this.form = document.getElementById('inputForm');
    this.input = document.getElementById('userInput');
    this.quickPicks = document.getElementById('quickPicks');
    this.btnSend = document.getElementById('btnSend');
    this.typingEl = null;
  }

  clear() {
    this.chat.innerHTML = '';
    return Promise.resolve();
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.chat.scrollTop = this.chat.scrollHeight;
    });
  }

  showQuickPicks(show) {
    this.quickPicks.hidden = !show;
  }

  setInputEnabled(enabled) {
    this.input.disabled = !enabled;
    this.btnSend.disabled = !enabled;
    this.form.classList.toggle('input-bar--disabled', !enabled);
    if (enabled) this.input.focus();
  }

  async addBotMessage(text) {
    this.removeTyping();
    const el = this.createMessage('bot', text);
    this.chat.appendChild(el);
    this.scrollToBottom();
  }

  async addUserMessage(text) {
    this.removeTyping();
    const el = this.createMessage('user', text);
    this.chat.appendChild(el);
    this.scrollToBottom();
  }

  createMessage(type, text) {
    const wrap = document.createElement('div');
    wrap.className = `message message--${type}`;

    const label = document.createElement('div');
    label.className = 'message__label';
    label.textContent = type === 'bot' ? 'Сказкотерапевт' : 'Вы';

    const bubble = document.createElement('div');
    bubble.className = 'message__bubble';

    text.split('\n').forEach((line) => {
      if (line.trim()) {
        const p = document.createElement('p');
        p.textContent = line;
        bubble.appendChild(p);
      }
    });

    wrap.appendChild(label);
    wrap.appendChild(bubble);
    return wrap;
  }

  async addStory(story) {
    this.removeTyping();

    const wrap = document.createElement('div');
    wrap.className = 'message message--bot message--story';

    const label = document.createElement('div');
    label.className = 'message__label';
    label.textContent = 'Твоя сказка';

    const bubble = document.createElement('div');
    bubble.className = 'message__bubble';

    const title = document.createElement('h2');
    title.className = 'story-title';
    title.textContent = story.title;
    bubble.appendChild(title);

    story.paragraphs.forEach((para) => {
      const p = document.createElement('p');
      p.className = 'story-paragraph';
      p.textContent = para;
      bubble.appendChild(p);
    });

    wrap.appendChild(label);
    wrap.appendChild(bubble);
    this.chat.appendChild(wrap);
    this.scrollToBottom();
  }

  showTyping(duration = 800) {
    return new Promise((resolve) => {
      this.removeTyping();

      const wrap = document.createElement('div');
      wrap.className = 'message message--bot';
      wrap.id = 'typing-indicator';

      const typing = document.createElement('div');
      typing.className = 'typing';
      typing.innerHTML = '<span></span><span></span><span></span>';

      wrap.appendChild(typing);
      this.chat.appendChild(wrap);
      this.scrollToBottom();

      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }
}
