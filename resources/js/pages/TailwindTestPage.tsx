import TailwindTest from '@/components/TailwindTest';
import { Head } from '@inertiajs/react';
import React from 'react';

const TailwindTestPage: React.FC = () => {
    return (
        <>
            <Head title="Tailwind CSS Test" />
            <TailwindTest />
        </>
    );
};

export default TailwindTestPage;
