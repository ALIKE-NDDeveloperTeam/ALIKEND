import React from 'react';
import { X, LucideIcon } from 'lucide-react';
import GlassIconButton, { GlassIconButtonProps } from './GlassIconButton';

export interface GlassCloseButtonProps extends Omit<GlassIconButtonProps, 'icon'> {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
}

/**
 * Premium unified glassmorphic close button with translucent frosted glass background,
 * subtle border, hover elevation/scale, and sharp X icon (or custom icon).
 */
export const GlassCloseButton: React.FC<GlassCloseButtonProps> = ({
  icon = X,
  'aria-label': ariaLabel = 'Close',
  title = 'Close',
  variant = 'default',
  ...rest
}) => {
  return (
    <GlassIconButton
      icon={icon}
      aria-label={ariaLabel}
      title={title}
      variant={variant}
      {...rest}
    />
  );
};

export default GlassCloseButton;
