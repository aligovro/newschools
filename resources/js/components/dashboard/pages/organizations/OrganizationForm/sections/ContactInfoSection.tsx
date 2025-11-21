import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RussianPhoneInput from '@/components/ui/RussianPhoneInput';

interface ContactInfoSectionProps {
    phone: string;
    email: string;
    website: string;
    onPhoneChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onWebsiteChange: (value: string) => void;
    errors?: {
        phone?: string;
        email?: string;
        website?: string;
    };
}

export function ContactInfoSection({
    phone,
    email,
    website,
    onPhoneChange,
    onEmailChange,
    onWebsiteChange,
    errors = {},
}: ContactInfoSectionProps) {
    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="org-phone">Телефон</Label>
                    <RussianPhoneInput
                        id="org-phone"
                        value={phone ?? ''}
                        onValueChange={onPhoneChange}
                        className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.phone}
                        </p>
                    )}
                </div>
                <div>
                    <Label htmlFor="org-email">Email</Label>
                    <Input
                        id="org-email"
                        type="email"
                        value={email ?? ''}
                        onChange={(e) => onEmailChange(e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.email}
                        </p>
                    )}
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="org-website">Веб-сайт</Label>
                    <Input
                        id="org-website"
                        value={website ?? ''}
                        onChange={(e) => onWebsiteChange(e.target.value)}
                        className={errors.website ? 'border-red-500' : ''}
                    />
                    {errors.website && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.website}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
