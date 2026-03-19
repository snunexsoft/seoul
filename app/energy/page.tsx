'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area, AreaChart, Legend
} from 'recharts';
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

interface MonthlyData {
  month: string;
  emission?: number;
  usage?: number;
}

interface EnergyDataType {
  total: number;
  monthlyAverage: number;
  monthlyUsage?: MonthlyData[];
  monthlyEmissions?: MonthlyData[];
}

const Energy = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState('2024');

  useEffect(() => {
    // 테스트용 하드코딩된 데이터
    setApiData({
      totals: {
        total_electricity: 57100,
        total_gas: 22100,
        total_water: 5710
      },
      monthlyUsage: [
        { electricity: 5100, gas: 3300, water: 510 },
        { electricity: 4700, gas: 3100, water: 470 },
        { electricity: 4400, gas: 2600, water: 440 },
        { electricity: 4000, gas: 1800, water: 400 },
        { electricity: 3700, gas: 1200, water: 370 },
        { electricity: 4600, gas: 850, water: 460 },
        { electricity: 5800, gas: 600, water: 580 },
        { electricity: 6000, gas: 600, water: 600 },
        { electricity: 5000, gas: 1050, water: 500 },
        { electricity: 4200, gas: 1600, water: 420 },
        { electricity: 4600, gas: 2300, water: 460 },
        { electricity: 5000, gas: 3100, water: 500 }
      ]
    });
    setLoading(false);

    /* API 호출 코드 (나중에 사용)
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/energy-stats');
        if (response.ok) {
          const result = await response.json();
          console.log('API 응답:', result);
          setApiData(result.data);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('에너지 통계 데이터 로딩 오류:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    */
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto w-full">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">에너지 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1920px] mx-auto w-full">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  // API 데이터에서 월별 데이터 변환
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  
  const electricityData: EnergyDataType = {
    total: apiData?.totals?.total_electricity || 57100,
    monthlyAverage: Math.round((apiData?.totals?.total_electricity || 57100) / 12),
    monthlyUsage: apiData?.monthlyUsage?.map((item: any, index: number) => ({
      month: monthNames[index],
      usage: item.electricity
    })) || []
  };

  const gasData: EnergyDataType = {
    total: apiData?.totals?.total_gas || 22100,
    monthlyAverage: Math.round((apiData?.totals?.total_gas || 22100) / 12),
    monthlyUsage: apiData?.monthlyUsage?.map((item: any, index: number) => ({
      month: monthNames[index],
      usage: item.gas
    })) || []
  };

  const waterData: EnergyDataType = {
    total: apiData?.totals?.total_water || 5710,
    monthlyAverage: Math.round((apiData?.totals?.total_water || 5710) / 12),
    monthlyUsage: apiData?.monthlyUsage?.map((item: any, index: number) => ({
      month: monthNames[index],
      usage: item.water
    })) || []
  };

  // TOE 계산 (대략적인 계산)
  const toeTotal = Math.round((electricityData.total * 0.25) + (gasData.total * 0.001) + (waterData.total * 0.001));
  const toeMonthlyAverage = Math.round(toeTotal / 12);
  
  const toeData: EnergyDataType = {
    total: toeTotal,
    monthlyAverage: toeMonthlyAverage,
    monthlyEmissions: apiData?.monthlyUsage?.map((item: any, index: number) => ({
      month: monthNames[index],
      emission: Math.round((item.electricity * 0.25) + (item.gas * 0.001) + (item.water * 0.001))
    })) || []
  };

  return (
    <div className="max-w-[1920px] mx-auto w-full">
      {/* CSS 스타일 */}
      <style jsx>{`
        /* Font Face */
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

        @font-face {
          font-family: 'SUIT';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-ExtraBold.woff2') format('woff2');
          font-weight: 800;
          font-style: normal;
        }
        
        body {
          font-family: 'SUIT', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 
          Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        
        /* 서브 타이틀 영역 */
        .sub-title-section {
          background-color: #F5FDE7;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        /* 그라디언트 구들 */
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
          background: radial-gradient(circle, #A8E6A3 0%, #7DD87A 50%, rgba(125, 216, 122, 0.3) 100%);
          top: -50px;
          left: 10%;
          animation: float1 8s ease-in-out infinite;
        }
        
        .gradient-circle-2 {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, #D4E157 0%, #C0CA33 50%, rgba(192, 202, 51, 0.3) 100%);
          top: 50px;
          right: 15%;
          animation: float2 10s ease-in-out infinite;
        }
        
        .gradient-circle-3 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, #B2DFDB 0%, #80CBC4 50%, rgba(128, 203, 196, 0.3) 100%);
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          animation: float3 12s ease-in-out infinite;
        }
        
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(0.9); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateX(-50%) translateY(0px) scale(1); }
          50% { transform: translateX(-50%) translateY(-25px) scale(1.05); }
        }
      `}</style>

      {/* Header */}
      <Header currentPage="energy" />

      {/* 서브 타이틀 섹션 */}
      <div className="sub-title-section">
        <div className="gradient-circles">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
          <div className="gradient-circle gradient-circle-3"></div>
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold text-[#6ECD8E] mb-6">
            에너지 분석
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            서울대학교 관악캠퍼스의 전기, 가스, 상수 소비량 현황을 분석합니다
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        {/* 1. TOE 소비량 */}
        <div className="max-w-[1600px] mx-auto px-6 mb-20">
          <div className="border-t-4 border-[#6ECD8E] rounded-xl p-12 bg-transparent">
            <h3 className="text-[#6ECD8E] text-3xl font-semibold mb-4 text-center">
              TOE (석유환산톤) 소비량
            </h3>
            <p className="text-center text-gray-600 mb-12">
              관악캠퍼스 (자체 검침)
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2 bg-transparent rounded-xl p-8 border border-gray-200">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={toeData.monthlyEmissions}>
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
                      label={{ value: 'TOE 소비량', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()} TOE`, '소비량']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="emission" 
                      fill="#6ECD8E" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <div className="text-xl text-white bg-[#6ECD8E] py-3 px-6 rounded-lg inline-block mb-4">
                    총 TOE 소비량
                  </div>
                  <div className="text-4xl font-bold text-[#6ECD8E]">
                    <CountUp key="toe-total" end={toeData.total} suffix=" TOE" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl text-white bg-[#6ECD8E] py-3 px-6 rounded-lg inline-block mb-4">
                    월 평균
                  </div>
                  <div className="text-4xl font-bold text-[#6ECD8E]">
                    <CountUp key="toe-monthly" end={toeData.monthlyAverage} suffix=" TOE" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 전력 소비량 */}
        <div className="max-w-[1600px] mx-auto px-6 mb-20">
          <div className="border-t-4 border-[#3B82F6] rounded-xl p-12 bg-transparent">
            <h3 className="text-[#3B82F6] text-3xl font-semibold mb-4 text-center">
              전력 소비량
            </h3>
            <p className="text-center text-gray-600 mb-12">
              관악캠퍼스 (자체 검침)
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2 bg-transparent rounded-xl p-8 border border-gray-200">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={electricityData.monthlyUsage}>
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
                      label={{ value: '전력 소비량(MWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()} MWh`, '소비량']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="usage" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <div className="text-xl text-white bg-[#3B82F6] py-3 px-6 rounded-lg inline-block mb-4">
                    전력 소비량
                  </div>
                  <div className="text-4xl font-bold text-[#3B82F6]">
                    <CountUp key="electricity-total" end={electricityData.total} suffix=" MWh" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl text-white bg-[#3B82F6] py-3 px-6 rounded-lg inline-block mb-4">
                    월 평균
                  </div>
                  <div className="text-4xl font-bold text-[#3B82F6]">
                    <CountUp key="electricity-monthly" end={electricityData.monthlyAverage} suffix=" MWh" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 가스 소비량 */}
        <div className="max-w-[1600px] mx-auto px-6 mb-20">
          <div className="border-t-4 border-[#10B981] rounded-xl p-12 bg-transparent">
            <h3 className="text-[#10B981] text-3xl font-semibold mb-4 text-center">
              가스 소비량
            </h3>
            <p className="text-center text-gray-600 mb-12">
              관악캠퍼스 (자체 검침)
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2 bg-transparent rounded-xl p-8 border border-gray-200">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={gasData.monthlyUsage}>
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
                      label={{ value: '가스 소비량(m³)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()} m³`, '소비량']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="usage" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <div className="text-xl text-white bg-[#10B981] py-3 px-6 rounded-lg inline-block mb-4">
                    가스 소비량
                  </div>
                  <div className="text-4xl font-bold text-[#10B981]">
                    <CountUp key="gas-total" end={gasData.total} suffix=" MWh" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl text-white bg-[#10B981] py-3 px-6 rounded-lg inline-block mb-4">
                    월 평균
                  </div>
                  <div className="text-4xl font-bold text-[#10B981]">
                    <CountUp key="gas-monthly" end={gasData.monthlyAverage} suffix=" MWh" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 상수 소비량 */}
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="border-t-4 border-[#F59E0B] rounded-xl p-12 bg-transparent">
            <h3 className="text-[#F59E0B] text-3xl font-semibold mb-4 text-center">
              상수 소비량
            </h3>
            <p className="text-center text-gray-600 mb-12">
              관악캠퍼스 (자체 검침)
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2 bg-transparent rounded-xl p-8 border border-gray-200">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={waterData.monthlyUsage}>
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
                      label={{ value: '상수 소비량(t)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()} t`, '소비량']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="usage" 
                      fill="#F59E0B" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <div className="text-xl text-white bg-[#F59E0B] py-3 px-6 rounded-lg inline-block mb-4">
                    상수 소비량
                  </div>
                  <div className="text-4xl font-bold text-[#F59E0B]">
                    <CountUp key="water-total" end={waterData.total} suffix=" t" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl text-white bg-[#F59E0B] py-3 px-6 rounded-lg inline-block mb-4">
                    월 평균
                  </div>
                  <div className="text-4xl font-bold text-[#F59E0B]">
                    <CountUp key="water-monthly" end={waterData.monthlyAverage} suffix=" t" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Energy; 