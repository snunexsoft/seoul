import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

// GET /api/public/energy-stats - 공개용 에너지 통계 (DB 연동)
export async function GET(_request: NextRequest) {
  try {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // 올해 에너지 총 사용량
    const currentTotals = await dbQuery.get<{
      total_electricity: number;
      total_gas: number;
      total_water: number;
    }>(`
      SELECT
        COALESCE(SUM(electricity), 0) as total_electricity,
        COALESCE(SUM(gas), 0) as total_gas,
        COALESCE(SUM(water), 0) as total_water
      FROM energy_data
      WHERE year = $1
    `, [currentYear]);

    // 전년도 에너지 총 사용량
    const previousTotals = await dbQuery.get<{
      total_electricity: number;
      total_gas: number;
      total_water: number;
    }>(`
      SELECT
        COALESCE(SUM(electricity), 0) as total_electricity,
        COALESCE(SUM(gas), 0) as total_gas,
        COALESCE(SUM(water), 0) as total_water
      FROM energy_data
      WHERE year = $1
    `, [previousYear]);

    // 월별 에너지 사용량 (올해)
    const monthlyUsage = await dbQuery.all<{
      month: number;
      electricity: number;
      gas: number;
      water: number;
    }>(`
      SELECT
        month,
        COALESCE(SUM(electricity), 0) as electricity,
        COALESCE(SUM(gas), 0) as gas,
        COALESCE(SUM(water), 0) as water
      FROM energy_data
      WHERE year = $1
      GROUP BY month
      ORDER BY month
    `, [currentYear]);

    // 태양광 월별 발전량 (올해)
    const solarGeneration = await dbQuery.all<{
      month: number;
      generation: number;
    }>(`
      SELECT
        month,
        COALESCE(SUM(generation), 0) as generation
      FROM solar_data
      WHERE year = $1
      GROUP BY month
      ORDER BY month
    `, [currentYear]);

    // 태양광 총 발전량 (올해)
    const solarTotal = await dbQuery.get<{ total_solar: number }>(`
      SELECT COALESCE(SUM(generation), 0) as total_solar
      FROM solar_data
      WHERE year = $1
    `, [currentYear]);

    // 변화율 계산
    const elecPrev = previousTotals?.total_electricity || 1;
    const gasPrev = previousTotals?.total_gas || 1;
    const waterPrev = previousTotals?.total_water || 1;

    const electricityChange = ((currentTotals?.total_electricity || 0) - elecPrev) / elecPrev * 100;
    const gasChange = ((currentTotals?.total_gas || 0) - gasPrev) / gasPrev * 100;
    const waterChange = ((currentTotals?.total_water || 0) - waterPrev) / waterPrev * 100;

    // 에너지원 비율
    const totalEnergy = (currentTotals?.total_electricity || 0) + (currentTotals?.total_gas || 0) + (solarTotal?.total_solar || 0);
    const energySourceRatio = totalEnergy > 0 ? [
      { name: '전기', value: Math.round(((currentTotals?.total_electricity || 0) / totalEnergy) * 100) },
      { name: '가스', value: Math.round(((currentTotals?.total_gas || 0) / totalEnergy) * 100) },
      { name: '태양광', value: Math.round(((solarTotal?.total_solar || 0) / totalEnergy) * 100) },
    ] : [];

    return NextResponse.json({
      currentYear,
      totals: {
        electricity: Math.round(currentTotals?.total_electricity || 0),
        gas: Math.round(currentTotals?.total_gas || 0),
        solar: Math.round(solarTotal?.total_solar || 0),
      },
      monthlyUsage: monthlyUsage.map(item => ({
        month: item.month,
        electricity: Math.round(item.electricity),
        gas: Math.round(item.gas),
        water: Math.round(item.water),
      })),
      solarGeneration: solarGeneration.map(item => ({
        month: item.month,
        generation: Math.round(item.generation),
      })),
      energySourceRatio,
      changes: {
        electricity: parseFloat(electricityChange.toFixed(1)),
        gas: parseFloat(gasChange.toFixed(1)),
        water: parseFloat(waterChange.toFixed(1)),
      },
    });
  } catch (error) {
    console.error('Energy stats fetch error:', error);
    return NextResponse.json(
      { success: false, message: '에너지 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
