import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function HistoryAdmin() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterYear, setFilterYear] = useState('');
  const [years, setYears] = useState([]);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: '',
    day: '',
    date_text: '',
    title: '',
    description: '',
    sort_order: 0
  });

  useEffect(() => {
    fetchEntries();
    fetchYears();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/history', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setEntries(data || []);
      } else {
        throw new Error('Failed to fetch history');
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('연혁을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const fetchYears = async () => {
    try {
      const response = await fetch('/api/public/history/years');
      if (response.ok) {
        const data = await response.json();
        setYears(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch years:', error);
    }
  };

  const resetForm = () => ({
    year: new Date().getFullYear(),
    month: '',
    day: '',
    date_text: '',
    title: '',
    description: '',
    sort_order: 0
  });

  const handleAdd = () => {
    setIsAdding(true);
    setFormData(resetForm());
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      year: entry.year,
      month: entry.month || '',
      day: entry.day || '',
      date_text: entry.date_text,
      title: entry.title,
      description: entry.description || '',
      sort_order: entry.sort_order || 0
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(resetForm());
  };

  const handleSave = async () => {
    if (!formData.year || !formData.date_text || !formData.title) {
      toast.error('연도, 날짜 텍스트, 제목은 필수입니다');
      return;
    }

    try {
      const url = editingId ? `/api/history/${editingId}` : '/api/history';
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          month: formData.month || null,
          day: formData.day || null
        })
      });

      if (response.ok) {
        toast.success(editingId ? '연혁이 수정되었습니다' : '연혁이 추가되었습니다');
        handleCancel();
        fetchEntries();
        fetchYears();
      } else {
        const error = await response.json();
        toast.error(error.error || '저장에 실패했습니다');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('저장에 실패했습니다');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 연혁 항목을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('연혁이 삭제되었습니다');
        fetchEntries();
        fetchYears();
      } else {
        const error = await response.json();
        toast.error(error.error || '삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('삭제에 실패했습니다');
    }
  };

  const filteredEntries = filterYear
    ? entries.filter(e => e.year === parseInt(filterYear))
    : entries;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isEditing = isAdding || editingId;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">연혁 관리</h1>
        <div className="flex items-center space-x-3">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">전체 연도</option>
            {years.map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          {!isEditing && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              새 연혁
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? '연혁 수정' : '새 연혁 추가'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연도 *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                placeholder="선택사항"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">날짜 텍스트 *</label>
              <input
                type="text"
                value={formData.date_text}
                onChange={(e) => setFormData({ ...formData, date_text: e.target.value })}
                placeholder="예: 2024. 03"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button onClick={handleCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              취소
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {editingId ? '수정' : '저장'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{entry.date_text}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{entry.title}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{entry.description || '-'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:text-blue-900">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">연혁 항목이 없습니다</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        총 {filteredEntries.length}건 {filterYear && `(${filterYear}년)`}
      </div>
    </div>
  );
}
