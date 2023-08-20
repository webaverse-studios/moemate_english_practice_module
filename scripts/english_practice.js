
import { questions } from './question_bank.js';

let lastExplainedQuestionObj = {};
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
    // debugger

    window.companion.SendMessage({ type: "CREATE_QUESTION", user: event.name, value: 'Creating English practice question.', timestamp: Date.now(), alt: 'alt' });

    let pointAndSpace = '';
    if (event.point) {
        pointAndSpace = event.point === 'any' ? '' : (event.point + ' ');
    } else {
        pointAndSpace = 'tenses';
    }

    // randomly choose a question from questions
    const originalQuestionObj = questions[Math.floor(Math.random() * questions.length)];
    const questionObj = {
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
Create "letter"s for each choice, such as "A", "B", "C", etc.
Create an example sentence demostrating the correct answer, create and fill in the "example" property in the root JSON object.
Reply also in this JSON format.
Add '------' around the JSON.
Use "wrong" instead of "incorrect" all the time.

Assistant:`

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
    lastExplainedQuestionObj = JSON.parse(responseArray[1])
    console.log('------ lastExplainedQuestionObj:', lastExplainedQuestionObj)

    // const hereIsAQuestion = responseArray[0].trim();
    // if (hereIsAQuestion) window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: hereIsAQuestion });
    // lastQuestionText = '';
    const questionText = lastExplainedQuestionObj.question
    // lastQuestionText += questionText;
    window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: questionText });
    lastExplainedQuestionObj.choices.forEach((choice, i) => {
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

    const correctChoice = lastExplainedQuestionObj.choices.find(choice => choice.correct);
    const correctChoiceIndex = lastExplainedQuestionObj.choices.findIndex(choice => choice.correct);
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
    window.companion.SendMessage({ type: "CHECK_ANSWER", user: event.name, value: `Your answer is ${response.completion.trim()}.`, timestamp: Date.now(), alt: 'alt' });
    // return;

    // const correctText = `The correct answer is ${correctChoiceLetter}) because ${firstLetterToLower(correctChoice.explain)}`;
    const correctText = `${correctChoiceLetter}) ${correctChoice.explain}`;
    // const correctText = correctChoice.explain;
    window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: correctText });
    lastExplainedQuestionObj.choices.forEach((choice, i) => {
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
    const exampleText = `Example: ${lastExplainedQuestionObj.example}`;
    window.hooks.emit('moemate_core:handle_skill_text', { name: event.name, value: exampleText });

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