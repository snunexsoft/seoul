export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">테스트 페이지</h1>
      <p className="text-lg text-gray-700">이 페이지가 보이면 Next.js가 정상 작동 중입니다.</p>
      <div className="mt-8 p-4 bg-green-100 rounded-lg">
        <h2 className="text-2xl font-semibold text-green-800">✅ 성공!</h2>
        <p className="text-green-700">Next.js 페이지 렌더링이 정상적으로 작동합니다.</p>
      </div>
    </div>
  );
} 