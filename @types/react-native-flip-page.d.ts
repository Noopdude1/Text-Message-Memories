declare module 'react-native-flip-page' {
    import { ComponentType, ReactNode } from 'react';
    import { ViewProps } from 'react-native';

    export interface FlipPageProps extends ViewProps {
      loopForever?: boolean;
      orientation?: 'vertical' | 'horizontal';
      onFinish?: (orientation: 'vertical' | 'horizontal') => void;
      reverse?: boolean;
      onPageChange?: (pageIndex: number, direction: 'left' | 'right' | 'up' | 'down') => void;
    }

    export const FlipPage: ComponentType<FlipPageProps>;

    export interface FlipPagePageProps {
      children?: ReactNode;
    }

    export const FlipPagePage: ComponentType<FlipPagePageProps>;
  }

