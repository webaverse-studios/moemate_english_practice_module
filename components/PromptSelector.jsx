const React = window.react;
const Icon = window.Icon;
const classnames = window.classnames;
const { useState, useEffect } = React;

export const PromptSelector = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button className={classnames(window.styles?.ChatInput?.chatButton, isOpen && window.styles?.ChatInput?.active)}>
      <Icon icon={"ai"} iconClass={classnames(window.styles?.ChatInput?.icon)} />
    </button>
  )
}