import React from 'react';
import Svg, {Path, Polygon} from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

export const ShoppingCartIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <Path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    <Path d="M20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </Svg>
);

export const MessagesIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

export const RightArrowIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill={color}
    {...props}
  >
    <Polygon points="160,115.4 180.7,96 352,256 180.7,416 160,396.7 310.5,256 " />
  </Svg>
);


export const ImagesIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <Path d="M19.235,1.75H4.765c-1.662,0-3.015,1.352-3.015,3.015v14.471c0,1.662,1.352,3.015,3.015,3.015h14.471c1.662,0,3.015-1.352,3.015-3.015V4.765C22.25,3.102,20.898,1.75,19.235,1.75z M21.044,19.235c0,0.997-0.811,1.809-1.809,1.809H4.765c-0.997,0-1.809-0.811-1.809-1.809v-2.181l4.866-5.407l6.573,5.975l3.635-3.029l3.015,2.512V19.235z M21.044,15.536l-3.015-2.512l-3.601,3L7.737,9.94l-4.781,5.312V4.765c0-0.997,0.811-1.809,1.809-1.809h14.471c0.997,0,1.809,0.811,1.809,1.809V15.536z" />
    <Path d="M16.221,10.794c1.662,0,3.015-1.352,3.015-3.015s-1.352-3.015-3.015-3.015c-1.662,0-3.015,1.352-3.015,3.015S14.558,10.794,16.221,10.794z M16.221,5.971c0.997,0,1.809,0.811,1.809,1.809s-0.811,1.809-1.809,1.809s-1.809-0.811-1.809-1.809S15.223,5.971,16.221,5.971z" />
  </Svg>
);
