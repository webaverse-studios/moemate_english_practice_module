
let lastQuestionObj = {};
// let lastQuestionText = '';

function indexToLetter(index) {
    return String.fromCharCode(65 + index);
}

function firstLetterToLower(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

const interestTags = [ // increase the variety of questions
    "Anything", 
    "Foodie", 
    "Sports",
    "Travel",
    "Photography",
    "Hiking",
    "Yoga",
    "Art",
    "Music",
    "Gaming",
    "Fashion",
    "Beauty",
    "Health & Fitness",
    "Technology",
    "Business", 
    "Finance",
    "Home Decor",
    "Reading",
    "Cooking",
    "Pets",
    "Gardening",
    "Movies",
    "Crafts",
    "Blogging",
    "Cars",
    "Outdoors",
    "Parenting",
    "Volunteering",
    "Wine",
    "Environment"  
  ];

async function _handleCreateQuestionSkill(event) {

    window.companion.SendMessage({ type: "CREATE_QUESTION", user: event.name, value: 'Creating English practice question.', timestamp: Date.now(), alt: 'alt' });

    let pointAndSpace = '';
    if (event.point) {
        pointAndSpace = event.point === 'any' ? '' : (event.point + ' ');
    } else {
        pointAndSpace = 'tenses';
    }

    const context = {

        messages: `\n\nHuman:
### Background: I'm interested in ${interestTags[Math.floor(Math.random()*interestTags.length)]}.
### Create an English grammar ${pointAndSpace}multiple-choice fill-in-the-blank question. (Provide enough information in the question, to prevent ambiguous choices. Only one choice is correct, all other choices are wrong. Every choice has to be different.).
Reveal whether each choice is correct or wrong, and explain why they are correct or wrong.
Reply in JSON format for easy parsing.
Add '------' around the JSON.
Then explain why you chose this question.
Use "wrong" instead of "incorrect" all the time.

### Example:
Here is an English grammar verb tense multiple choice fill-in-the-blank question:
------
{
    "question": "Yesterday I _____ to the store when it started raining.",
    "choices": [
        {"letter": "A", "correct": true, text: "...", "explain": "The correct answer is A) because ..."},
        {"letter": "B", "correct": false, text: "...", "explain": "B) is wrong because ..."},
        {"letter": "C", "correct": false, text: "...", "explain": "C) is wrong because ..."},
        {"letter": "D", "correct": false, text: "...", "explain": "D) is wrong because ..."},
    ]

}
------
Why I chose this question.

Assistant:`

    }
    console.log('------ _handleCreateQuestionSkill prompt before await:', context.messages)
    const model = window.models.CreateModel('english_practice:check_answer')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    console.log('------ _handleCreateQuestionSkill prompt:', context.messages)
    console.log('------ _handleCreateQuestionSkill response:', response.completion)
    const responseArray = response.completion.split('------');
    lastQuestionObj = JSON.parse(responseArray[1])
    console.log('------ lastQuestionObj:', lastQuestionObj)

    // const hereIsAQuestion = responseArray[0].trim();
    // if (hereIsAQuestion) window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: hereIsAQuestion });
    // lastQuestionText = '';
    const questionText = lastQuestionObj.question
    // lastQuestionText += questionText;
    window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: questionText });
    lastQuestionObj.choices.forEach((choice, i) => {
        // const choiceText = `${indexToLetter(i)}) ${choice.text}`;
        const choiceText = `${choice.letter}) ${choice.text}`;
        // lastQuestionText += '\n' + choiceText;
        window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: choiceText });
    })

    window.models.DestroyModel(model);
    const isStop = true;
    return isStop;
}

async function _handleCheckAnswerSkill(event) {
    // debugger
    console.log('------  _handleCheckAnswerSkill event:', event)

    const correctChoice = lastQuestionObj.choices.find(choice => choice.correct);
    const correctChoiceIndex = lastQuestionObj.choices.findIndex(choice => choice.correct);
    const correctChoiceLetter = indexToLetter(correctChoiceIndex);

    const userAnswer = event.messages.slice(-1)[0].value.substring(1);
    const context = {
        messages: `\n\nHuman:
Here's my answer: ${userAnswer}.
The correct answer is: ${correctChoiceLetter}.
Check if my answer is correct or wrong, then reply and only reply "correct" or "wrong", don't reply anything else;

Assistant:`,
    }
    const model = window.models.CreateModel('english_practice:check_answer')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    console.log('------ _handleCheckAnswerSkill prompt:', context.messages)
    console.log('------  _handleCheckAnswerSkill response:', response.completion)
    window.companion.SendMessage({ type: "CHECK_ANSWER", user: event.name, value: 'Your answer is ' + response.completion.trim(), timestamp: Date.now(), alt: 'alt' });
    // return;

    // const correctText = `The correct answer is ${correctChoiceLetter}) because ${firstLetterToLower(correctChoice.explain)}`;
    const correctText = correctChoice.explain;
    window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: correctText });
    lastQuestionObj.choices.forEach((choice, i) => {
        if (!choice.correct) {
            const wrongChoice = choice
            const wrongChoiceIndex = i;
            const wrongChoiceLetter = indexToLetter(wrongChoiceIndex);
            // const wrongText = `${wrongChoiceLetter}) is wrong because ${firstLetterToLower(wrongChoice.explain)}`;
            const wrongText = wrongChoice.explain;
            window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: wrongText });
        }
    })

    // const lines = response.completion.split('\n');
    // lines.forEach(line => {
    //     if (line.trim() === '') return;
    //     window.hooks.emit('moemate_core:handle_skill_text', {name: event.name, value: line});
    // })

    window.models.DestroyModel(model);
    const isStop = true;
    return isStop;
}

export function init() {
    window.hooks.on('english_practice:handle_create_question_skill', _handleCreateQuestionSkill)
    window.hooks.on('english_practice:handle_check_answer_skill', _handleCheckAnswerSkill)
    window.components.AddComponentToScreen('chat-input', 'PromptSelector');
}