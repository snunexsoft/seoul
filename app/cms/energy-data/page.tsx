'use client';

import { useState, useEffect } from 'react';
import CmsLayout from '@/components/cms/CmsLayout';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { EnergyData, Building } from '@/types';
import { formatNumber, generateYears, generateMonths } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import * as XLSX from 'xlsx';

interface EnergyFormData {
  building_name: string;
  year: number;
  month: number;
  electricity: number;
  gas: number;
  water: number;
}

interface Filters {
  year: number | string;
  month: number | string;
  building: string;
}

export default function CmsEnergyData() {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState<EnergyData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof EnergyData>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [filters, setFilters] = useState<Filters>({
    year: new Date().getFullYear(),
    month: '',
    building: ''
  });
  
  const [formData, setFormData] = useState<EnergyFormData>({
    building_name: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    electricity: 0,
    gas: 0,
    water: 0
  });

  useEffect(() => {
    fetchEnergyData();
    fetchBuildings();
  }, [filters]);

  const fetchEnergyData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.year) params.append('year', String(filters.year));
      if (filters.month) params.append('month', String(filters.month));
      if (filters.building) params.append('building', filters.building);
      
      const response = await apiClient.get(`/api/energy?${params}`);
      setEnergyData(response.data.data as EnergyData[]);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      // Use sample data for demo
      setEnergyData([
        {
          id: 1,
          building_name: '본관',
          year: 2024,
          month: 1,
          electricity: 15420,
          gas: 8950,
          water: 1250,
          created_at: '2024-01-01T00:00:00Z'
        },
        // Add more sample data...
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await apiClient.get('/api/buildings');
      setBuildings(response.data.data as Building[]);
    } catch (error) {
      console.error('건물 목록 조회 실패:', error);
      // Use sample data
      setBuildings([
        { id: 1, name: '본관', code: 'MAIN', type: '관리동', area: 5000, created_at: '2024-01-01T00:00:00Z' },
        { id: 2, name: '도서관', code: 'LIB', type: '교육동', area: 8000, created_at: '2024-01-01T00:00:00Z' },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingData) {
        await apiClient.put(`/api/energy/${editingData.id}`, formData);
        alert('데이터가 수정되었습니다');
      } else {
        await apiClient.post('/api/energy', formData);
        alert('데이터가 추가되었습니다');
      }
      setShowModal(false);
      setEditingData(null);
      resetForm();
      fetchEnergyData();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장 실패');
    }
  };

  const handleEdit = (data: EnergyData) => {
    setEditingData(data);
    setFormData({
      building_name: data.building_name,
      year: data.year,
      month: data.month,
      electricity: data.electricity,
      gas: data.gas,
      water: data.water
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await apiClient.delete(`/api/energy/${id}`);
      alert('삭제되었습니다');
      fetchEnergyData();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 실패');
    }
  };

  const resetForm = () => {
    setFormData({
      building_name: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      electricity: 0,
      gas: 0,
      water: 0
    });
  };

  const handleExcelDownload = () => {
    const ws = XLSX.utils.json_to_sheet(energyData.map(item => ({
      '건물명': item.building_name,
      '연도': item.year,
      '월': item.month,
      '전기사용량(kWh)': item.electricity,
      '가스사용량(m³)': item.gas,
      '수도사용량(ton)': item.water
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '에너지데이터');
    XLSX.writeFile(wb, `energy_data_${filters.year || 'all'}.xlsx`);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        for (const row of jsonData as any[]) {
          await apiClient.post('/api/energy', {
            building_name: row['건물명'],
            year: row['연도'],
            month: row['월'],
            electricity: row['전기사용량(kWh)'] || 0,
            gas: row['가스사용량(m³)'] || 0,
            water: row['수도사용량(ton)'] || 0
          });
        }

        alert('엑셀 업로드 완료');
        fetchEnergyData();
      } catch (error) {
        console.error('엑셀 업로드 실패:', error);
        alert('엑셀 업로드 실패');
      }
    };
    reader.readAsBinaryString(file);
  };

  // 필터링된 데이터
  const filteredData = energyData.filter(item => 
    item.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.year.toString().includes(searchTerm) ||
    item.month.toString().includes(searchTerm)
  );

  // 정렬된 데이터
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (column: keyof EnergyData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <CmsLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">에너지 데이터를 불러오는 중...</p>
          </div>
        </div>
      </CmsLayout>
    );
  }

  return (
    <CmsLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              에너지 데이터 관리
            </h1>
            <p className="text-gray-600 mt-2">전기, 가스, 수도 사용량 데이터를 관리합니다.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExcelDownload}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>엑셀 다운로드</span>
            </button>
            <label className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2 cursor-pointer transition-colors">
              <ArrowUpTrayIcon className="h-5 w-5" />
              <span>엑셀 업로드</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>새 데이터 추가</span>
            </button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연도</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체</option>
                {generateYears().map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체</option>
                {generateMonths().map((month) => (
                  <option key={month} value={month}>{month}월</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">건물</label>
              <select
                value={filters.building}
                onChange={(e) => setFilters({ ...filters, building: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.name}>{building.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="건물명, 연도, 월로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            총 {sortedData.length}개 데이터
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('building_name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>건물명</span>
                      <ArrowsUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('year')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>연도</span>
                      <ArrowsUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('month')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>월</span>
                      <ArrowsUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전기 (kWh)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가스 (m³)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수도 (t)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.building_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.month}월
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(item.electricity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(item.gas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(item.water)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingData ? '에너지 데이터 수정' : '새 에너지 데이터 추가'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">건물</label>
                    <select
                      value={formData.building_name}
                      onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">건물 선택</option>
                      {buildings.map((building) => (
                        <option key={building.id} value={building.name}>
                          {building.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">연도</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generateYears().map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">월</label>
                      <select
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generateMonths().map((month) => (
                          <option key={month} value={month}>{month}월</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">전기 사용량 (kWh)</label>
                    <input
                      type="number"
                      value={formData.electricity}
                      onChange={(e) => setFormData({ ...formData, electricity: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">가스 사용량 (m³)</label>
                    <input
                      type="number"
                      value={formData.gas}
                      onChange={(e) => setFormData({ ...formData, gas: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">수도 사용량 (t)</label>
                    <input
                      type="number"
                      value={formData.water}
                      onChange={(e) => setFormData({ ...formData, water: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      {editingData ? '수정' : '추가'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </CmsLayout>
  );
} 