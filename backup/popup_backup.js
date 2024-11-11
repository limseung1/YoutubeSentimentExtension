import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);


const modelMappings = {
  // 'sentiment-analysis': 'distilbert-base-uncased-finetuned-sst-2-english',
  'sentiment-analysis': 'shahrukhx01/question-vs-statement-classifier',
  'text-classification': 'facebook/bart-large-mnli',
};

async function analyzeText(text, task) {
  const model = modelMappings[task];
  
  switch(task) {
    case 'sentiment-analysis':
      return await hf.textClassification({
        model: model,
        inputs: text
      });
    
    case 'text-classification':
      return await hf.textClassification({
        model: model,
        inputs: text
      });

    default:
      throw new Error('Unsupported task');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyze');
  const input = document.getElementById('input');
  const modelSelect = document.getElementById('model');
  const resultDiv = document.getElementById('result');
  const loadingDiv = document.getElementById('loading');

  analyzeButton.addEventListener('click', async () => {
    const text = input.value.trim();
    const task = modelSelect.value;

    try {
      analyzeButton.disabled = true;
      loadingDiv.style.display = 'block';
      resultDiv.textContent = '';

      const result = await analyzeText(text, task);

      // const result = await inference(text)[1]

      if (task === 'token-classification') {
        resultDiv.textContent = JSON.stringify(result.map(item => ({
          word: item.word,
          entity: item.entity_group,
          score: item.score.toFixed(4)
        })), null, 2);
      } else {
        resultDiv.textContent = JSON.stringify(result, null, 2);
      }
    } catch (error) {
      resultDiv.textContent = `Error: ${error.message}`;
    } finally {
      analyzeButton.disabled = false;
      loadingDiv.style.display = 'none';
    }
  });
});
