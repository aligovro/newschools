import SubscribeBlock from '@/components/main-site/SubscribeBlock';
import { WidgetOutputProps } from './types';

export function SubscribeBlockOutput({ widget }: WidgetOutputProps) {
    const config = widget.config as
        | {
              mainTitle?: string;
              subtitle?: string;
              backgroundGradient?: string;
              backgroundImage?: string;
              schoolsLimit?: number;
              columns?: number;
          }
        | undefined;

    return <SubscribeBlock config={config} />;
}
