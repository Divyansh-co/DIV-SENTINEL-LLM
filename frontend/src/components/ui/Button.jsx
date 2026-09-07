import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'right',
  onClick,
  type = 'button',
  disabled = false,
  ariaLabel,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ember-500 focus:ring-offset-2 focus:ring-offset-[#08080A] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] select-none';

  const sizeStyles = {
    xs: 'text-[11px] px-2.5 py-1 gap-1 rounded-lg',
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-xl',
    md: 'text-sm px-4.5 py-2.5 gap-2 rounded-xl',
    lg: 'text-base px-6 py-3 gap-2.5 rounded-xl font-semibold',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-ember-600 via-ember-500 to-ember-600 hover:from-ember-500 hover:to-ember-400 text-white shadow-lg shadow-ember-600/30 hover:shadow-ember-600/50 border border-ember-400/50 font-bold',
    secondary: 'bg-[#121215] hover:bg-[#1C1C20] text-pearl-100 hover:text-white border border-[#242429] hover:border-ember-500/40 shadow-sm',
    outline: 'border border-ember-500/50 text-ember-400 hover:text-ember-300 hover:bg-ember-500/10',
    ghost: 'text-pearl-300 hover:text-white hover:bg-ember-500/10',
    jade: 'bg-gradient-to-r from-[#2E8B7D] to-[#1E6F62] hover:from-jade-400 hover:to-teal-500 text-white shadow-lg border border-jade-400/30',
    danger: 'bg-ember-700 hover:bg-ember-600 text-white shadow-md border border-ember-500/30',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />}
    </button>
  );
}
