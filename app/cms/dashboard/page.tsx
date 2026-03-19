'use client';

import { useState, useEffect } from 'react';
import CmsLayout from '@/components/cms/CmsLayout';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  TagIcon, 
  EyeIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BoltIcon,
  SunIcon,
  CloudIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';

interface DashboardStats {
  posts: number;
  files: number;
  categories: number;
  views: number;
  energyData: number;
  solarData: number;
  buildings: number;
}

export default function CmsDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    posts: 0,
    files: 0,
    categories: 0,
    views: 0,
    energyData: 0,
    solarData: 0,
    buildings: 0
  });
  const [loading, setLoading] = useState(true);

  // Sample data for charts
  const monthlyPostsData = [
    { month: '1월', posts: 12 },
    { month: '2월', posts: 19 },
    { month: '3월', posts: 15 },
    { month: '4월', posts: 25 },
    { month: '5월', posts: 22 },
    { month: '6월', posts: 30 },
  ];

  const categoryData = [
    { name: '공지사항', value: 35, color: '#3B82F6' },
    { name: '일반', value: 25, color: '#10B981' },
    { name: '자료', value: 20, color: '#F59E0B' },
    { name: '기타', value: 20, color: '#EF4444' },
  ];

  const viewsData = [
    { day: '월', views: 1200 },
    { day: '화', views: 1900 },
    { day: '수', views: 1600 },
    { day: '목', views: 2100 },
    { day: '금', views: 2400 },
    { day: '토', views: 1800 },
    { day: '일', views: 1500 },
  ];

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        // TODO: API 호출 구현
        // 현재는 샘플 데이터 사용
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        
        setStats({
          posts: 156,
          files: 423,
          categories: 12,
          views: 8432,
          energyData: 48,
          solarData: 24,
          buildings: 8
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      title: '전체 게시글', 
      value: stats.posts, 
      icon: DocumentTextIcon, 
      color: 'from-blue-500 to-indigo-600', 
      trend: '+12%', 
      trendUp: true 
    },
    { 
      title: '전체 파일', 
      value: stats.files, 
      icon: PhotoIcon, 
      color: 'from-green-500 to-emerald-600', 
      trend: '+8%', 
      trendUp: true 
    },
    { 
      title: '카테고리', 
      value: stats.categories, 
      icon: TagIcon, 
      color: 'from-yellow-500 to-orange-600', 
      trend: '0%', 
      trendUp: null 
    },
    { 
      title: '전체 조회수', 
      value: stats.views, 
      icon: EyeIcon, 
      color: 'from-purple-500 to-pink-600', 
      trend: '+24%', 
      trendUp: true 
    },
    { 
      title: '에너지 데이터', 
      value: stats.energyData, 
      icon: BoltIcon, 
      color: 'from-indigo-500 to-blue-600', 
      trend: '+5%', 
      trendUp: true 
    },
    { 
      title: '태양광 데이터', 
      value: stats.solarData, 
      icon: SunIcon, 
      color: 'from-orange-500 to-red-600', 
      trend: '+15%', 
      trendUp: true 
    },
    { 
      title: '관리 건물', 
      value: stats.buildings, 
      icon: BuildingOfficeIcon, 
      color: 'from-gray-500 to-slate-600', 
      trend: '+2', 
      trendUp: true 
    },
  ];

  if (loading) {
    return (
      <CmsLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-12 w-12 border-2 border-blue-400 opacity-20"></div>
          </div>
        </div>
      </CmsLayout>
    );
  }

  return (
    <CmsLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CMS 대시보드
          </h1>
          <p className="text-gray-600 mt-2">콘텐츠 관리 시스템 현황을 한눈에 확인하세요</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {formatNumber(card.value)}
                    </p>
                    {card.trendUp !== null && (
                      <div className={`flex items-center text-sm ${
                        card.trendUp ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {card.trendUp ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        <span>{card.trend}</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} transform group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Monthly Posts Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">월별 게시글 현황</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPostsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }} 
                />
                <Bar dataKey="posts" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">카테고리별 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Views Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">주간 조회수 현황</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px' 
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#8B5CF6" 
                strokeWidth={3} 
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </CmsLayout>
  );
} 