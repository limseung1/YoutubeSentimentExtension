// import { pipeline, cos_sim } from '@xenova/transformers'

// function norm(sim) {
//     return (sim + 1) / 2
// }

// const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// const sentence1 = await extractor('You can populate all the fields with -> Object.assign(form, state.job) in edit job section instead of filling them one by one.', { pooling: 'mean', normalize: true });
// const sentence2 = await extractor('Thumbs up immediately I found this. I have been struggling with VueJs and I have no doubts in my mind that this, with a lot of practice, is going to get me there. Thank you Brad.', { pooling: 'mean', normalize: true });
// const sentence3 = await extractor('1:24:26 - computed() & Truncate Description', { pooling: 'mean', normalize: true });

// const truth = await extractor('Vue.js Crash Course 2024 3 Hour crash course of the Vue.js framework. You will learn all the fundamentals including components, directives, lifecycle, events and much more.', { pooling: 'mean', normalize: true });

// console.log(cos_sim(sentence1.data, truth.data))
// console.log(cos_sim(sentence2.data, truth.data))
// console.log(cos_sim(sentence3.data, truth.data))
