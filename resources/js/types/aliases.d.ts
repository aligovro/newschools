// Типы для алиасов импортов
declare module '@/css/components/Button.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '@/css/custom.scss' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '@/components/*' {
    const component: React.ComponentType<Record<string, unknown>>;
    export default component;
}
