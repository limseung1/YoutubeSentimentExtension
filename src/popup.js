import { GoEmotionClassifier } from './classifier.js';

const texts = [
  "literally brad! i was thinking to start Vue this Year and firstly checked your channel and found Vue courses but these were old courses and noww!! thanks to you!",
  "Wow. That was a day. I started this course at about 7am. Now I'm finished. At 5pm. After 10 hours (Okay, I took a break for about 2 hours...).\nBut it's not your fault that it took me so long to complete this course. It's just a lot of things that you explain very well. This course is excellent! Thank you!",
  "This year is great.,\nReact Js,NodeJs,Express Js and now Vue Js .\nThank You Brad\n",
  "One of the finest Vue 3 tutorial/course I came across. Exactly what one novice developer needed who has of course some prior  basic understanding of how vue works and is supposed to work on a real project. All key topics touched upon in a concise and convincing style. The best part is your Timestamps which helps to go to the exact concept which need to be referred or refreshed while working on projects. Fabulous work.",
  "Just when i was checking your previous Vuejs crash courses,you came out with this. Thanks Traversy",
  "as a react developer i didn't like vue when i tried last year. now had to learn due to a project and this was a great begining. thx for a great crash course..",
  "I'm so happy you're doing a Vue video ! love your way of teaching and your approach. Thanks so much for your contente !",
  "Well sir, maybe I'm a grumpy old man too...  the reason I watch your videos is b/c they are *not* 30 seconds tik-toks. I agree with you, seems like most just want to slap some code in the prj and, if it seems to work, they're off to the next tikTok...  \n\nThe reason your channel and Professor Steve's are the *ONLY* ones I really visit is b/c I desire a deep understanding of the code & tools Im working with;  your lessons provide exactly that. \n\nThank you for sharing your time with us in making these videos ",
  "Thank you for taking the time to make this. There is a little update to your code: You won't need an import statement for defineProps anymore. VSCode says its part of a compiler macro now. Happy coding.",
  "We here! Done all 3hrs in one day. Planning a second full watch for complete mastering.",
  "I was watching your old vue course. Good timing! \n\nI have a site up and running, I let chatgpt do most of the setup and create a pretty decent initial template. \n\nI had to fix some stuff using learning from this course but ai does pretty good!",
  "I just wanted to say I literally only just started learning how to code a couple months ago, and this tutorial was amazing and I learned so much. Ty.",
  "Hello Brad. I just bought your PHP course yesterday as a suppport on your channel. You are amazing man and after I completed it I will definitely watch this.",
  "I was watching the older crash course from my laptop. Using my phone to search for the same, I bumped into this one  . \n\nYou’re such a great instructor, I like the fact that you follow the ‘progressive’ nature of Vue unlike some of other Vue tutorials out there!!",
  "a 1000 doller course free on youtube by brad | big thanks",
  "Anyone jealous over Brad's clean Desktop? I had to pause the video and go clean up my Desktop just to get over my guilt.",
  "Watched 1 and half hour . I had work with options api before. Amazing tutorial. to the point and  make me up and running with composition api . Thanks",
  "Thank you for devoting the time to do this.\nI would love to see a full stack vue3 video as well.\n\nI feel like it was not long at all. Don't feel bad for people who don't have the patience to watch a small  project video..\nI liked that you didn't focus on the ui/css stuff in this video and that each video you create has a distinct purpose, that helps with keeping  the durations reasonable ;)\n\nMay I suggest as a second step, that the api calls could be implemented in composables, to demonstrate their usage as well,\nand for example the form could be a component of itself, called by create and update form views, to demonstrate component reusability.\n\nThe content that you upload is really great, please keep it up.",
  "You can populate all the fields with -> Object.assign(form, state.job) in edit job section instead of filling them one by one.",
  "Thumbs up immediately I found this. I have been struggling with VueJs and I have no doubts in my mind that this, with a lot of practice, is going to get me there. Thank you Brad."
]

const classifier = new GoEmotionClassifier();

const initializeGoEmotionClassifier = async() => {
  await classifier.initialize();
  return classifier;
}

const classifyGoEmotion = async (texts, classifier) => {
  let results = [];
  for (const text of texts){
    try {
      const {input_ids, attention_mask} = await classifier.tokenize(text)
      const result = await classifier.classify(input_ids, attention_mask)
      results.push(result)
    } catch (error) {
      // TODO: handle error better
      console.log(error)
    }
  }

  return results;
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("Ran")
  const analyzeButton = document.getElementById('analyze');
  const resultDiv = document.getElementById('result');

  analyzeButton.addEventListener('click', async () => {
    const start = performance.now();
    resultDiv.textContent = '';
    const classifier = await initializeGoEmotionClassifier();
    // TODO: sanitize texts before sending to classifier
    const results = await classifyGoEmotion(texts, classifier);
    const end = performance.now();
    resultDiv.textContent = JSON.stringify(results, null, 2);
    const timeElapsed = end - start; 
    console.log(timeElapsed)
  });
});
