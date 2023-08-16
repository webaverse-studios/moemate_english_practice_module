
let lastQuestionNAnswer = '';

async function _handleCreateQuestionSkill(event) {

    const context = {
        messages: '\n\nHuman:hello\n\nAssistant:',
        // messages: 'hello',
    }
    const model = window.models.CreateModel('english_practice:check_answer')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    debugger
    return;
    // const translatedText = response?.result?.trans_result[0]?.dst;
    // window.models.DestroyModel(model);
    // return translatedText;

    lastQuestionNAnswer = event.value;
    const question = lastQuestionNAnswer.split('------')[0];
    setTimeout(() => {
        window.hooks.emit("hack_delay", `You created this question {${question}}, don't answer the question, just write the question (keep the blank!) and choices as is, don't change anything, don't speak anything else!`);
    }, 100);
}

function _handleCheckAnswerSkill(event) {
    // debugger
    console.log('------  _handleCheckAnswerSkill(event):', event)
    window.companion.SendMessage({ type: "CHECK_ANSWER", user: event.name, value: event.value, timestamp: Date.now(), alt: 'alt'});
    const answer = lastQuestionNAnswer.split('------')[1];
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