import React from 'react';
import Svg, {Path, Polygon, Polyline, Rect} from 'react-native-svg';

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


export const RetryIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <Path
      fill={color}
      d="M14.9547098,7.98576084 L15.0711,7.99552 C15.6179,8.07328 15.9981,8.57957 15.9204,9.12636 C15.6826,10.7983 14.9218,12.3522 13.747,13.5654 C12.5721,14.7785 11.0435,15.5888 9.37999,15.8801 C7.7165,16.1714 6.00349,15.9288 4.48631,15.187 C3.77335,14.8385 3.12082,14.3881 2.5472,13.8537 L1.70711,14.6938 C1.07714,15.3238 3.55271368e-15,14.8776 3.55271368e-15,13.9867 L3.55271368e-15,9.99998 L3.98673,9.99998 C4.87763,9.99998 5.3238,11.0771 4.69383,11.7071 L3.9626,12.4383 C4.38006,12.8181 4.85153,13.1394 5.36475,13.3903 C6.50264,13.9466 7.78739,14.1285 9.03501,13.9101 C10.2826,13.6916 11.4291,13.0839 12.3102,12.174 C13.1914,11.2641 13.762,10.0988 13.9403,8.84476 C14.0181,8.29798 14.5244,7.91776 15.0711,7.99552 L14.9547098,7.98576084 Z M11.5137,0.812976 C12.2279,1.16215 12.8814,1.61349 13.4558,2.14905 L14.2929,1.31193 C14.9229,0.681961 16,1.12813 16,2.01904 L16,6.00001 L12.019,6.00001 C11.1281,6.00001 10.6819,4.92287 11.3119,4.29291 L12.0404,3.56441 C11.6222,3.18346 11.1497,2.86125 10.6353,2.60973 C9.49736,2.05342 8.21261,1.87146 6.96499,2.08994 C5.71737,2.30841 4.57089,2.91611 3.68976,3.82599 C2.80862,4.73586 2.23802,5.90125 2.05969,7.15524 C1.98193,7.70202 1.47564,8.08224 0.928858,8.00448 C0.382075,7.92672 0.00185585,7.42043 0.0796146,6.87364 C0.31739,5.20166 1.07818,3.64782 2.25303,2.43465 C3.42788,1.22148 4.95652,0.411217 6.62001,0.119916 C8.2835,-0.171384 9.99651,0.0712178 11.5137,0.812976 Z"
    />
  </Svg>
);

export const DustbinIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M7 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2h4a1 1 0 1 1 0 2h-1.069l-.867 12.142A2 2 0 0 1 17.069 22H6.93a2 2 0 0 1-1.995-1.858L4.07 8H3a1 1 0 0 1 0-2h4V4zm2 2h6V4H9v2zM6.074 8l.857 12H17.07l.857-12H6.074zM10 10a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1z"
      fill={color}
    />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HamburgerIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg
    fill={color}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    {...props}
  >
    <Path d="M2 3h12a1 1 0 0 1 0 2H2a1 1 0 1 1 0-2zm0 4h12a1 1 0 0 1 0 2H2a1 1 0 1 1 0-2zm0 4h12a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2z" />
  </Svg>
);


export const CheckIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M18.71,7.21a1,1,0,0,0-1.42,0L9.84,14.67,6.71,11.53A1,1,0,1,0,5.29,13l3.84,3.84a1,1,0,0,0,1.42,0l8.16-8.16A1,1,0,0,0,18.71,7.21Z"
      fill={color}
    />
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
  secondaryColor = 'rgb(44, 169, 188)',
  strokeWidth = 2,
  ...props
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Rect
      x={6}
      y={10}
      width={12}
      height={10}
      rx={2}
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M8 10V7a4 4 0 1 1 8 0v3"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M12 15a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 12 15zM12 17v-1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
  </Svg>
);

