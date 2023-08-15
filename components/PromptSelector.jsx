const React = window.react;
const ReactDOM = window.ReactDOM;
const Icon = window.Icon;
const classnames = window.classnames;
const styles = window.styles.ChatInput;

const { useState, useEffect } = React;
const { createPortal } = ReactDOM;

export const PromptSelector = ({onChat}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState('intermediate');
  const [type, setType] = useState('single-choice');

  const domActions = document.querySelector('.'+styles.actions)

  const togglePopup = () => {
    setIsOpen(!isOpen);
  }

  const sendPrompt = () => {
    // onChat({ type: 'text', value: `Make an intermediate-level English grammar single-choice question. Don't show me the answer immediately.` });
    // onChat({ type: 'text', value: `Make an intermediate-level English grammar single-choice question. Just write the question as is, don't change anything, don't speak anything else!` });
    onChat({ type: 'text', value: `Make an ${level}-level English grammar ${type} question. Just write the question, don't speak anything else.` });
    // onChat({ type: 'text', value: `Make an intermediate-level English Fill-In-The-Blank question. Just write the question, don't speak anything else.` });
    // onChat({ type: 'text', value: `Explain why the answer is correct or not.` });
    // onChat({ type: 'text', value: `Explain why.` });
  }

  const sendExplainWhy = () => {
    onChat({ type: 'text', value: `Explain why.` });
  }

  const revealAnswer = () => {
    onChat({ type: 'text', value: `Reveal the answer and explain why.` });
  }

  return (
    <>
      {isOpen &&
        <div className={styles.emojiPickerWrap} style={{color:'white'}}>
          
          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
            }}
          >
            <option key={"elementary"} value={"elementary"}>elementary</option>
            <option key={"intermediate"} value={"intermediate"}>intermediate</option>
            <option key={"advanced"} value={"advanced"}>advanced</option>
          </select>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
            }}
          >
            <option key={"single-choice"} value={"single-choice"}>single-choice</option>
            <option key={"multiple-choice"} value={"multiple-choice"}>multiple-choice</option>
            <option key={"fill-in-blank"} value={"fill-in-blank"}>fill-in-blank</option>
          </select>

          <button onClick={sendPrompt}>Send</button>

          <button onClick={sendExplainWhy}>Explain why</button>

          <button onClick={revealAnswer}>Reveal answer</button>

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