import OrganizationSearch from '@/components/main-site/OrganizationSearch';
import { WidgetOutputProps } from './types';

export function OrganizationSearchOutput({ widget }: WidgetOutputProps) {
    const config = widget.config as
        | {
              placeholder?: string;
              resultsLimit?: number;
              showCitySelector?: boolean;
              emptyMessage?: string;
          }
        | undefined;

    return <OrganizationSearch config={config} />;
}
