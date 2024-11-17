import { pipeline, env } from '@xenova/transformers';
const ort = require('onnxruntime-web');

// Configure environment
env.allowLocalModels = false; // Force it to use remote models
env.cacheDir = './cache/'; // Specify where to cache downloaded models

const setupTransformersTokenizer = async () => {
  try {
    // Initialize pipeline with a progress callback
    const tokenizer = await pipeline('text-classification', 'bert-base-uncased', {
      progress_callback: (progress) => {
        console.log(`Download progress: ${Math.round(progress.progress * 100)}%`);
      }
    });
    return tokenizer;
  } catch (error) {
    console.error('Error setting up tokenizer:', error);
    throw error;
  }
};

const options = {
  executionProviders: ['wasm'], 
  graphOptimizationLevel: 'all'
};

var downLoadingModel = true;
const model = "./xtremedistill-go-emotion-int8.onnx";

const session = ort.InferenceSession.create(model, options);
session.then(t => { 
  downLoadingModel = false;
  //warmup the VM
  for(var i = 0; i < 10; i++) {
    console.log("Inference warmup " + i);
    lm_inference("this is a warmup inference");
  }
});


const EMOJI_DEFAULT_DISPLAY = [
  ["Emotion", "Score"],
  ['admiration 👏',0],
  ['amusement 😂', 0],
  ['neutral 😐',0],
  ['approval 👍',0],
  ['joy 😃',0],
  ['gratitude 🙏',0],
];

const EMOJIS = [
  'admiration 👏',
  'amusement 😂',
  'anger 😡',
  'annoyance 😒',
  'approval 👍',
  'caring 🤗',
  'confusion 😕',
  'curiosity 🤔',
  'desire 😍',
  'disappointment 😞',
  'disapproval 👎',
  'disgust 🤮',
  'embarrassment 😳',
  'excitement 🤩',
  'fear 😨',
  'gratitude 🙏',
  'grief 😢',
  'joy 😃',
  'love ❤️',
  'nervousness 😬',
  'optimism 🤞',
  'pride 😌',
  'realization 💡',
  'relief😅',
  'remorse 😞', 
  'sadness 😞',
  'surprise 😲',
  'neutral 😐'
];

function isDownloading() {
  return downLoadingModel;
}

function sortResult(a, b) {
  if (a[1] === b[1]) {
      return 0;
  }
  else {
      return (a[1] < b[1]) ? 1 : -1;
  }
}

function sigmoid(t) {
  return 1/(1+Math.pow(Math.E, -t));
}

function create_model_input(encoded) {
  var input_ids = new Array(encoded.length+2);
  var attention_mask = new Array(encoded.length+2);
  var token_type_ids = new Array(encoded.length+2);
  input_ids[0] = BigInt(101);
  attention_mask[0] = BigInt(1);
  token_type_ids[0] = BigInt(0);
  var i = 0;
  for(; i < encoded.length; i++) { 
    input_ids[i+1] = BigInt(encoded[i]);
    attention_mask[i+1] = BigInt(1);
    token_type_ids[i+1] = BigInt(0);
  }
  input_ids[i+1] = BigInt(102);
  attention_mask[i+1] = BigInt(1);
  token_type_ids[i+1] = BigInt(0);
  const sequence_length = input_ids.length;
  input_ids = new ort.Tensor('int64', BigInt64Array.from(input_ids), [1,sequence_length]);
  attention_mask = new ort.Tensor('int64', BigInt64Array.from(attention_mask), [1,sequence_length]);
  token_type_ids = new ort.Tensor('int64', BigInt64Array.from(token_type_ids), [1,sequence_length]);
  return {
    input_ids: input_ids,
    attention_mask: attention_mask,
    token_type_ids:token_type_ids
  }
}

async function lm_inference(text) {
  try { 
    const tokenizer = await setupTransformersTokenizer();
    // Get just the tokenizer part from the pipeline
    const tokenizerOutput = await tokenizer.tokenizer(text, {
      padding: true,
      truncation: true,
      maxLength: 512
    });
    
    const encoded_ids = tokenizerOutput.input_ids;

    // const encoded_ids = await tokenizer.then(t => {
    //   return t.tokenize(text); 
    // });
    if(encoded_ids.length === 0) {
      return [0.0, EMOJI_DEFAULT_DISPLAY];
    }
    const start = performance.now();
    const model_input = create_model_input(encoded_ids);
    const output =  await session.then(s => { return s.run(model_input,['output_0'])});
    const duration = (performance.now() - start).toFixed(1);
    const probs = output['output_0'].data.map(sigmoid).map( t => Math.floor(t*100));
    
    const result = [];
    for(var i = 0; i < EMOJIS.length;i++) {
      const t = [EMOJIS[i], probs[i]];
      result[i] = t;
    }
    result.sort(sortResult); 
    
    const result_list = [];
    result_list[0] = ["Emotion", "Score"];
    for(i = 0; i < 6; i++) {
       result_list[i+1] = result[i];
    }
    return [duration,result_list];    
  } catch (e) {
    return [0.0,EMOJI_DEFAULT_DISPLAY];
  }
}    

export let inference = lm_inference 
export let columnNames = EMOJI_DEFAULT_DISPLAY
export let modelDownloadInProgress = isDownloading