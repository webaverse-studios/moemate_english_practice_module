
let lastQuestionNAnswer = '';

async function _handleCreateQuestionSkill(event) {

    const context = {
        // messages: `\n\nHuman:User's answer is C. Extract correct answer from following text:\nThe correct answer is B) walked. This is the correct answer because the sentence is describing an action that took place in the past (yesterday) and is completed, so the simple past tense is needed.\nA) will walk is incorrect because it is the future tense, referring to an action that will take place in the future.\nC) had walked is the past perfect tense, used to describe an action that was completed before another past action. It does not fit here.\nD) have walked is the present perfect tense, used to describe an action that started in the past but continues to or impacts the present. It does not fit the timeframe of the sentence.\nThe simple past tense \"walked\" is the only option that properly conveys that the action took place entirely in the past.\nThen check if user's answer is correct or wrong, only reply correct or wrong, don't say anything else.\n\nAssistant:`,
        messages: `\n\nHuman:You are now role-playing as a senior English teacher.\nCreate an English grammar verb tense multiple choice fill-in-the-blank question.\nReveal the correct answer after the question, explain why it is correct.\nAnd explain why other choices are wrong.\nAnd don't forget to add '\\n------\\n' between the question and the explanations.\nExample:\nYesterday I _____ to the store when it started raining.\n A) will walk\n B) walked\n C) had walked\n D) have walked\n------\nThe correct answer is B) walked. This is the correct answer because the sentence is describing an action that took place in the past (yesterday) and is completed, so the simple past tense is needed.\nA) will walk is incorrect because it is the future tense, referring to an action that will take place in the future.\nC) had walked is the past perfect tense, used to describe an action that was completed before another past action. It does not fit here.\nD) have walked is the present perfect tense, used to describe an action that started in the past but continues to or impacts the present. It does not fit the timeframe of the sentence.\nThe simple past tense \"walked\" is the only option that properly conveys that the action took place entirely in the past.\n\nAssistant:`
    }
    const model = window.models.CreateModel('english_practice:check_answer')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    console.log('------ _handleCreateQuestionSkill(event) response:', response)
    // console.log(response.completion.trim())
    // debugger
    // return;

    lastQuestionNAnswer = response.completion;
    const question = lastQuestionNAnswer.split('------')[0];

    window.hooks.emit('moemate_core:handle_skill_text', {name: event.name, value: question});

    // setTimeout(() => {
    //     window.hooks.emit("hack_delay", `You created this question {${question}}, don't answer the question, just write the question (keep the blank!) and choices as is, don't change anything, don't speak anything else!`);
    // }, 100);
}

async function _handleCheckAnswerSkill(event) {
    // debugger
    console.log('------  _handleCheckAnswerSkill(event):', event)

    const userAnswer = event.messages.slice(-1)[0].value.substring(1);
    const answer = lastQuestionNAnswer.split('------')[1];
    const context = {
        messages: `\n\nHuman:User's answer is ${userAnswer}. Extract correct answer from following text:\n${answer}\nThen check if user's answer is correct or wrong, only reply correct or wrong, don't say anything else.\n\nAssistant:`,
    }
    const model = window.models.CreateModel('english_practice:check_answer')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    window.companion.SendMessage({ type: "CHECK_ANSWER", user: event.name, value: response.completion.trim(), timestamp: Date.now(), alt: 'alt'});
    
    setTimeout(() => {
        window.hooks.emit("hack_delay", `Write down the answer and explanations: {${answer}}. Just write the answer and explanations in between \`{}\` as is but don't include \`{}\`, don't change anything, don't speak anything else!`);
    }, 100);
}

function _handleSetPrompts(model, _type) {
    const answer = lastQuestionNAnswer.split('------')[1];
    window.models.ApplyContextObject(model, {answer})
  }

export function init() {
    window.hooks.on('english_practice:handle_create_question_skill', _handleCreateQuestionSkill)
    window.hooks.on('english_practice:handle_check_answer_skill', _handleCheckAnswerSkill)
    window.hooks.on("set_prompts", ({model, type}) => _handleSetPrompts(model, type));
    window.components.AddComponentToScreen('chat-input', 'PromptSelector');
}