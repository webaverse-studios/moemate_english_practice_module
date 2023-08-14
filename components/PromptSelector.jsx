const React = window.react;
const Icon = window.Icon;
const classnames = window.classnames;
const styles = window.styles.ChatInput;

const { useState, useEffect } = React;

export const PromptSelector = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sendPrompt = () => {
    // window.onChat({ type: 'text', value: `Make an intermediate-level English grammar single choice question. Don't show me the answer immediately.` });
    // window.onChat({ type: 'text', value: `Make an intermediate-level English grammar single choice question. Just write the question as is, don't change anything, don't speak anything else!` });
    window.onChat({ type: 'text', value: `Make an intermediate-level English grammar single choice question. Just write the question, don't speak anything else.` });
    // window.onChat({ type: 'text', value: `Explain why the answer is correct or not.` });
    // window.onChat({ type: 'text', value: `Explain why.` });
  }

  return (
    <button onClick={sendPrompt} className={classnames(styles.chatButton, isOpen && styles.active)}>
      <Icon icon={"ai"} iconClass={classnames(styles.icon)} />
    </button>
  )
}