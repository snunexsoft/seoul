#!/bin/bash

# PostgreSQL 배포 스크립트
# Vercel 배포 전에 실행

set -e

echo "🚀 PostgreSQL 배포 준비 시작..."

# 환경 변수 확인
if [ -z "$POSTGRES_URL" ]; then
    echo "❌ POSTGRES_URL 환경 변수가 설정되지 않았습니다."
    echo "예시: export POSTGRES_URL='postgres://username:password@hostname:port/database?sslmode=require'"
    exit 1
fi

echo "✅ PostgreSQL 연결 문자열 확인됨"

# Node.js 의존성 설치
echo "📦 Node.js 의존성 설치 중..."
cd server
npm install

# PostgreSQL 스키마 생성 및 데이터 마이그레이션
echo "🗄️ 데이터베이스 스키마 생성 및 데이터 마이그레이션 중..."
cd ..
node migrate-to-postgres.js

echo "✅ 데이터 마이그레이션 완료"

# Next.js 빌드
echo "🏗️ Next.js 애플리케이션 빌드 중..."
cd nextjs-app
npm install
npm run build

echo "✅ Next.js 빌드 완료"

# Vercel 배포
echo "🚀 Vercel 배포 시작..."
cd ..
npx vercel --prod

echo "🎉 배포 완료!"
echo ""
echo "다음 단계:"
echo "1. Vercel Dashboard에서 환경 변수 설정 확인"
echo "2. 도메인 설정 및 HTTPS 인증서 확인"
echo "3. 애플리케이션 정상 작동 테스트"