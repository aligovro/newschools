import AddoOganizationBlock from '@/components/main-site/AddOganizationBlock';
import { WidgetOutputProps } from './types';

export function AddOrganizationBlockOutput({ widget }: WidgetOutputProps) {
    const config = widget.config as
        | {
              title?: string;
              show_title?: boolean;
              subtitle?: string;
              description?: string;
              submitButtonText?: string;
              successMessage?: string;
              errorMessage?: string;
          }
        | undefined;

    return (
        <AddoOganizationBlock config={config} useSimpleCityInput={true} />
    );
}

