import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, DocumentArrowDownIcon, CalendarIcon, FolderIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';

export default function PostView() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [identifier]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch by ID first, then by slug
      const response = await axios.get(`/api/post/${identifier}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      if (error.response?.status === 404) {
        setError('게시글을 찾을 수 없습니다.');
      } else {
        setError('게시글을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!post.attachment_filepath) return;
    
    try {
      window.open(`/api/posts/${post.id}/download`, '_blank');
    } catch (error) {
      toast.error('파일 다운로드에 실패했습니다.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">오류</h2>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          돌아가기
        </button>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="main-wrapper" style={{ maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
      <style>{`
        /* Force 1920px max-width for all elements */
        .main-wrapper {
          max-width: 1920px !important;
          margin: 0 auto !important;
          width: 100% !important;
        }
        
        .main-wrapper * {
          max-width: 1920px !important;
        }
        
        body {
          font-family: 'SUIT', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Markdown styles */
        .markdown-content {
          line-height: 1.8;
          color: #333;
        }
        
        .markdown-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 2rem 0 1rem;
          color: #222;
        }
        
        .markdown-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem;
          color: #333;
        }
        
        .markdown-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.25rem 0 0.5rem;
          color: #444;
        }
        
        .markdown-content p {
          margin: 1rem 0;
        }
        
        .markdown-content ul, .markdown-content ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        .markdown-content li {
          margin: 0.5rem 0;
        }
        
        .markdown-content blockquote {
          border-left: 4px solid #6ECD8E;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: #666;
          font-style: italic;
        }
        
        .markdown-content code {
          background-color: #f5f5f5;
          padding: 0.125rem 0.25rem;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.875em;
        }
        
        .markdown-content pre {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .markdown-content img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 8px;
        }
        
        .markdown-content a {
          color: #6ECD8E;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        
        .markdown-content a:hover {
          border-bottom-color: #6ECD8E;
        }
        
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        
        .markdown-content th,
        .markdown-content td {
          border: 1px solid #ddd;
          padding: 0.75rem;
          text-align: left;
        }
        
        .markdown-content th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-width-1920 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                목록으로
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-width-1920 mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white shadow rounded-lg overflow-hidden">
            {/* Post Header */}
            <div className="px-6 py-8 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(post.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                {post.board_name && (
                  <div className="flex items-center">
                    <FolderIcon className="h-4 w-4 mr-1" />
                    {post.board_name}
                  </div>
                )}
                {post.category_name && (
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {post.category_name}
                    </span>
                  </div>
                )}
              </div>
              
              {/* PDF Download Button */}
              {post.attachment_filename && (
                <div className="mt-6">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    {post.attachment_filename}
                    {post.attachment_filesize && (
                      <span className="ml-2 text-sm opacity-75">
                        ({formatFileSize(post.attachment_filesize)})
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="px-6 py-8">
              <div className="markdown-content prose max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </div>

            {/* Post Footer */}
            {post.updated_at && post.updated_at !== post.created_at && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  마지막 수정: {new Date(post.updated_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </article>
        </main>
      </div>
    </div>
  );
}