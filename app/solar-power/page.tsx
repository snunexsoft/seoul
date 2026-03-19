'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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

const SolarPower = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [loading, setLoading] = useState(false);

  const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];

  // 2024년 태양광 발전량 데이터
  const solarData = {
    total: 1261489,
    monthlyAverage: 210248,
    carbonReduction: 587,
    monthlyGeneration: [
      { month: '1월', generation: 118456 },
      { month: '2월', generation: 142789 },
      { month: '3월', generation: 215634 },
      { month: '4월', generation: 234567 },
      { month: '5월', generation: 287923 },
      { month: '6월', generation: 245678 },
      { month: '7월', generation: 256789 },
      { month: '8월', generation: 234567 },
      { month: '9월', generation: 189456 },
      { month: '10월', generation: 156234 },
      { month: '11월', generation: 123456 },
      { month: '12월', generation: 98765 }
    ]
  };

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto w-full">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">태양광 데이터를 불러오는 중...</div>
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
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
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
          background: radial-gradient(circle, #FCD34D 0%, #F59E0B 50%, rgba(245, 158, 11, 0.3) 100%);
          top: -50px;
          left: 10%;
          animation: float1 8s ease-in-out infinite;
        }
        
        .gradient-circle-2 {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, #FBBF24 0%, #D97706 50%, rgba(217, 119, 6, 0.3) 100%);
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
      <Header currentPage="solar-power" />

      {/* 서브 타이틀 섹션 */}
      <div className="sub-title-section">
        <div className="gradient-circles">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold text-[#F59E0B] mb-6">
            태양광 발전 분석
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            서울대학교 관악캠퍼스의 태양광 발전량 및 효율성을 분석합니다
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        {/* 태양광 발전량 */}
        <div className="max-w-[1600px] mx-auto px-6 mb-20">
          <div className="border-t-4 border-[#F59E0B] rounded-xl p-12 bg-transparent">
            <h3 className="text-[#F59E0B] text-3xl font-semibold mb-4 text-center">
              태양광 발전량 (kWh)
            </h3>
            <p className="text-center text-gray-600 mb-12">
              관악캠퍼스 태양광 시설 (2024년)
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2 bg-transparent rounded-xl p-8 border border-gray-200">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={solarData.monthlyGeneration}>
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
                      label={{ value: '발전량(kWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()} kWh`, '발전량']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="generation" 
                      fill="#F59E0B" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <div className="text-xl text-white bg-[#F59E0B] py-3 px-6 rounded-lg inline-block mb-4">
                    총 발전량
                  </div>
                  <div className="text-4xl font-bold text-[#F59E0B]">
                    <CountUp key="total" end={solarData.total} suffix=" kWh" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl text-white bg-[#F59E0B] py-3 px-6 rounded-lg inline-block mb-4">
                    월 평균
                  </div>
                  <div className="text-4xl font-bold text-[#F59E0B]">
                    <CountUp key="monthly" end={solarData.monthlyAverage} suffix=" kWh" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl text-white bg-[#10B981] py-3 px-6 rounded-lg inline-block mb-4">
                    CO₂ 감축량
                  </div>
                  <div className="text-4xl font-bold text-[#10B981]">
                    <CountUp key="carbon" end={solarData.carbonReduction} suffix=" t" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 발전 효율성 */}
        <div className="max-w-[1600px] mx-auto px-6 mb-20">
          <div className="border-t-4 border-[#D97706] rounded-xl p-12 bg-transparent">
            <h3 className="text-[#D97706] text-3xl font-semibold mb-4 text-center">
              월별 발전 효율성
            </h3>
            <p className="text-center text-gray-600 mb-12">
              일조량과 발전량의 상관관계 분석
            </p>

            <div className="bg-transparent rounded-xl p-8 border border-gray-200">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={solarData.monthlyGeneration}>
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
                    label={{ value: '발전량(kWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toLocaleString()} kWh`, '발전량']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="generation" 
                    stroke="#D97706" 
                    strokeWidth={3}
                    dot={{ fill: '#D97706', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#D97706', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 환경 효과 */}
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="border-t-4 border-[#10B981] rounded-xl p-12 bg-transparent">
            <h3 className="text-[#10B981] text-3xl font-semibold mb-4 text-center">
              환경 기여도
            </h3>
            <p className="text-center text-gray-600 mb-12">
              태양광 발전으로 인한 환경 개선 효과
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                <div className="text-4xl mb-4">🌱</div>
                <div className="text-2xl font-bold text-[#10B981] mb-2">CO₂ 감축</div>
                <div className="text-3xl font-bold text-[#10B981]">
                  <CountUp end={587} suffix=" t" />
                </div>
                <div className="text-sm text-gray-500 mt-2">연간 기준</div>
              </div>

              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl">
                <div className="text-4xl mb-4">🌳</div>
                <div className="text-2xl font-bold text-[#3B82F6] mb-2">나무 심기 효과</div>
                <div className="text-3xl font-bold text-[#3B82F6]">
                  <CountUp end={26} suffix="년생" />
                </div>
                <div className="text-sm text-gray-500 mt-2">소나무 1,200그루</div>
              </div>

              <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl">
                <div className="text-4xl mb-4">⚡</div>
                <div className="text-2xl font-bold text-[#F59E0B] mb-2">전력 자급률</div>
                <div className="text-3xl font-bold text-[#F59E0B]">
                  <CountUp end={12} suffix="%" />
                </div>
                <div className="text-sm text-gray-500 mt-2">캠퍼스 전체 대비</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SolarPower; 