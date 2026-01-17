import { Archive, Trash2, Check, RotateCcw } from 'lucide-react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onRead: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export function ArticleCard({ article, onRead, onArchive, onDelete, onClick }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {article.thumbnail_url && (
          <div className="w-32 h-32 flex-shrink-0">
            <img
              src={article.thumbnail_url}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex-1 p-4 min-w-0">
          <button
            onClick={onClick}
            className="block text-left w-full"
          >
            <h3 className={`font-medium text-gray-900 line-clamp-2 hover:text-blue-600 ${article.is_read ? 'text-gray-500' : ''}`}>
              {article.title}
            </h3>
          </button>

          {article.excerpt && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span>{article.site_name || new URL(article.url).hostname}</span>
            <span>·</span>
            <span>{article.reading_time_minutes} min read</span>
            <span>·</span>
            <span>{formatDate(article.saved_at)}</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead();
              }}
              className={`p-1.5 rounded hover:bg-gray-100 ${article.is_read ? 'text-green-600' : 'text-gray-400'}`}
              title={article.is_read ? 'Mark as unread' : 'Mark as read'}
            >
              {article.is_read ? <RotateCcw size={16} /> : <Check size={16} />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
              className={`p-1.5 rounded hover:bg-gray-100 ${article.is_archived ? 'text-blue-600' : 'text-gray-400'}`}
              title={article.is_archived ? 'Unarchive' : 'Archive'}
            >
              <Archive size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
