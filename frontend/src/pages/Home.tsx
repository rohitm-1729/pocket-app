import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, Archive, BookOpen, List } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useArticles, useUpdateArticle, useDeleteArticle, useSearchArticles } from '../hooks/useArticles';
import { ArticleCard } from '../components/ArticleCard';
import { SaveArticleForm } from '../components/SaveArticleForm';

type FilterType = 'all' | 'unread' | 'archived';

export function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [filter, setFilter] = useState<FilterType>('unread');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filters = {
    all: {},
    unread: { is_archived: false },
    archived: { is_archived: true },
  };

  const { data, isLoading, error } = useArticles(filters[filter]);
  const { data: searchResults } = useSearchArticles(isSearching ? searchQuery : '');
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  const articles = isSearching && searchQuery ? searchResults?.articles : data?.articles;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Pocket App</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{user?.email}</span>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Search and Save */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) clearSearch();
                }}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </form>
            <SaveArticleForm />
          </div>

          {/* Filters */}
          {!isSearching && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFilter('unread')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookOpen size={16} />
                My List
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === 'archived'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Archive size={16} />
                Archive
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={16} />
                All
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Failed to load articles. Please try again.
          </div>
        ) : articles?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {isSearching
              ? 'No articles found matching your search.'
              : filter === 'archived'
              ? 'No archived articles yet.'
              : 'No articles saved yet. Save your first article above!'}
          </div>
        ) : (
          <div className="space-y-4">
            {articles?.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => navigate(`/article/${article.id}`)}
                onRead={() =>
                  updateArticle.mutate({
                    id: article.id,
                    updates: { is_read: !article.is_read },
                  })
                }
                onArchive={() =>
                  updateArticle.mutate({
                    id: article.id,
                    updates: { is_archived: !article.is_archived },
                  })
                }
                onDelete={() => {
                  if (confirm('Delete this article?')) {
                    deleteArticle.mutate(article.id);
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
