import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function LinkPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link_url: '',
    image_url: '',
    main_category: '',
    sub_category: '',
    status: 'published'
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/link-posts', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data || []);
      } else {
        throw new Error('Failed to fetch link posts');
      }
    } catch (error) {
      console.error('Failed to fetch link posts:', error);
      toast.error('링크 게시글을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => ({
    title: '',
    content: '',
    link_url: '',
    image_url: '',
    main_category: '',
    sub_category: '',
    status: 'published'
  });

  const handleAdd = () => {
    setIsAdding(true);
    setFormData(resetForm());
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      content: post.content,
      link_url: post.link_url,
      image_url: post.image_url || '',
      main_category: post.main_category,
      sub_category: post.sub_category,
      status: post.status || 'published'
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(resetForm());
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.link_url || !formData.main_category || !formData.sub_category) {
      toast.error('제목, 내용, 링크 URL, 대분류, 소분류는 필수입니다');
      return;
    }

    try {
      const url = editingId ? `/api/link-posts/${editingId}` : '/api/link-posts';
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingId ? '링크 게시글이 수정되었습니다' : '링크 게시글이 생성되었습니다');
        handleCancel();
        fetchPosts();
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
    if (!confirm('이 링크 게시글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/link-posts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('링크 게시글이 삭제되었습니다');
        fetchPosts();
      } else {
        const error = await response.json();
        toast.error(error.error || '삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('삭제에 실패했습니다');
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">링크 게시글 관리</h1>
        {!isEditing && (
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            새 링크 게시글
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? '링크 게시글 수정' : '새 링크 게시글'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">링크 URL *</label>
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대분류 *</label>
              <input
                type="text"
                value={formData.main_category}
                onChange={(e) => setFormData({ ...formData, main_category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">소분류 *</label>
              <input
                type="text"
                value={formData.sub_category}
                onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="published">공개</option>
                <option value="draft">임시저장</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대분류</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">소분류</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <LinkIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                        {post.link_url}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{post.main_category}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{post.sub_category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status === 'published' ? '공개' : '임시저장'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(post)} className="text-blue-600 hover:text-blue-900">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <LinkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">링크 게시글이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
