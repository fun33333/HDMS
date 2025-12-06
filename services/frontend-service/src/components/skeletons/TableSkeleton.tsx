import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { SkeletonLoader } from '../ui/SkeletonLoader';

export const TableSkeleton: React.FC = () => {
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 min-h-screen bg-gray-50/50">

            {/* Header Skeleton */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardContent className="p-4 md:p-6 lg:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                            <SkeletonLoader type="text" width={200} height={32} />
                            <SkeletonLoader type="text" width={300} height={16} />
                        </div>
                        <SkeletonLoader type="rect" width={150} height={40} className="rounded-lg" />
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                    <SkeletonLoader key={i} type="rect" width="100%" height={100} className="rounded-xl" />
                ))}
            </div>

            {/* Toolbar Skeleton */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <SkeletonLoader type="rect" width="100%" height={40} className="rounded-xl md:w-1/3" />
                        <div className="flex gap-2">
                            <SkeletonLoader type="rect" width={100} height={40} className="rounded-xl" />
                            <SkeletonLoader type="rect" width={120} height={40} className="rounded-xl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table Skeleton */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4 border-b border-gray-100">
                    <SkeletonLoader type="text" width={100} height={24} />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 md:p-6 space-y-4">
                        {/* Table Header */}
                        <div className="flex gap-4 pb-4 border-b border-gray-100">
                            {[...Array(6)].map((_, i) => (
                                <SkeletonLoader key={i} type="text" width={`${80 + Math.random() * 40}px`} height={16} />
                            ))}
                        </div>
                        {/* Table Rows */}
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex gap-4 items-center py-3 border-b last:border-0 border-gray-50">
                                <SkeletonLoader type="circle" width={32} height={32} />
                                <div className="flex-1 grid grid-cols-5 gap-4">
                                    <SkeletonLoader type="text" width="90%" height={16} />
                                    <SkeletonLoader type="text" width="70%" height={16} />
                                    <SkeletonLoader type="rect" width={60} height={24} className="rounded-full" />
                                    <SkeletonLoader type="text" width="60%" height={16} />
                                    <SkeletonLoader type="rect" width={80} height={28} className="rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
