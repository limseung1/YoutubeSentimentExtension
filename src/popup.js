// import * as ort from 'onnxruntime-web/webgpu';
import * as ort from 'onnxruntime-web';
import { softmax, PreTrainedTokenizer } from '@xenova/transformers';


const texts = [
  "literally brad! i was thinking to start Vue this Year and firstly checked your channel and found Vue courses but these were old courses and noww!! thanks to you!",
]


class GoEmotionClassifier {
    constructor() {
        this.tokenizer = null;
        this.session = null;
        this.modelName = "roberta-base-go_emotions";
        this.path = "/models/" + this.modelName + "/";
        this.tokenizerPath = chrome.runtime.getURL(this.path + "tokenizer.json");
        this.tokenizerConfigPath = chrome.runtime.getURL(this.path + "tokenizer_config.json");
        this.modelPath = chrome.runtime.getURL(this.path + "onnx/model_fp16.onnx");
        this.emotions = [
            'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring',
            'confusion', 'curiosity', 'desire', 'disappointment', 'disapproval',
            'disgust', 'embarrassment', 'excitement', 'fear', 'gratitude', 'grief',
            'joy', 'love', 'nervousness', 'optimism', 'pride', 'realization',
            'relief', 'remorse', 'sadness', 'surprise', 'neutral'
        ];
    }

    async initialize() {
        this.tokenizer = (await fetch(this.tokenizerPath)).json();
        this.session = await ort.InferenceSession.create(this.modelPath);
    }

    async createTokenizer() {
      console.log('start creating tokenizer...')
        const [tokenizerJSON, tokenizerConfig] = await Promise.all([
          fetch(`${this.tokenizerPath}`).then(res => res.json()),
          fetch(`${this.tokenizerConfigPath}`).then(res => res.json())
        ]);

        console.log(tokenizerJSON)
        console.log(tokenizerConfig)
        console.log('Succeess creating tokenizer ...')
      
        return new PreTrainedTokenizer(tokenizerJSON, tokenizerConfig);
    }

    async tokenize(text) {
        const tokenizer = await this.createTokenizer(this.modelName);
        const encoded = await tokenizer(text, {
            padding: true,
            truncation: true,
            maxLength: 512,
            return_tensors: 'pt'
        });

        return {
            input_ids: encoded.input_ids.data,
            attention_mask: encoded.attention_mask.data
        }
    }

    async classify(input_ids, attention_mask) {
        console.log("Run 1")
        const inputTensor = new ort.Tensor('int64', input_ids, [1, input_ids.length]);
        console.log("Run 2")
        const maskTensor = new ort.Tensor('int64', attention_mask, [1, attention_mask.length]);
        console.log("Run 3")
        const results = await this.session.run(
            {
                'input_ids': inputTensor,
                'attention_mask': maskTensor,
            }
        );
        console.log("Run 4")
        const probabilities = softmax(results.logits.data)
        const maxProbability = Math.max(...probabilities);
        const predictionIndex = probabilities.indexOf(maxProbability);
        const scores = {};
        this.emotions.forEach((emotion, index) => {
            scores[emotion] = probabilities[index];
        });

        return {
            prediction: this.emotions[predictionIndex],
            confidence: maxProbability,
            scores: scores
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("Start Diagnosis ...")
  const analyzeButton = document.getElementById('analyze');
  const resultDiv = document.getElementById('result');

  analyzeButton.addEventListener('click', async () => {
    const start = performance.now();
    resultDiv.textContent = '';

    let results = []
    console.log("Instantiate try ...")
    const classifier = new GoEmotionClassifier();
    console.log("Instantiate success ...")

    console.log("Init try ...")
    await classifier.initialize();
    console.log("Init success ...")

    for (const text of texts){
      try {
        console.log("Tokenize try ...")
        const {input_ids, attention_mask} = await classifier.tokenize(text)
        console.log("Tokenize success ...")

        console.log("Classify try ...")
        const result = await classifier.classify(input_ids, attention_mask)
        console.log("Classify success ...")

        results.push(result)
      } catch (error) {
        // TODO: handle error better
        console.log(error)
      }
    }

    const end = performance.now();
    resultDiv.textContent = JSON.stringify(results, null, 2);
    const timeElapsed = end - start; 
    console.log(timeElapsed)
  });
});