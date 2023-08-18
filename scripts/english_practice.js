
// let lastQuestionNAnswer = '';
let lastQuestion = '';

async function _handleCreateQuestionSkill(event) {
    // window.companion.SendMessage({ type: "CREATE_QUESTION", user: event.name, value: 'Creating a question', timestamp: Date.now(), alt: 'alt'});
    // window.companion.SendMessage({ type: "CREATE_QUESTION", user: event.name, value: '', timestamp: Date.now(), alt: 'alt'});

    let pointAndSpace = '';
    if (event.point) {
        pointAndSpace = event.point === 'any' ? '' : (event.point + ' ');
    } else {
        pointAndSpace = 'tenses';
    }

    const level = event.level ?? 'intermediate';

    const context = {
        // messages: `\n\nHuman:User's answer is C. Extract correct answer from following text:\nThe correct answer is B) walked. This is the correct answer because the sentence is describing an action that took place in the past (yesterday) and is completed, so the simple past tense is needed.\nA) will walk is incorrect because it is the future tense, referring to an action that will take place in the future.\nC) had walked is the past perfect tense, used to describe an action that was completed before another past action. It does not fit here.\nD) have walked is the present perfect tense, used to describe an action that started in the past but continues to or impacts the present. It does not fit the timeframe of the sentence.\nThe simple past tense \"walked\" is the only option that properly conveys that the action took place entirely in the past.\nThen check if user's answer is correct or wrong, only reply correct or wrong, don't say anything else.\n\nAssistant:`,

        // messages: `\n\nHuman:You are now role-playing as a senior English teacher.\nCreate an English grammar verb tense multiple choice fill-in-the-blank question.\nReveal the correct answer after the question, explain why it is correct.\nAnd explain why other choices are wrong.\nAnd don't forget to add '\\n------\\n' between the question and the explanations.\nExample:\nYesterday I _____ to the store when it started raining.\n A) will walk\n B) walked\n C) had walked\n D) have walked\n------\nThe correct answer is B) walked. This is the correct answer because the sentence is describing an action that took place in the past (yesterday) and is completed, so the simple past tense is needed.\nA) will walk is incorrect because it is the future tense, referring to an action that will take place in the future.\nC) had walked is the past perfect tense, used to describe an action that was completed before another past action. It does not fit here.\nD) have walked is the present perfect tense, used to describe an action that started in the past but continues to or impacts the present. It does not fit the timeframe of the sentence.\nThe simple past tense \"walked\" is the only option that properly conveys that the action took place entirely in the past.\n\nAssistant:`
        
//         messages: `\n\nHuman:
// ### You are now role-playing as a senior English teacher. Create an English grammar verb tense multiple choice fill-in-the-blank question. ( Random seed: ${Math.random()} )
// Don't reveal the answer.Only write the question, don't speak anything else.

// ### Example:
// Yesterday I _____ to the store when it started raining.
// A) will walk
// B) walked
// C) had walked
// D) have walked

// Assistant:`,


//         messages: `\n\nHuman:
// ### Create an English grammar tenses multiple choice fill-in-the-blank question.
// Reveal the correct answer after the question, explain why it is correct.
// Explain why other choices are wrong.
// Explain why you create this question.
// Add '\\n------\\n' before the question, and between the question and the explanations.

// ###Example:
// Here is an English grammar verb tense multiple choice fill-in-the-blank question:
// ------
// Yesterday I _____ to the store when it started raining.
// A) will walk
// B) walked
// C) had walked
// D) have walked
// ------
// The correct answer is B) walked. This is the correct answer because the sentence is describing an action that took place in the past (yesterday) and is completed, so the simple past tense is needed.
// A) will walk is incorrect because it is the future tense, referring to an action that will take place in the future.
// C) had walked is the past perfect tense, used to describe an action that was completed before another past action. It does not fit here.
// D) have walked is the present perfect tense, used to describe an action that started in the past but continues to or impacts the present. It does not fit the timeframe of the sentence.
// The simple past tense \"walked\" is the only option that properly conveys that the action took place entirely in the past.

// Assistant:`
// Let AI also reveal the answer and explain, to let it create more correct questions. Later may can also use this answer to double check.

        messages: `\n\nHuman:
### Create an English grammar ${pointAndSpace}multiple choice fill-in-the-blank question.
Reveal the correct answer after the question, explain why it is correct.
Explain why other choices are wrong.
Explain why you create this question.
Add '------' before the question.
Add '------' after the choices of the question, before revealing the answer and explaining.

Assistant:`
// Let AI also reveal the answer and explain, to let it create more correct questions. Later may can also use this answer to double check.
// Don't provide example to prevent AI almost always create questions start with something like "By the time ...".
// Don't require hard level to prevent create questions with so many blanks.

    }
    console.log('------ _handleCreateQuestionSkill prompt before await:', context.messages)
    const model = window.models.CreateModel('english_practice:check_answer')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    console.log('------ _handleCreateQuestionSkill prompt:', context.messages)
    console.log('------ _handleCreateQuestionSkill response:', response.completion)
    // console.log(response.completion.trim())
    // debugger
    // return;

    const question = response.completion.split('------')[1];
    lastQuestion = question;
    // lastQuestionNAnswer = response.completion;
    // const question = lastQuestionNAnswer.split('------')[0];

    // const lines = window.util.SplitSentences(question);
    const lines = question.split('\n');
    lines.forEach(line => {
        if (line.trim() === '') return;
        console.log('--- line:', line, event)
        window.hooks.emit('moemate_core:handle_skill_text', {name: event.name, value: line});
        // window.skills_llm.CallSkill(model, 'TEXT', {name: event.name, value: line});
    })

    // setTimeout(() => {
    //     window.hooks.emit("hack_delay", `You created this question {${question}}, don't answer the question, just write the question (keep the blank!) and choices as is, don't change anything, don't speak anything else!`);
    // }, 100);

    window.models.DestroyModel(model);
    const isStop = true;
    return isStop;
}

