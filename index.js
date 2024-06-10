import Mystem from '@webrofl/mystem3';

const mystem = new Mystem();

console.log('start', mystem);

// Функция для очистки текста
function cleanText(text) {
  return text.replaceAll(/[^a-zA-Z0-9\u0400-\u04FF\s]+/g, '').toLowerCase();
}

// Функция для лемматизации текста
const lemmatizeText = async (text) => {
  const words = await text.split(' ');
  const res = [];

  for (const word of words) {
    const [item] = await mystem.extractAllGrammemes(word);
    res.push(item);
  }

  return res;
};

// Функция для создания словаря частотности слов
function createFrequencyDict(words) {
  const freqDict = {};
  words.forEach((word) => {
    if (word in freqDict) {
      freqDict[word] += 1;
    } else {
      freqDict[word] = 1;
    }
  });
  return freqDict;
}

// Функция для вычисления косинусного сходства
function cosineSimilarity(freqDict1, freqDict2) {
  const allWords = new Set([
    ...Object.keys(freqDict1),
    ...Object.keys(freqDict2),
  ]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  allWords.forEach((word) => {
    const freq1 = freqDict1[word] || 0;
    const freq2 = freqDict2[word] || 0;
    dotProduct += freq1 * freq2;
    norm1 += freq1 * freq1;
    norm2 += freq2 * freq2;
  });

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Функция для проверки плагиата
async function checkPlagiarism(text1, text2) {
  mystem.start();

  const cleanedText1 = cleanText(text1);
  const cleanedText2 = cleanText(text2);

  const lemmas1 = await lemmatizeText(cleanedText1);
  const lemmas2 = await lemmatizeText(cleanedText2);

  const freqDict1 = createFrequencyDict(lemmas1);
  const freqDict2 = createFrequencyDict(lemmas2);

  const similarity = cosineSimilarity(freqDict1, freqDict2);

  return similarity;
}

// Пример использования с лемматизацией
const text1 = 'Это пример текста для обнаружения плагиата.';
const text2 = 'Это текст-пример для выявления плагиата.';

checkPlagiarism(text1, text2)
  .then((similarityScore) => {
    mystem.stop();
    console.log('Коэффициент косинусного сходства:', similarityScore);
    if (similarityScore > 0.5) {
      console.log('Высокая степень схожести. Возможен плагиат.');
    } else {
      console.log('Низкая степень схожести. Плагиат маловероятен.');
    }
  })
  .catch((err) => {
    mystem.stop();
    console.error('Ошибка при лемматизации текста:', err);
  });
