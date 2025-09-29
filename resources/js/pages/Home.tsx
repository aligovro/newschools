import Footer from '@/components/Footer';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import OrganizationsSection from '@/components/OrganizationsSection';
import ProjectsSection from '@/components/ProjectsSection';
import StatsSection from '@/components/StatsSection';
import SubscribeSection from '@/components/SubscribeSection';
import TopRegionsSection from '@/components/TopRegionsSection';
import SliderDisplay from '@/components/sliders/SliderDisplay';
import { Head } from '@inertiajs/react';

interface StatsData {
    totalUsers: number;
    totalOrganizations: number;
    totalDonations: number;
    totalProjects: number;
}

interface Organization {
    id: number;
    name: string;
    description: string;
    address: string;
    image?: string;
    projects_count: number;
    donations_total: number;
    donations_collected: number;
}

interface Region {
    name: string;
    total_amount: number;
    organizations_count: number;
}

interface Project {
    id: number;
    title: string;
    description: string;
    target_amount: number;
    collected_amount: number;
    progress_percentage: number;
    organization_name: string;
    organization_address: string;
    image?: string;
}

interface Terminology {
    site_name: string;
    site_description: string;
    org_plural: string;
    org_genitive: string;
    support_action: string;
}

interface MainSiteSettings {
    id: number;
    site_name: string;
    site_description: string;
    site_logo: string | null;
    site_favicon: string | null;
    site_theme: string;
    primary_color: string;
    secondary_color: string;
    dark_mode: boolean;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    og_type: string;
    twitter_card: string;
    twitter_title: string | null;
    twitter_description: string | null;
    twitter_image: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    contact_address: string | null;
    contact_telegram: string | null;
    contact_vk: string | null;
    social_links: any;
    google_analytics_id: string | null;
    yandex_metrika_id: string | null;
    custom_head_code: string | null;
    custom_body_code: string | null;
    payment_settings: any;
    notification_settings: any;
    integration_settings: any;
    metadata: any;
    created_at: string;
    updated_at: string;
}

interface SeoData {
    title: string;
    description: string;
    keywords: string;
    og_title: string;
    og_description: string;
    og_type: string;
    og_image: string;
    twitter_card: string;
    twitter_title: string;
    twitter_description: string;
    twitter_image: string;
}

interface Slider {
    id: number;
    name: string;
    type: string;
    position: string;
    settings: any;
    slides: any[];
}

interface HomeProps {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
    stats: StatsData;
    popularOrganizations: Organization[];
    topRegions: Region[];
    activeProjects: Project[];
    seo: SeoData;
    mainSiteSettings: MainSiteSettings;
    terminology: Terminology;
    heroSliders?: Slider[];
    contentSliders?: Slider[];
}

export default function Home({
    auth,
    stats,
    popularOrganizations,
    topRegions,
    activeProjects,
    seo,
    mainSiteSettings,
    terminology,
    heroSliders = [],
    contentSliders = [],
}: HomeProps) {
    return (
        <>
            <Head>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
                <meta name="keywords" content={seo.keywords} />
                <meta property="og:title" content={seo.og_title} />
                <meta property="og:description" content={seo.og_description} />
                <meta property="og:type" content={seo.og_type} />
                <meta property="og:image" content={seo.og_image} />
                <meta
                    property="og:url"
                    content={
                        typeof window !== 'undefined'
                            ? window.location.href
                            : ''
                    }
                />
                <meta name="twitter:card" content={seo.twitter_card} />
                <meta name="twitter:title" content={seo.twitter_title} />
                <meta
                    name="twitter:description"
                    content={seo.twitter_description}
                />
                <meta name="twitter:image" content={seo.twitter_image} />
                <link
                    rel="canonical"
                    href={
                        typeof window !== 'undefined'
                            ? window.location.href
                            : ''
                    }
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name:
                            terminology.site_name || 'Платформа поддержки школ',
                        description: seo.description,
                        url:
                            typeof window !== 'undefined'
                                ? window.location.href
                                : '',
                        potentialAction: {
                            '@type': 'SearchAction',
                            target: {
                                '@type': 'EntryPoint',
                                urlTemplate:
                                    typeof window !== 'undefined'
                                        ? `${window.location.origin}/search?q={search_term_string}`
                                        : '',
                            },
                            'query-input': 'required name=search_term_string',
                        },
                    })}
                </script>
            </Head>

            <div className="min-h-screen bg-white">
                <Header
                    auth={auth}
                    mainSiteSettings={mainSiteSettings}
                    terminology={terminology}
                />

                <main>
                    {/* Главные слайдеры */}
                    {heroSliders.length > 0 && (
                        <SliderDisplay sliders={heroSliders} position="hero" />
                    )}

                    {/* Если нет слайдеров, показываем стандартную Hero секцию */}
                    {heroSliders.length === 0 && (
                        <HeroSection terminology={terminology} />
                    )}

                    <StatsSection stats={stats} />

                    <OrganizationsSection
                        organizations={popularOrganizations}
                        terminology={terminology}
                    />

                    <TopRegionsSection regions={topRegions} />

                    <ProjectsSection projects={activeProjects} />

                    {/* Контентные слайдеры */}
                    {contentSliders.length > 0 && (
                        <SliderDisplay
                            sliders={contentSliders}
                            position="content"
                        />
                    )}

                    <SubscribeSection />
                </main>

                <Footer />
            </div>
        </>
    );
}