async function _handleCheckAnswerSkill(event) {
    // debugger
    console.log('------  _handleCheckAnswerSkill event:', event)

    // const userAnswer = event.messages.slice(-1)[0].value.substring(1);
    // const answer = lastQuestionNAnswer.split('------')[1];
    // const context = {
    //     messages: `\n\nHuman:User's answer is ${userAnswer}. Extract correct answer from following text:\n${answer}\nThen check if user's answer is correct or wrong, only reply correct or wrong, don't say anything else.\n\nAssistant:`,
    // }
    // const model = window.models.CreateModel('english_practice:check_answer')
    // window.models.ApplyContextObject(model, context);
    // const response = await window.models.CallModel(model);
    // window.companion.SendMessage({ type: "CHECK_ANSWER", user: event.name, value: response.completion.trim(), timestamp: Date.now(), alt: 'alt'});
    // window.hooks.emit('moemate_core:handle_skill_text', {name: event.name, value: answer});
    
    // // setTimeout(() => {
    // //     window.hooks.emit("hack_delay", `Write down the answer and explanations: {${answer}}. Just write the answer and explanations in between \`{}\` as is but don't include \`{}\`, don't change anything, don't speak anything else!`);
    // // }, 100);
        
    const userAnswer = event.messages.slice(-1)[0].value.substring(1);
    // todo: use assistant's last message as question instead of lastQuestion variable.
    const context = {
        // messages: `\n\nHuman:Here is an English grammar verb tense multiple choice fill-in-the-blank question:\n${lastQuestion}\nReveal the correct answer, explain why it is correct.\nAnd explain why other choices are wrong.\nWrite '------'.\nAlso here's a user's answer: ${userAnswer}.Check if user's answer is correct or wrong, only reply correct or wrong, don't say anything else.\nExample:The correct answer is B) walked. This is the correct answer because the sentence is describing an action that took place in the past (yesterday) and is completed, so the simple past tense is needed.\nA) will walk is incorrect because it is the future tense, referring to an action that will take place in the future.\nC) had walked is the past perfect tense, used to describe an action that was completed before another past action. It does not fit here.\nD) have walked is the present perfect tense, used to describe an action that started in the past but continues to or impacts the present. It does not fit the timeframe of the sentence.\nThe simple past tense \"walked\" is the only option that properly conveys that the action took place entirely in the past.\n------\ncorrect\n\nAssistant:`,
        messages: `\n\nHuman:
### Here is an English grammar verb tense multiple choice fill-in-the-blank question:
${lastQuestion}

### Here's my answer: ${userAnswer}. Check if my answer is correct or wrong.

### Reveal the correct answer, explain why it is correct or wrong.

### Explain why other choices are wrong.

### Example:
Your answer is correct/wrong.

The correct answer is B) "walked". This is the correct answer because the sentence is describing an action that took place in the past (yesterday) and is completed, so the simple past tense is needed.

A) "will walk" is incorrect because it is the future tense, referring to an action that will take place in the future.
C) "had walked" is the past perfect tense, used to describe an action that was completed before another past action. It does not fit here.
D) "have walked" is the present perfect tense, used to describe an action that started in the past but continues to or impacts the present. It does not fit the timeframe of the sentence.

The simple past tense "walked" is the only option that properly conveys that the action took place entirely in the past.

Assistant:`,
    }
    const model = window.models.CreateModel('english_practice:check_answer')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    console.log('------ _handleCheckAnswerSkill prompt:', context.messages)
    console.log('------  _handleCheckAnswerSkill response:', response.completion)
    // window.companion.SendMessage({ type: "CHECK_ANSWER", user: event.name, value: response.completion.trim(), timestamp: Date.now(), alt: 'alt'});

    const lines = response.completion.split('\n');
    lines.forEach(line => {
        if (line.trim() === '') return;
        window.hooks.emit('moemate_core:handle_skill_text', {name: event.name, value: line});
    })

    window.models.DestroyModel(model);
    const isStop = true;
    return isStop;
}

// function _handleSetPrompts(model, _type) {
//     const answer = lastQuestionNAnswer.split('------')[1];
//     window.models.ApplyContextObject(model, {answer})
//   }

export function init() {
    window.hooks.on('english_practice:handle_create_question_skill', _handleCreateQuestionSkill)
    window.hooks.on('english_practice:handle_check_answer_skill', _handleCheckAnswerSkill)
    // window.hooks.on("set_prompts", ({model, type}) => _handleSetPrompts(model, type));
    window.components.AddComponentToScreen('chat-input', 'PromptSelector');
}