const React = window.react;
const ReactDOM = window.ReactDOM;
const Icon = window.Icon;
const classnames = window.classnames;
const styles = window.styles.ChatInput;

const { useState, useEffect } = React;
const { createPortal } = ReactDOM;

export const PromptSelector = ({onChat, value, setValue}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState('intermediate');
  const [type, setType] = useState('single-choice');
  const [point, setPoint] = useState('tenses');

  const domActions = document.querySelector('.'+styles.actions)

  const togglePopup = () => {
    setIsOpen(!isOpen);
  }

  const sendPrompt = async () => {
    // onChat({ type: 'text', value: `Make an intermediate-level English grammar single-choice question. Don't show me the answer immediately.` });
    // onChat({ type: 'text', value: `Make an intermediate-level English grammar single-choice question. Just write the question as is, don't change anything, don't speak anything else!` });
    // onChat({ type: 'text', value: `Make an ${level}-level English grammar ${type} question. Just write the question, don't speak anything else.` });
    // onChat({ type: 'text', value: `Make an intermediate-level English Fill-In-The-Blank question. Just write the question, don't speak anything else.` });
    // onChat({ type: 'text', value: `Explain why the answer is correct or not.` });
    // onChat({ type: 'text', value: `Explain why.` });
    
    window.hooks.emitSync("character:reset");
    window.hooks.emitSync("character:processing");
    const name = window.companion.GetCharacterAttribute('name');
    await window.hooks.emit('english_practice:handle_create_question_skill', {name, point});
    window.hooks.emitSync("character:standby");
  }

  const sendExplainWhy = () => {
    onChat({ type: 'text', value: `Explain why.` });
  }

  const revealAnswer = () => {
    onChat({ type: 'text', value: `Reveal the answer and explain why.` });
  }

  const sendAnswer = () => {
    if (value === '') return;
    onChat({ type: 'text', value: `My answer is: ${value}\nCheck if my answer is correct and explain why.` });
    setValue('');
  }

  return (
    <>
      {isOpen &&
        <div className={styles.emojiPickerWrap} style={{color:'white'}}>
          
          {/* <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
            }}
          >
            <option key={"elementary"} value={"elementary"}>elementary</option>
            <option key={"intermediate"} value={"intermediate"}>intermediate</option>
            <option key={"advanced"} value={"advanced"}>advanced</option>
          </select> */}

          {/* <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
            }}
          >
            <option key={"single-choice"} value={"single-choice"}>single-choice</option>
            <option key={"multiple-choice"} value={"multiple-choice"}>multiple-choice</option>
            <option key={"fill-in-blank"} value={"fill-in-blank"}>fill-in-blank</option>
          </select> */}

          <select
            value={point}
            onChange={(e) => {
              setPoint(e.target.value);
            }}
          >
            <option key={"any"} value={"any"}>any</option>
            <option key={"tenses"} value={"tenses"}>tenses</option>
            <option key={"preposition"} value={"preposition"}>preposition</option>
          </select>

          <button onClick={sendPrompt}>Send</button>

          {/* <button onClick={sendExplainWhy}>Explain why</button>

          <button onClick={revealAnswer}>Reveal answer</button>

          <button onClick={sendAnswer}>Send answer</button> */}

        </div>
      }
      {domActions && createPortal(
        <button onClick={togglePopup} className={classnames(styles.chatButton, isOpen && styles.active)}>
          <Icon icon={"ai"} iconClass={classnames(styles.icon)} />
        </button>,
        domActions
      )}
    </>

  )
}