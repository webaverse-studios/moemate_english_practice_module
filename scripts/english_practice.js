
import { questions } from './question_bank.js';

let originalQuestionObj = {};
let questionObj = {};
let explainedQuestionObj = {};
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
    "Environment",
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
### Background: I'm interested in ${interestTags[Math.floor(Math.random() * interestTags.length)]}, I want to improve my English grammar.
### You are now role-playing as a senior English teacher, create an English GRAMMAR ${pointAndSpace}multiple-choice fill-in-the-blank question. (Provide enough information in the question, to prevent ambiguous choices. Only one choice is correct, all other choices are wrong. Don't create same choices.).
Reveal whether each choice is correct or wrong, and explain why they are correct or wrong.
Reply in JSON format for easy parsing.
Add '------' around the JSON.
Then explain why you chose this question.
Use "wrong" instead of "incorrect" all the time.

### Example:
Here is an English grammar verb tense multiple choice fill-in-the-blank question:
------
{
    "question": "...",
    "choices": [
        {"letter": "A", "correct": true, text: "...", "explain": "is correct because ..."},
        {"letter": "B", "correct": false, text: "...", "explain": "is wrong because ..."},
        {"letter": "C", "correct": false, text: "...", "explain": "is wrong because ..."},
        {"letter": "D", "correct": false, text: "...", "explain": "is wrong because ..."},
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
    explainedQuestionObj = JSON.parse(responseArray[1])
    console.log('------ explainedQuestionObj:', explainedQuestionObj)

    // const hereIsAQuestion = responseArray[0].trim();
    // if (hereIsAQuestion) window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: hereIsAQuestion });
    // lastQuestionText = '';
    const questionText = explainedQuestionObj.question
    // lastQuestionText += questionText;
    window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: questionText });
    explainedQuestionObj.choices.forEach((choice, i) => {
        // const choiceText = `${indexToLetter(i)}) ${choice.text}`;
        const choiceText = `${choice.letter}) ${choice.text}`;
        // lastQuestionText += '\n' + choiceText;
        window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: choiceText });
    })

    window.models.DestroyModel(model);
    const isStop = true;
    return isStop;
}


