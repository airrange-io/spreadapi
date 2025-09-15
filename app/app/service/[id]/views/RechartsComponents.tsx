'use client';

import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Space, 
  Typography, 
  Empty,
  Tag
} from 'antd';
import {
  LineChartOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const { Text } = Typography;

interface RechartsComponentsProps {
  dailyChartData: Array<{ date: string; calls: number }>;
  hourlyChartData: Array<{ hour: string; calls: number }>;
  responseTimeDistribution?: Array<{ range: string; count: number }>;
  cacheBreakdown?: {
    process: number;
    redis: number;
    blob: number;
  };
  totalCalls: number;
}

const RechartsComponents: React.FC<RechartsComponentsProps> = ({
  dailyChartData,
  hourlyChartData,
  responseTimeDistribution,
  cacheBreakdown,
  totalCalls
}) => {
  // Colors matching your brand
  const PURPLE = '#4F2D7F';  // Primary color
  const GREEN = '#389E0E';
  const CACHE_COLORS = {
    process: GREEN,
    redis: '#2989FF',
    blob: '#faad14'
  };

  // Prepare pie chart data
  const pieData = cacheBreakdown ? [
    { name: 'Process Cache', value: cacheBreakdown.process, color: CACHE_COLORS.process },
    { name: 'Redis Cache', value: cacheBreakdown.redis, color: CACHE_COLORS.redis },
    { name: 'Blob Storage', value: cacheBreakdown.blob, color: CACHE_COLORS.blob }
  ] : [];

  return (
    <>
      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Daily Calls Chart */}
        <Col xs={24} lg={12}>
          <Card 
            size="small"
            title={
              <Space style={{ fontSize: '14px', fontWeight: 'normal', color: 'rgba(0, 0, 0, 0.45)' }}>
                <LineChartOutlined />
                <span>API Calls (Last 7 Days)</span>
              </Space>
            }
          >
            {dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="calls" 
                    stroke={PURPLE} 
                    strokeWidth={2}
                    dot={{ fill: PURPLE, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
            )}
          </Card>
        </Col>
        
        {/* Today's Hourly Distribution */}
        <Col xs={24} lg={12}>
          <Card 
            size="small"
            title={
              <Space style={{ fontSize: '14px', fontWeight: 'normal', color: 'rgba(0, 0, 0, 0.45)' }}>
                <ClockCircleOutlined />
                <span>Today's Hourly Distribution</span>
              </Space>
            }
          >
            {hourlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="calls" 
                    fill={PURPLE} 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data for today" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Additional Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Response Time Distribution */}
        <Col xs={24} lg={12}>
          <Card 
            size="small"
            title={
              <Space style={{ fontSize: '14px', fontWeight: 'normal', color: 'rgba(0, 0, 0, 0.45)' }}>
                <BarChartOutlined />
                <span>Response Time Distribution</span>
              </Space>
            }
          >
            {responseTimeDistribution && responseTimeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={responseTimeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="range" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    style={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} calls`} />
                  <Bar 
                    dataKey="count" 
                    fill={PURPLE} 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No distribution data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Cache Performance */}
      {cacheBreakdown && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24}>
            <Card 
              size="small"
              title={
                <Space style={{ fontSize: '14px', fontWeight: 'normal', color: 'rgba(0, 0, 0, 0.45)' }}>
                  <DatabaseOutlined />
                  <span>Cache Performance</span>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => 
                          `${name}: ${((value / totalCalls) * 100).toFixed(1)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>
                <Col xs={24} md={12}>
                  <Space direction="vertical" style={{ width: '100%', padding: '20px' }}>
                    <div>
                      <Text type="secondary">Process Cache: </Text>
                      <Text strong>
                        {((cacheBreakdown.process / totalCalls) * 100).toFixed(1)}%
                      </Text>
                      <Tag color={GREEN} style={{ marginLeft: 8 }}>Fastest</Tag>
                    </div>
                    <div>
                      <Text type="secondary">Redis Cache: </Text>
                      <Text strong>
                        {((cacheBreakdown.redis / totalCalls) * 100).toFixed(1)}%
                      </Text>
                      <Tag style={{ marginLeft: 8, backgroundColor: PURPLE, color: 'white' }}>Fast</Tag>
                    </div>
                    <div>
                      <Text type="secondary">Blob Storage: </Text>
                      <Text strong>
                        {((cacheBreakdown.blob / totalCalls) * 100).toFixed(1)}%
                      </Text>
                      <Tag color="orange" style={{ marginLeft: 8 }}>Slower</Tag>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Cache hit rate indicates how often requests are served from cache
                      </Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default RechartsComponents;