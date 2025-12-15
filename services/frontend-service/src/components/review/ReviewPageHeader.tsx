'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface ReviewPageHeaderProps {
    ticketId: string;
}

export const ReviewPageHeader: React.FC<ReviewPageHeaderProps> = ({ ticketId }) => {
    const router = useRouter();

    return (
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 md:px-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => router.back()}
                >
                    Back
                </Button>
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900">
                        Ticket {ticketId}
                    </h1>
                    <p className="text-sm text-gray-500">Review and take action</p>
                </div>
            </div>
        </div>
    );
};

export default ReviewPageHeader;
