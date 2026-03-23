import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

// 온실가스 배출 계수 (전기: 0.4781 kgCO2/kWh, 가스: 2.176 kgCO2/m³)
const ELECTRICITY_FACTOR = 0.4781;
const GAS_FACTOR = 2.176;

// GET /api/public/greenhouse-gas-stats - 공개용 온실가스 통계 (DB 연동)
export async function GET(_request: NextRequest) {
  try {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // 올해 총 배출량 계산 (에너지 데이터 기반)
    const currentEmission = await dbQuery.get<{
      total_electricity: number;
      total_gas: number;
    }>(`
      SELECT
        COALESCE(SUM(electricity), 0) as total_electricity,
        COALESCE(SUM(gas), 0) as total_gas
      FROM energy_data
      WHERE year = $1
    `, [currentYear]);

    // 전년도 총 배출량
    const previousEmission = await dbQuery.get<{
      total_electricity: number;
      total_gas: number;
    }>(`
      SELECT
        COALESCE(SUM(electricity), 0) as total_electricity,
        COALESCE(SUM(gas), 0) as total_gas
      FROM energy_data
      WHERE year = $1
    `, [previousYear]);

    // 월별 배출량 (올해)
    const monthlyData = await dbQuery.all<{
      month: number;
      electricity: number;
      gas: number;
    }>(`
      SELECT
        month,
        COALESCE(SUM(electricity), 0) as electricity,
        COALESCE(SUM(gas), 0) as gas
      FROM energy_data
      WHERE year = $1
      GROUP BY month
      ORDER BY month
    `, [currentYear]);

    // 연도별 추이 (최근 5년)
    const yearlyData = await dbQuery.all<{
      year: number;
      electricity: number;
      gas: number;
    }>(`
      SELECT
        year,
        COALESCE(SUM(electricity), 0) as electricity,
        COALESCE(SUM(gas), 0) as gas
      FROM energy_data
      WHERE year >= $1
      GROUP BY year
      ORDER BY year
    `, [currentYear - 4]);

    // 건물별 배출량 (올해 상위 5개)
    const buildingData = await dbQuery.all<{
      building_name: string;
      electricity: number;
      gas: number;
    }>(`
      SELECT
        building_name,
        COALESCE(SUM(electricity), 0) as electricity,
        COALESCE(SUM(gas), 0) as gas
      FROM energy_data
      WHERE year = $1
      GROUP BY building_name
      ORDER BY (SUM(electricity) * ${ELECTRICITY_FACTOR} + SUM(gas) * ${GAS_FACTOR}) DESC
      LIMIT 5
    `, [currentYear]);

    // 계산
    const currentTotal = ((currentEmission?.total_electricity || 0) * ELECTRICITY_FACTOR +
      (currentEmission?.total_gas || 0) * GAS_FACTOR) / 1000; // kg → ton
    const previousTotal = ((previousEmission?.total_electricity || 0) * ELECTRICITY_FACTOR +
      (previousEmission?.total_gas || 0) * GAS_FACTOR) / 1000;
    const reductionAmount = previousTotal - currentTotal;
    const reductionRate = previousTotal > 0 ? (reductionAmount / previousTotal) * 100 : 0;

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    return NextResponse.json({
      currentYear,
      totalEmission: Math.round(currentTotal),
      previousYearEmission: Math.round(previousTotal),
      reductionAmount: Math.round(reductionAmount),
      reductionRate: parseFloat(reductionRate.toFixed(2)),
      monthlyEmissions: monthlyData.map(item => ({
        month: monthNames[item.month - 1],
        emission: Math.round((item.electricity * ELECTRICITY_FACTOR + item.gas * GAS_FACTOR) / 1000),
      })),
      yearlyTrend: yearlyData.map(item => ({
        year: item.year,
        emission: Math.round((item.electricity * ELECTRICITY_FACTOR + item.gas * GAS_FACTOR) / 1000),
      })),
      buildingEmissions: buildingData.map(item => ({
        name: item.building_name,
        value: Math.round((item.electricity * ELECTRICITY_FACTOR + item.gas * GAS_FACTOR) / 1000),
      })),
    });
  } catch (error) {
    console.error('Greenhouse gas stats fetch error:', error);
    return NextResponse.json(
      { success: false, message: '온실가스 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
