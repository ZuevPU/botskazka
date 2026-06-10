import { ChatBot, ChatUI } from './chat.js';

const ui = new ChatUI();
const bot = new ChatBot(ui);

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

ui.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = ui.input.value;
  if (!text.trim()) return;

  ui.input.value = '';
  autoResizeTextarea(ui.input);
  ui.setInputEnabled(false);

  await bot.handleUserMessage(text);
});

ui.input.addEventListener('input', () => autoResizeTextarea(ui.input));

ui.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    ui.form.requestSubmit();
  }
});

document.getElementById('quickPicks').addEventListener('click', async (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;

  ui.setInputEnabled(false);
  await bot.handleTopicChip(chip.dataset.topic);
});

document.getElementById('btnRestart').addEventListener('click', () => {
  ui.input.value = '';
  autoResizeTextarea(ui.input);
  bot.start();
});

bot.start();
