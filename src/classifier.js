import * as ort from 'onnxruntime-web/webgpu';
import { AutoTokenizer, softmax, PreTrainedTokenizer } from '@xenova/transformers';

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
        this.cachedInstance = null;
    }

    async initialize() {
        if (this.cachedInstance) return this.cachedInstance;
        this.tokenizer = (await fetch(this.tokenizerPath)).json();
        this.session = await ort.InferenceSession.create(this.modelPath, { 
            executionProviders: ['webgpu'],
            logSeverityLevel: 3
        });
        this.cachedInstance = this;
        return this.cachedInstance;
    }

    async createTokenizer() {
        const [tokenizerJSON, tokenizerConfig] = await Promise.all([
          fetch(`${this.tokenizerPath}`).then(res => res.json()),
          fetch(`${this.tokenizerConfigPath}`).then(res => res.json())
        ]);
      
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
        const inputTensor = new ort.Tensor('int64', input_ids, [1, input_ids.length]);
        const maskTensor = new ort.Tensor('int64', attention_mask, [1, attention_mask.length]);
        const results = await this.session.run(
            {
                'input_ids': inputTensor,
                'attention_mask': maskTensor,
            }
        );
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

export {
    GoEmotionClassifier
};


//  // Not any more efficient than normal classify method
//  async classifyBatch(texts) {
//     const tokenizer = await AutoTokenizer.from_pretrained(this.modelName, {
//         local: true,
//         revision: 'main',
//         local_files_only: true
//     });
//     const tokens = await tokenizer(texts, {
//         padding: true,
//         truncation: true,
//         maxLength: 512,
//         return_tensors: 'pt'
//     });
//     const inputTensors = {
//         input_ids: new ort.Tensor('int64', tokens.input_ids.data, tokens.input_ids.dims),
//         attention_mask: new ort.Tensor('int64', tokens.attention_mask.data, tokens.attention_mask.dims)
//     };
//     const outputs = await this.sessionGPU.run(inputTensors);
//     const logits = outputs[this.sessionGPU.outputNames[0]].data;
//     const probabilities = softmax(logits, tokens.input_ids.dims[0]);
//     return []; // stub
// }