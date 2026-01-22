"use client";

import dynamic from "next/dynamic";

const AdminAnalytics = dynamic(
  () => import("@/components/admin/AdminAnalytics").then((mod) => mod.AdminAnalytics),
  { ssr: false }
);

interface AdminAnalyticsClientWrapperProps {
    userTrends: { created_at: string }[];
    businessTrends: { created_at: string }[];
    appointmentTrends: { created_at: string; status: string }[];
    revenueTrends: { created_at: string; services: { price: number } | { price: number }[] }[];
    subscriptionStats: { plan: string; status: string; created_at: string }[];
    notificationStats: { type: string; status: string; created_at: string }[];
}

export function AdminAnalyticsClientWrapper(props: AdminAnalyticsClientWrapperProps) {
    return <AdminAnalytics {...props} />;
}
