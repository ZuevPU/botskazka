import {
  EMOTIONS,
  SETTINGS,
  HERO_NAMES,
  OPENINGS,
  pickRandom,
} from './config.js';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractHeroName(answers) {
  const text = Object.values(answers).join(' ');
  const nameMatch = text.match(/(?:меня зовут|я\s+—?\s*|герой\s+—?\s*)([А-ЯA-Z][а-яa-z]+)/i);
  if (nameMatch) return nameMatch[1];
  return pickRandom(HERO_NAMES);
}

export function buildStoryContext(answers, preset = null) {
  const allText = Object.values(answers).join(' ');

  const emotionKey = preset?.emotion || answers._emotion || 'confusion';
  const settingKey = preset?.setting || answers._setting || 'default';

  const emotion = EMOTIONS[emotionKey] || EMOTIONS.confusion;
  const setting = SETTINGS[settingKey] || SETTINGS.default;

  return {
    heroName: extractHeroName(answers),
    heroType: emotion.hero,
    place: setting.place,
    placeDetail: setting.detail,
    obstacle: emotion.obstacle,
    symbol: answers.symbol || emotion.symbol,
    helper: emotion.helper,
    resource: emotion.resource,
    transform: emotion.transform,
    lack: answers.lack || 'тишины и опоры',
    desired: answers.desired || 'спокойствия и ясности',
    situation: answers.situation || 'жизни, где всё казалось переплетённым',
    emotionHero: answers.emotion || emotion.hero,
    userSymbol: answers.symbol || null,
  };
}

export function generateStory(answers, preset = null) {
  const ctx = buildStoryContext(answers, preset);
  const opening = pickRandom(OPENINGS);

  const paragraphs = [
    `${opening} ${ctx.heroType} по имени ${ctx.heroName}. ${capitalize(ctx.heroName)} жил${ctx.heroName.endsWith('а') ? 'а' : ''} в ${ctx.place} — ${ctx.placeDetail}. Со стороны всё казалось устроенным, но внутри ${ctx.heroName.endsWith('а') ? 'её' : 'его'} жило чувство, которое ${ctx.heroName.endsWith('а') ? 'она' : 'он'} ${ctx.heroName.endsWith('а') ? 'называла' : 'называл'} своим невидимым спутником.`,

    `Однажды равновесие нарушилось. ${capitalize(ctx.situation)} — и ${ctx.heroName.endsWith('а') ? 'ей' : 'ему'} встретилось ${ctx.obstacle}. Это было не зло ради зла, а просто то, что стояло на пути. ${ctx.heroName.endsWith('а') ? 'Она' : 'Он'} ${ctx.heroName.endsWith('а') ? 'чувствовала' : 'чувствовал'}, как внутри поднимается ${ctx.emotionHero} — тяжёлый, знакомый, но не приговор.`,

    `${ctx.heroName.endsWith('а') ? 'Она' : 'Он'} ${ctx.heroName.endsWith('а') ? 'пошла' : 'пошёл'} дальше, хотя ${ctx.lack} ${ctx.heroName.endsWith('а') ? 'ей казалось' : 'ему казалось'} недостижим${ctx.heroName.endsWith('а') ? 'ой' : 'ым'}. Дорога вела через ${ctx.symbol}. Каждый шаг требовал решения — не громкого, а тихого: продолжать или остановиться, верить или сомневаться.`,

    `На повороте ${ctx.heroName.endsWith('а') ? 'её' : 'его'} ${ctx.heroName.endsWith('а') ? 'встретила' : 'встретил'} ${ctx.helper}. Это не был ${ctx.heroName.endsWith('а') ? 'спаситель' : 'спаситель'}, пришедший всё исправить. Скорее — напоминание. «У тебя уже есть то, что нужно», — ${ctx.helper.endsWith('а') ? 'сказала' : 'сказал'} ${ctx.helper}. И ${ctx.heroName.endsWith('а') ? 'она' : 'он'} ${ctx.heroName.endsWith('а') ? 'вспомнила' : 'вспомнил'} про ${ctx.resource}.`,

    `${ctx.userSymbol ? `Образ ${ctx.userSymbol} всплыл в памяти — как знак, который ${ctx.heroName.endsWith('а') ? 'она' : 'он'} ${ctx.heroName.endsWith('а') ? 'несла' : 'нёс'} с собой, даже не замечая.` : `В этот момент ${ctx.symbol} перестал${ctx.symbol.endsWith('а') ? 'а' : ''} быть преградой и стал${ctx.symbol.endsWith('а') ? 'а' : ''} зеркалом — в нём ${ctx.heroName.endsWith('а') ? 'она' : 'он'} ${ctx.heroName.endsWith('а') ? 'увидела' : 'увидел'} не врага, а часть себя.`}`,

    `Ключевой выбор был простым и трудным одновременно: ${ctx.heroName.endsWith('а') ? 'она' : 'он'} ${ctx.heroName.endsWith('а') ? 'решила' : 'решил'} не бороться с тем, что ${ctx.heroName.endsWith('а') ? 'её' : 'его'} пугало, а выслушать. Не отвернуться от ${ctx.obstacle}, а пройти рядом — медленно, с уважением к своему темпу.`,

    `Постепенно ${ctx.transform}. ${capitalize(ctx.desired)} — не как далёкая мечта, а как ощущение, которое ${ctx.heroName.endsWith('а') ? 'она' : 'он'} ${ctx.heroName.endsWith('а') ? 'начала' : 'начал'} узнавать внутри. Препятствие не исчезло полностью — в ${ctx.place} редко что исчезает навсегда. Но ${ctx.heroName.endsWith('а') ? 'она' : 'он'} ${ctx.heroName.endsWith('а') ? 'научилась' : 'научился'} идти рядом с ним, не отдавая ему всю дорогу.`,

    `И когда ${ctx.heroName.endsWith('а') ? 'она' : 'он'} ${ctx.heroName.endsWith('а') ? 'вернулась' : 'вернулся'} домой, мир выглядел тем же — и другим. Потому что ${ctx.heroName.endsWith('а') ? 'она' : 'он'} ${ctx.heroName.endsWith('а') ? 'изменилась' : 'изменился'}. А в сказках, как и в жизни, иногда этого достаточно.`,
  ];

  return {
    title: `Сказка о ${ctx.heroName}`,
    paragraphs,
  };
}
