import { ButtonHTMLAttributes, CSSProperties } from 'react';

interface GoogleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ onClick, className, children }) => {
  const buttonStyle: CSSProperties = {
    fontFamily: 'Roboto, sans-serif'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 ${className}`}
      style={buttonStyle}
    >
      {/* Google Icon */}
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        {/* ...icon path... */}
      </svg>
      {children || "Sign in with Google"}
    </button>
  );
};
