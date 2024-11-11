import SentimentClassifier from './classifier.js';
// import SentimentClassifier from './classifier2.js';
import path from 'path';
import { fileURLToPath } from 'url';

export async function inference(text) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const modelPath = path.join(__dirname, 'models/distilbert-base-uncased-finetuned-sst-2-english');
    const classifier = new SentimentClassifier(modelPath);
    await classifier.initialize();
    const result = await classifier.classify(text);
    console.log(result.tokens); // See the actual tokens
    console.log(result.prediction);
    console.log(result.scores);
}


