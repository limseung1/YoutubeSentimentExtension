import * as ort from 'onnxruntime-web';
import { AutoTokenizer, softmax } from '@xenova/transformers';

class SentimentClassifier {
    constructor(modelPath) {
        this.tokenizer = null;
        this.session = null;
        this.initialized = false;
    }

    async initialize(tokenizerPath, modelPath) {
        try {
            // Load tokenizer configuration
            const tokenizerPromise = (await fetch(tokenizerPath)).json();
            const tokenizerData = await tokenizerPromise
            this.tokenizer = tokenizerData

            // Initialize ONNX session
            this.session = await ort.InferenceSession.create(modelPath);

            this.initialized = true;
        } catch (error) {
            console.error('Initialization failed:', error);
            throw error;
        }
    }

    async tokenize(text) {
        const MODEL_PATH = 'distilbert-base-uncased-finetuned-sst-2-english';

        const tokenizer = await AutoTokenizer.from_pretrained(MODEL_PATH, {
            local: true,
            revision: 'main'
        });

        const encoded = await tokenizer(text, {
            padding: true,
            truncation: true,
            maxLength: 512,
            return_tensors: 'pt'
        });

        const tokens = tokenizer.batch_decode(encoded.input_ids, {
            skip_special_tokens: false // Set to true if you don't want [CLS], [SEP], etc.
        });

        return {
            _input_ids: encoded.input_ids.data,
            _attention_mask: encoded.attention_mask.data,
            _tokens: tokens
        }
    }

    async classify(text) {
        // Tokenize the input text
        const { _input_ids, _attention_mask, _tokens } = await this.tokenize(text);

        // Create input tensors improved [batch size, sequence length]
        const inputTensor = new ort.Tensor('int64', _input_ids, [1, _input_ids.length]);
        const maskTensor = new ort.Tensor('int64', _attention_mask, [1, _attention_mask.length]);

        // Run inference
        const feeds = {
            'input_ids': inputTensor,
            'attention_mask': maskTensor
        };
        const results = await this.session.run(feeds);

        // Convert logits to probabilities using softmax
        const probabilities = softmax(results.logits.data)
        
        return {
            prediction: probabilities[1] > 0.5 ? 'Positive' : 'Negative',
            confidence: Math.max(...probabilities),
            scores: {
                negative: probabilities[0],
                positive: probabilities[1]
            },
            _tokens // Return tokens for debugging
        };
    }
}

export default SentimentClassifier;