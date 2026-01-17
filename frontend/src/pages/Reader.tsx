import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Check, Archive, Trash2, RotateCcw } from 'lucide-react';
import { useArticle, useUpdateArticle, useDeleteArticle } from '../hooks/useArticles';

export function Reader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error } = useArticle(Number(id));
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Article not found</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700"
        >
          Go back home
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this article?')) {
      deleteArticle.mutate(article.id, {
        onSuccess: () => navigate('/'),
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateArticle.mutate({
                  id: article.id,
                  updates: { is_read: !article.is_read },
                })
              }
              className={`p-2 rounded-lg hover:bg-gray-100 ${
                article.is_read ? 'text-green-600' : 'text-gray-400'
              }`}
              title={article.is_read ? 'Mark as unread' : 'Mark as read'}
            >
              {article.is_read ? <RotateCcw size={20} /> : <Check size={20} />}
            </button>

            <button
              onClick={() =>
                updateArticle.mutate({
                  id: article.id,
                  updates: { is_archived: !article.is_archived },
                })
              }
              className={`p-2 rounded-lg hover:bg-gray-100 ${
                article.is_archived ? 'text-blue-600' : 'text-gray-400'
              }`}
              title={article.is_archived ? 'Unarchive' : 'Archive'}
            >
              <Archive size={20} />
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="View original"
            >
              <ExternalLink size={20} />
            </a>

            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {article.author && <span>{article.author}</span>}
            {article.author && <span>·</span>}
            <span>{article.site_name || new URL(article.url).hostname}</span>
            <span>·</span>
            <span>{article.reading_time_minutes} min read</span>
            <span>·</span>
            <span>Saved {formatDate(article.saved_at)}</span>
          </div>
        </header>

        {article.thumbnail_url && (
          <img
            src={article.thumbnail_url}
            alt=""
            className="w-full h-64 object-cover rounded-lg mb-8"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        {article.content ? (
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Content could not be extracted.</p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink size={18} />
              View original article
            </a>
          </div>
        )}
      </article>
    </div>
  );
}
