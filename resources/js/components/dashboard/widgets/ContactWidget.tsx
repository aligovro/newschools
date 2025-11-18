import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import React, { useState } from 'react';

interface ContactInfo {
    address?: string;
    phone?: string;
    email?: string;
    workingHours?: string;
    website?: string;
}

interface ContactWidgetProps {
    title?: string;
    contactInfo: ContactInfo;
    showForm?: boolean;
    showMap?: boolean;
    className?: string;
}

export const ContactWidget: React.FC<ContactWidgetProps> = ({
    title = 'Контакты',
    contactInfo,
    showForm = true,
    showMap = false,
    className,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Здесь будет логика отправки формы
        console.log('Form submitted:', formData);
    };

    return (
        <section className={cn('py-8', className)}>
            <div className="container mx-auto">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
                    {title}
                </h2>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Контактная информация */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Контактная информация</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {contactInfo.address && (
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="mt-1 h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Адрес
                                            </p>
                                            <p className="text-gray-600">
                                                {contactInfo.address}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {contactInfo.phone && (
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Телефон
                                            </p>
                                            <a
                                                href={`tel:${contactInfo.phone}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {contactInfo.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {contactInfo.email && (
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Email
                                            </p>
                                            <a
                                                href={`mailto:${contactInfo.email}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {contactInfo.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {contactInfo.workingHours && (
                                    <div className="flex items-center space-x-3">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Часы работы
                                            </p>
                                            <p className="text-gray-600">
                                                {contactInfo.workingHours}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {contactInfo.website && (
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Веб-сайт
                                            </p>
                                            <a
                                                href={contactInfo.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {contactInfo.website}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {showMap && contactInfo.address && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Карта</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-200">
                                        <p className="text-gray-500">
                                            Карта будет здесь
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Форма обратной связи */}
                    {showForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Написать нам</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name">Имя *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">
                                                Email *
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="phone">
                                                Телефон
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="subject">
                                                Тема
                                            </Label>
                                            <Input
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="message">
                                            Сообщение *
                                        </Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full">
                                        <Send className="mr-2 h-4 w-4" />
                                        Отправить сообщение
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </section>
    );
};
