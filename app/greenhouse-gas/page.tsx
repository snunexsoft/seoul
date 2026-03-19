'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../../components/Header';

// 카운트업 애니메이션 컴포넌트
const CountUp = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(end * percentage));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const GreenhouseGas = () => {
  const [loading, setLoading] = useState(false); // 로딩 상태를 false로 설정
  const [selectedYear, setSelectedYear] = useState('2024');

  // 하드코딩된 데이터
  const yearlyData = {
    total: 143200,
    monthlyAverage: 11933,
    monthlyEmissions: [
      { month: '1월', emission: 15200 },
      { month: '2월', emission: 14100 },
      { month: '3월', emission: 11800 },
      { month: '4월', emission: 9800 },
      { month: '5월', emission: 9200 },
      { month: '6월', emission: 10800 },
      { month: '7월', emission: 12300 },
      { month: '8월', emission: 13200 },
      { month: '9월', emission: 12800 },
      { month: '10월', emission: 10100 },
      { month: '11월', emission: 11400 },
      { month: '12월', emission: 12600 }
    ]
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto w-full">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">온실가스 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto w-full">
      {/* CSS 스타일 */}
      <style jsx>{`
        @font-face {
          font-family: 'SUIT';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }

        @font-face {
          font-family: 'SUIT';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }
        
        body {
          font-family: 'SUIT', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 
          Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        
        .sub-title-section {
          background: linear-gradient(135deg, #FEF3E2 0%, #FCE7F3 100%);
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .gradient-circles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .gradient-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.7;
        }
        
        .gradient-circle-1 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #F87171 0%, #EF4444 50%, rgba(239, 68, 68, 0.3) 100%);
          top: -50px;
          left: 10%;
          animation: float1 8s ease-in-out infinite;
        }
        
        .gradient-circle-2 {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, #FB923C 0%, #F97316 50%, rgba(249, 115, 22, 0.3) 100%);
          top: 50px;
          right: 15%;
          animation: float2 10s ease-in-out infinite;
        }
        
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(0.9); }
        }
      `}</style>

      {/* Header */}
      <Header currentPage="greenhouse-gas" />

      {/* 서브 타이틀 섹션 */}
      <div className="sub-title-section">
        <div className="gradient-circles">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold text-[#EF4444] mb-6">
            온실가스 분석
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            서울대학교 관악캠퍼스의 온실가스 배출량 현황을 분석합니다
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        {/* 온실가스 배출량 */}
        <div className="max-w-[1600px] mx-auto px-6 mb-20">
          <div className="border-t-4 border-[#EF4444] rounded-xl p-12 bg-transparent">
            <h3 className="text-[#EF4444] text-3xl font-semibold mb-4 text-center">
              온실가스 배출량 (CO₂ 톤)
            </h3>
            <p className="text-center text-gray-600 mb-12">
              관악캠퍼스 (자체 검침)
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2 bg-transparent rounded-xl p-8 border border-gray-200">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={yearlyData.monthlyEmissions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      label={{ value: '온실가스 배출량(t)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()} t`, '배출량']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="emission" 
                      fill="#EF4444" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <div className="text-xl text-white bg-[#EF4444] py-3 px-6 rounded-lg inline-block mb-4">
                    총 배출량
                  </div>
                  <div className="text-4xl font-bold text-[#EF4444]">
                    <CountUp key="total" end={yearlyData.total} suffix=" t" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl text-white bg-[#EF4444] py-3 px-6 rounded-lg inline-block mb-4">
                    월 평균
                  </div>
                  <div className="text-4xl font-bold text-[#EF4444]">
                    <CountUp key="monthly" end={yearlyData.monthlyAverage} suffix=" t" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 년도별 트렌드 */}
        <div className="max-w-[1600px] mx-auto px-6 mb-20">
          <div className="border-t-4 border-[#F97316] rounded-xl p-12 bg-transparent">
            <h3 className="text-[#F97316] text-3xl font-semibold mb-4 text-center">
              년도별 배출량 트렌드
            </h3>
            <p className="text-center text-gray-600 mb-12">
              최근 10년간의 온실가스 배출량 변화
            </p>

            <div className="bg-transparent rounded-xl p-8 border border-gray-200">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={[
                  { year: '2015', emission: 138000 },
                  { year: '2016', emission: 142000 },
                  { year: '2017', emission: 145000 },
                  { year: '2018', emission: 148000 },
                  { year: '2019', emission: 146000 },
                  { year: '2020', emission: 135000 },
                  { year: '2021', emission: 138000 },
                  { year: '2022', emission: 141000 },
                  { year: '2023', emission: 139500 },
                  { year: '2024', emission: 143200 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    label={{ value: '배출량(t)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toLocaleString()} t`, '배출량']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emission" 
                    stroke="#F97316" 
                    strokeWidth={3}
                    dot={{ fill: '#F97316', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#F97316', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 감축 목표 */}
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="border-t-4 border-[#10B981] rounded-xl p-12 bg-transparent">
            <h3 className="text-[#10B981] text-3xl font-semibold mb-4 text-center">
              탄소 감축 목표
            </h3>
            <p className="text-center text-gray-600 mb-12">
              2050 탄소중립을 향한 단계별 목표
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                <div className="text-2xl font-bold text-[#10B981] mb-2">2030년</div>
                <div className="text-lg text-gray-600 mb-4">중간 목표</div>
                <div className="text-3xl font-bold text-[#10B981]">-50%</div>
                <div className="text-sm text-gray-500 mt-2">2018년 대비</div>
              </div>

              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl">
                <div className="text-2xl font-bold text-[#3B82F6] mb-2">2040년</div>
                <div className="text-lg text-gray-600 mb-4">가속화 목표</div>
                <div className="text-3xl font-bold text-[#3B82F6]">-80%</div>
                <div className="text-sm text-gray-500 mt-2">2018년 대비</div>
              </div>

              <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl">
                <div className="text-2xl font-bold text-[#8B5CF6] mb-2">2050년</div>
                <div className="text-lg text-gray-600 mb-4">최종 목표</div>
                <div className="text-3xl font-bold text-[#8B5CF6]">넷제로</div>
                <div className="text-sm text-gray-500 mt-2">탄소중립</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GreenhouseGas; 