import React from 'react';
import { InteractiveWishlistButton, InteractiveWishlistButtonProps } from './InteractiveWishlistButton';

export interface WishlistButtonProps extends InteractiveWishlistButtonProps {}

export const WishlistButton: React.FC<WishlistButtonProps> = (props) => {
  return <InteractiveWishlistButton {...props} />;
};

export default WishlistButton;
