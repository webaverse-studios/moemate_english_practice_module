
let lastQuestionNAnswer = '';

function _handleCreateQuestionSkill(event) {
    console.log(`_handleCreateQuestionSkill(event):`, event);
    // debugger
    // window.companion.SendMessage({ type: "TEXT", user: event.name, value: event.value, timestamp: Date.now(), alt: responseObj.description});
    // window.companion.SendMessage({ type: "TEXT", user: event.name, value: event.value, timestamp: Date.now(), alt: 'alt'});
    // setTimeout(() => {
    //     window.hooks.emit("hack_delay", `You created this question {${event.value}}, don't answer the question, just write the question as is (keep the blank!), don't change anything, don't speak anything else!`);
    // }, 100);

    lastQuestionNAnswer = event.value;
    const question = lastQuestionNAnswer.split('------')[0];
    // window.companion.SendMessage({ type: "TEXT", user: event.name, value: question, timestamp: Date.now(), alt: 'alt'});
    setTimeout(() => {
        window.hooks.emit("hack_delay", `You created this question {${question}}, don't answer the question, just write the question and (keep the blank!) choices as is, don't change anything, don't speak anything else!`);
    }, 100);
}

function _handleCheckAnswerSkill(event) {
    const answer = lastQuestionNAnswer.split('------')[1];
    setTimeout(() => {
        window.hooks.emit("hack_delay", `Wrint down the answer and explanations: {${answer}}. Just write the answer and explanations in between \`{}\` as is, don't change anything, don't speak anything else!`);
    }, 100);
}

export function init() {
    window.hooks.on('english_practice:handle_create_question_skill', _handleCreateQuestionSkill)
    window.hooks.on('english_practice:handle_check_answer_skill', _handleCheckAnswerSkill)
    window.components.AddComponentToScreen('chat-input', 'PromptSelector');
}