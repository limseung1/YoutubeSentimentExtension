import SentimentClassifier from './classifier.js';

const classify = async (text) => {
  const path = "/models/distilbert-base-uncased-finetuned-sst-2-english/"
  const tokenizerPath = chrome.runtime.getURL(path + "tokenizer.json");
  const modelPath = chrome.runtime.getURL(path + "onnx/model.onnx");

  const classifier = new SentimentClassifier();
  await classifier.initialize(tokenizerPath, modelPath);

  const result = await classifier.classify(text);
  return result
}

document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyze');
  const input = document.getElementById('input');
  const resultDiv = document.getElementById('result');
  const loadingDiv = document.getElementById('loading');

  analyzeButton.addEventListener('click', async () => {
    const text = input.value.trim();

    analyzeButton.disabled = true;
    loadingDiv.style.display = 'block';
    resultDiv.textContent = '';

    const result = await classify(text);
    resultDiv.textContent = JSON.stringify(result, null, 2);
  });
});