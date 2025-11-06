import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactInfoSectionProps {
    phone: string;
    email: string;
    website: string;
    onPhoneChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onWebsiteChange: (value: string) => void;
}

export function ContactInfoSection({
    phone,
    email,
    website,
    onPhoneChange,
    onEmailChange,
    onWebsiteChange,
}: ContactInfoSectionProps) {
    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="org-phone">Телефон</Label>
                    <Input
                        id="org-phone"
                        value={phone ?? ''}
                        onChange={(e) => onPhoneChange(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="org-email">Email</Label>
                    <Input
                        id="org-email"
                        type="email"
                        value={email ?? ''}
                        onChange={(e) => onEmailChange(e.target.value)}
                    />
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="org-website">Веб-сайт</Label>
                    <Input
                        id="org-website"
                        value={website ?? ''}
                        onChange={(e) => onWebsiteChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

