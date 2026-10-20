import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'ghost' | 'danger';

type ButtonSize = 'regular' | 'small';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Small buttons are as tall as a chip, for toolbars. */
  size?: ButtonSize;
}

export const Button = ({
  variant = 'ghost',
  size = 'regular',
  className,
  type = 'button',
  ...rest
}: ButtonProps) => {
  const sizeClass = size === 'small' ? styles.small : undefined;
  const classes = [styles.button, styles[variant], sizeClass, className].filter(Boolean).join(' ');

  return <button type={type} className={classes} {...rest} />;
};
