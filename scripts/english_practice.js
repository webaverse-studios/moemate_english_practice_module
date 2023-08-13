
function _handleCreateQuestionSkill(event) {
    debugger
    // window.companion.SendMessage({ type: "TEXT", user: event.name, value: event.value, timestamp: Date.now(), alt: responseObj.description});
    // window.companion.SendMessage({ type: "TEXT", user: event.name, value: event.value, timestamp: Date.now(), alt: 'alt'});
    setTimeout(() => {
        window.hooks.emit("hack_delay", `You created this question ${event.value}, just write it as it, don't change anything, don't speak anything else!`);
    }, 100);
}

export function init() {
    window.hooks.on('english_practice:handle_create_question_skill', _handleCreateQuestionSkill)
}