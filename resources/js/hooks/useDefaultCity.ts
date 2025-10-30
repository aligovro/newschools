import { getMapsConfigCached } from '@/lib/api/public';
import { useEffect, useState } from 'react';

interface DefaultCity {
    id?: number;
    name: string;
    loaded: boolean;
}

export function useDefaultCity(): DefaultCity {
    const [state, setState] = useState<DefaultCity>({
        id: undefined,
        name: 'Казань',
        loaded: false,
    });

    useEffect(() => {
        let mounted = true;
        getMapsConfigCached()
            .then((cfg) => {
                if (!mounted) return;
                setState({
                    id: cfg?.defaultCityId || undefined,
                    name: cfg?.defaultCityFallback || 'Казань',
                    loaded: true,
                });
            })
            .catch(() => {
                if (!mounted) return;
                setState({ id: undefined, name: 'Казань', loaded: true });
            });
        return () => {
            mounted = false;
        };
    }, []);

    return state;
}
