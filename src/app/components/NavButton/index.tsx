import { ButtonHTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackwardStep, faForwardStep } from '@fortawesome/free-solid-svg-icons';

interface NavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "previous" | "next";
};

const NavButton: React.FC<NavButtonProps> = ({
  direction = "previous",
  ...props
}) => {
  const icon = direction === "previous" ? faBackwardStep : faForwardStep;
  const text = direction === "previous" ? "Previous" : "Next";

  return (
    <button
      className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-950 border border-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer hover:bg-gray-100 flex flex-row gap-2 items-center"
      {...props}
    >
      {text} <FontAwesomeIcon icon={icon} className="fa fa-fw" />
    </button>
  );
};

export default NavButton;