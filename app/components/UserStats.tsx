'use client';

import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Spin, Timeline } from 'antd';
import { ApiOutlined, KeyOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthContext';

interface UserStatsData {
  user: {
    id: string;
    email?: string;
    lastLogin?: string;
    createdAt?: string;
  };
  stats: {
    services: number;
    tokens: number;
  };
  recentActivity: Array<{
    action: string;
    timestamp: string;
  }>;
  cached: boolean;
}

export default function UserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/users/${user.id}/stats`);
        
        if (!response.ok) {
          // Handle 401 as expected - user not authenticated
          if (response.status === 401) {
            setStats(null);
            setError(null);
            return;
          }
          throw new Error('Failed to fetch user stats');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err: any) {
        // Only log unexpected errors (not 401/unauthorized)
        if (err?.status !== 401 && err?.code !== 'unauthorized') {
          console.error('Error fetching user stats:', err);
          setError(err instanceof Error ? err.message : 'Failed to load stats');
        } else {
          // For 401 errors, just fail silently
          setStats(null);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !stats) {
    return null; // Silently fail
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatActivity = (action: string) => {
    if (action.startsWith('created_service:')) {
      return `Created new service`;
    }
    switch (action) {
      case 'login':
        return 'Logged in';
      case 'viewed_services':
        return 'Viewed services';
      case 'session_check':
        return 'Session verified';
      default:
        return action;
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Services"
              value={stats.stats.services}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="API Tokens"
              value={stats.stats.tokens}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Last Login"
              value={formatDate(stats.user.lastLogin)}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: 14 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Account Type"
              value={stats.cached ? "Premium" : "Basic"}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {stats.recentActivity.length > 0 && (
        <Card title="Recent Activity" style={{ marginTop: 16 }}>
          <Timeline
            items={stats.recentActivity.map(activity => ({
              children: (
                <>
                  <p>{formatActivity(activity.action)}</p>
                  <p style={{ fontSize: 12, color: '#999' }}>
                    {formatDate(activity.timestamp)}
                  </p>
                </>
              )
            }))}
          />
        </Card>
      )}
    </div>
  );
}