async function _handleSelectQuestionSkill(event) {
    // debugger

    window.companion.SendMessage({ type: "SELECT_QUESTION", user: event.name, value: 'Selecting English practice question.', timestamp: Date.now(), alt: 'alt' });

    let pointAndSpace = '';
    if (event.point) {
        pointAndSpace = event.point === 'any' ? '' : (event.point + ' ');
    } else {
        pointAndSpace = 'tenses';
    }

    // randomly choose a question from questions
    originalQuestionObj = questions[Math.floor(Math.random() * questions.length)];
    questionObj = {
        question: originalQuestionObj.question,
        choices: originalQuestionObj.choices,
    }

    const context = {

        //         messages: `\n\nHuman:
        // You are now role-playing as a senior English teacher.
        // Here is an English grammar multiple choice question in JSON format:
        // {
        //     "question": "A prepositional phrase consists of a preposition and its",
        //     "choices": [
        //         {"letter": "A", "correct": true, text: "object", "explain": "A) is correct because ..."},
        //         {"letter": "B", "correct": false, text: "subject", "explain": "B) is wrong because ..."}
        //     ],
        //     "examples": [
        //         "...",
        //         "...",
        //         "..."
        //     ]

        // }
        // Explain why they are correct or wrong, and fill in the "explain" property.
        // Create some examples sentence demostrating the correct answer, and fill in the "examples" property.
        // Reply also in this JSON format.
        // Add '------' around the JSON.
        // Use "wrong" instead of "incorrect" all the time.

        // Assistant:`

        messages: `\n\nHuman:
You are now role-playing as a senior English teacher.
Here is an English grammar multiple choice question in JSON format:
${JSON.stringify(questionObj, null, 2)}
Explain why each choice is correct or wrong, by completing the sentence "is correct because ..." or "is wrong because ...", create and fill in the "explain" property in each choice.
Create and fill in the "letter" property in each choice, such as "A", "B", "C", etc.
Check whether need to add an example sentence to help me understand the question, and if so, create an example sentence to demonstrate the correct answer, add a sentence to highlight the words associated with the correct answer, create and fill in the "example" property in the root JSON object.
Reply also in this JSON format, ensure the JSON format is correct.
Add '------' around the JSON.
Use "wrong" instead of "incorrect" all the time.

Assistant:`
// ${originalQuestionObj.needExample ? `Create an example sentence demostrating the correct answer, create and fill in the "example" property in the root JSON object.` : ''}

    }

    /*
    {
        "question": "A prepositional phrase consists of a preposition and its",
        "choices": [
            {
            "correct": true, 
            "text": "object",
            "explain": "is correct because a prepositional phrase consists of a preposition followed by its object."
            },
            {
            "correct": false,
            "text": "subject", 
            "explain": "is wrong because a prepositional phrase does not contain a subject, only a preposition and its object."
            }
        ],
        "example": "In the example 'under the bridge', 'under' is the preposition and 'the bridge' is its object."
    }
    */

    console.log('------ _handleCreateQuestionSkill prompt before await:', context.messages)
    const model = window.models.CreateModel('english_practice:check_answer')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    console.log('------ _handleCreateQuestionSkill prompt:', context.messages)
    console.log('------ _handleCreateQuestionSkill response:', response.completion)
    const responseArray = response.completion.split('------');
    explainedQuestionObj = JSON.parse(responseArray[1])
    console.log('------ explainedQuestionObj:', explainedQuestionObj)

    // const hereIsAQuestion = responseArray[0].trim();
    // if (hereIsAQuestion) window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: hereIsAQuestion });
    // lastQuestionText = '';
    const questionText = explainedQuestionObj.question
    // lastQuestionText += questionText;
    window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: questionText });
    explainedQuestionObj.choices.forEach((choice, i) => {
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

    const correctChoice = explainedQuestionObj.choices.find(choice => choice.correct);
    const correctChoiceIndex = explainedQuestionObj.choices.findIndex(choice => choice.correct);
    const correctChoiceLetter = indexToLetter(correctChoiceIndex);

    const userAnswer = event.messages.slice(-1)[0].value.substring(1);

    const needAiCheckAnswer = false;
    if (needAiCheckAnswer) {
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
        window.companion.SendMessage({ type: "CHECK_ANSWER", user: event.name, value: `Your answer is ${response.completion.trim()}.`, timestamp: Date.now(), alt: 'alt' });
    } else {
        const isCorrect = userAnswer.trim().toLowerCase() === correctChoiceLetter.trim().toLowerCase();
        window.companion.SendMessage({ type: "CHECK_ANSWER", user: event.name, value: `Your answer is ${isCorrect ? 'correct' : 'wrong'}.`, timestamp: Date.now(), alt: 'alt' });
    }
    // return;

    // const correctText = `The correct answer is ${correctChoiceLetter}) because ${firstLetterToLower(correctChoice.explain)}`;
    const correctText = `${correctChoiceLetter}) ${correctChoice.explain}`;
    // const correctText = correctChoice.explain;
    window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: correctText });
    explainedQuestionObj.choices.forEach((choice, i) => {
        if (!choice.correct) {
            const wrongChoice = choice
            const wrongChoiceIndex = i;
            const wrongChoiceLetter = indexToLetter(wrongChoiceIndex);
            // const wrongText = `${wrongChoiceLetter}) is wrong because ${firstLetterToLower(wrongChoice.explain)}`;
            const wrongText = `${wrongChoiceLetter}) ${wrongChoice.explain}`;
            // const wrongText = wrongChoice.explain;
            window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: wrongText });
        }
    })
    // if (originalQuestionObj.needExample) {
    if (explainedQuestionObj.example) {
        const exampleText = `Example: ${explainedQuestionObj.example}`;
        window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: exampleText });
    }

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
    window.hooks.on('english_practice:handle_select_question_skill', _handleSelectQuestionSkill)
    window.hooks.on('english_practice:handle_check_answer_skill', _handleCheckAnswerSkill)
    window.components.AddComponentToScreen('chat-input', 'PromptSelector');
}