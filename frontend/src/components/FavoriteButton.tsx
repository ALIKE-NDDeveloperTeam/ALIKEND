import React from 'react';
import InteractiveWishlistButton, { InteractiveWishlistButtonProps } from './InteractiveWishlistButton';

export interface FavoriteButtonProps extends InteractiveWishlistButtonProps {}

export const FavoriteButton: React.FC<FavoriteButtonProps> = (props) => {
  return <InteractiveWishlistButton {...props} />;
};

export default FavoriteButton;
