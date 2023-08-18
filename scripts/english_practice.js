
let lastQuestion = '';

async function _handleCreateQuestionSkill(event) {

    let pointAndSpace = '';
    if (event.point) {
        pointAndSpace = event.point === 'any' ? '' : (event.point + ' ');
    } else {
        pointAndSpace = 'tenses';
    }

    const level = event.level ?? 'intermediate';

    const context = {

        messages: `\n\nHuman:
### Create an English grammar ${level}-level ${pointAndSpace}multiple choice fill-in-the-blank question (only one correct answer, other answers are wrong).
Reveal the correct answer after the question, explain why it is correct.
Explain why other choices are wrong.
Explain why you create this question.
Add '------' before the question.
Add '------' after the choices of the question, before revealing the answer and explaining.

Assistant:`
// Let AI also reveal the answer and explain, to let it create more correct questions. Later may can also use this answer to double check.
// Don't provide example to prevent AI almost always create questions start with something like "By the time ...".

    }
    console.log('------ _handleCreateQuestionSkill prompt before await:', context.messages)
    const model = window.models.CreateModel('english_practice:check_answer')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    console.log('------ _handleCreateQuestionSkill prompt:', context.messages)
    console.log('------ _handleCreateQuestionSkill response:', response)

    const question = response.completion.split('------')[1];
    lastQuestion = question;

    const lines = question.split('\n');
    lines.forEach(line => {
        if (line.trim() === '') return;
        window.hooks.emit('moemate_core:handle_skill_text', {name: event.name, value: line});
    })

    window.models.DestroyModel(model);
    const isStop = true;
    return isStop;
}

async function _handleCheckAnswerSkill(event) {
    // debugger
    console.log('------  _handleCheckAnswerSkill event:', event)
        
    const userAnswer = event.messages.slice(-1)[0].value.substring(1);
    // todo: use assistant's last message as question instead of lastQuestion variable.
    const context = {

        messages: `\n\nHuman:
### Here is an English grammar multiple choice fill-in-the-blank question:
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

export function init() {
    window.hooks.on('english_practice:handle_create_question_skill', _handleCreateQuestionSkill)
    window.hooks.on('english_practice:handle_check_answer_skill', _handleCheckAnswerSkill)
    window.components.AddComponentToScreen('chat-input', 'PromptSelector');
}