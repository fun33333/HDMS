import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { SkeletonLoader } from '../ui/SkeletonLoader';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 min-h-screen bg-gray-50/50">
            {/* Header Card Skeleton */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardContent className="p-4 md:p-6 lg:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                            <SkeletonLoader type="text" width={250} height={32} />
                            <SkeletonLoader type="text" width={150} height={20} />
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100">
                            <SkeletonLoader type="circle" width={24} height={24} />
                            <SkeletonLoader type="text" width={120} height={20} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Cards Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="h-full bg-white shadow-sm border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <SkeletonLoader type="text" width={80} height={16} />
                                <SkeletonLoader type="circle" width={20} height={20} />
                            </div>
                            <SkeletonLoader type="text" width={60} height={32} className="mb-2" />
                            <SkeletonLoader type="text" width={100} height={12} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* System-Wide Analytics Skeleton */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <SkeletonLoader type="text" width={200} height={24} />
                        <div className="flex gap-2">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonLoader key={i} type="rect" width={80} height={32} className="rounded-lg" />
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
                        <div className="space-y-4">
                            <SkeletonLoader type="text" width={150} height={20} />
                            <SkeletonLoader type="rect" width="100%" height={250} className="rounded-xl" />
                        </div>
                        <div className="space-y-4">
                            <SkeletonLoader type="text" width={150} height={20} />
                            <SkeletonLoader type="rect" width="100%" height={250} className="rounded-xl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-white rounded-2xl shadow-sm border-0">
                    <CardContent className="p-6">
                        <SkeletonLoader type="text" width={180} height={24} className="mb-6" />
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <SkeletonLoader type="circle" width={32} height={32} />
                                        <div className="space-y-1">
                                            <SkeletonLoader type="text" width={120} height={14} />
                                            <SkeletonLoader type="text" width={80} height={12} />
                                        </div>
                                    </div>
                                    <SkeletonLoader type="text" width={60} height={24} className="rounded" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white rounded-2xl shadow-sm border-0">
                    <CardContent className="p-6">
                        <SkeletonLoader type="text" width={140} height={24} className="mb-6" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonLoader key={i} type="rect" width="100%" height={60} className="rounded-xl" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
