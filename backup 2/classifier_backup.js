import * as ort from 'onnxruntime-web';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

class SentimentClassifier {
    constructor(modelPath) {
        this.tokenizer = null;
        this.session = null;
        this.initialized = false;
        this.modelPath = modelPath;
    }

    async initialize() {
        try {
            // Get the directory path of the current module
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            
            // Load tokenizer configuration
            const tokenizerPath = path.join(this.modelPath, 'tokenizer.json');
            const tokenizerData = await readFile(tokenizerPath, 'utf8');
            this.tokenizer = JSON.parse(tokenizerData);
            
            // Initialize ONNX session
            const modelPath = path.join(this.modelPath, 'onnx/model.onnx');
            this.session = await ort.InferenceSession.create(modelPath);
            
            this.initialized = true;
        } catch (error) {
            console.error('Initialization failed:', error);
            throw error;
        }
    }

    tokenize(text) {
        if (!this.tokenizer || !this.tokenizer.model || !this.tokenizer.model.vocab) {
            throw new Error('Tokenizer not properly initialized');
        }

        // Apply normalizer settings from config
        text = text.toLowerCase(); // From normalizer.lowercase = true
        // Clean text and handle Chinese chars could be implemented here if needed

        // Start with CLS token
        const tokens = ['[CLS]'];
        const inputIds = [101]; // CLS token ID

        // Split into words (basic pre-tokenization)
        const words = text.split(/\s+/);

        /*** WordPiece Tokenization
         splits words into subwords that exist in the model's vocabulary
         Example: "playing" might become ["play", "##ing"]
         The "##" prefix indicates it's a continuation of the previous token
         */
        for (const word of words) {
            let isTokenFound = false;
            let start = 0;
            const wordLen = word.length;

            while (start < wordLen) {
                let end = wordLen;
                let currentToken = null;

                while (start < end) {
                    const substr = word.slice(start, end);
                    if (start > 0) {
                        // Try with ## prefix for continuing subwords
                        const subToken = '##' + substr;
                        if (this.tokenizer.model.vocab[subToken] !== undefined) {
                            currentToken = subToken;
                            break;
                        }
                    } else {
                        // Try without ## prefix for first subword
                        if (this.tokenizer.model.vocab[substr] !== undefined) {
                            currentToken = substr;
                            break;
                        }
                    }
                    end -= 1;
                }

                if (currentToken === null) {
                    // If no valid token found, use single character as UNK
                    currentToken = '[UNK]';
                    start += 1;
                } else {
                    start = end;
                }

                tokens.push(currentToken);
                inputIds.push(this.tokenizer.model.vocab[currentToken] || 100); // 100 is UNK token ID
            }
        }

        // Add SEP token
        tokens.push('[SEP]');
        inputIds.push(102); // SEP token ID

        // Create attention mask (1 for real tokens, 0 for padding)
        const attentionMask = new Array(inputIds.length).fill(1);

        // Pad or truncate to max length (128 is common for classification)
        const maxLength = 128;
        if (inputIds.length > maxLength) {
            inputIds.length = maxLength;
            attentionMask.length = maxLength;
        } else {
            while (inputIds.length < maxLength) {
                inputIds.push(0);  // Padding token
                attentionMask.push(0);  // Mask is 0 for padding
            }
        }

        return {
            inputIds,
            attentionMask,
            tokens // Adding tokens for debugging
        };
    }

    async classify(text) {
        if (!this.initialized) {
            throw new Error('Classifier not initialized. Call initialize() first.');
        }

        try {
            // Tokenize the input text
            const { inputIds, attentionMask, tokens } = this.tokenize(text);

            // Create input tensors
            const inputTensor = new ort.Tensor('int64', new BigInt64Array(inputIds.map(id => BigInt(id))), [1, inputIds.length]);
            const maskTensor = new ort.Tensor('int64', new BigInt64Array(attentionMask.map(id => BigInt(id))), [1, attentionMask.length]);

            // Run inference
            const feeds = {
                'input_ids': inputTensor,
                'attention_mask': maskTensor
            };

            const results = await this.session.run(feeds);
            
            // Get the output tensor's data
            const outputData = results[Object.keys(results)[0]].data;
            
            // Convert logits to probabilities using softmax
            const softmax = this.softmax(Array.from(outputData));
            
            return {
                prediction: softmax[1] > 0.5 ? 'Positive' : 'Negative',
                confidence: Math.max(...softmax),
                scores: {
                    negative: softmax[0],
                    positive: softmax[1]
                },
                tokens // Return tokens for debugging
            };
        } catch (error) {
            console.error('Classification failed:', error);
            throw error;
        }
    }

    softmax(arr) {
        const maxVal = Math.max(...arr);
        const expValues = arr.map(val => Math.exp(val - maxVal));
        const sumExp = expValues.reduce((acc, curr) => acc + curr, 0);
        return expValues.map(val => val / sumExp);
    }
}

export default SentimentClassifier;