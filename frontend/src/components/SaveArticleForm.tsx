import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useCreateArticle } from '../hooks/useArticles';

export function SaveArticleForm() {
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: createArticle, isPending, error } = useCreateArticle();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    createArticle(url, {
      onSuccess: () => {
        setUrl('');
        setIsOpen(false);
      },
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} />
        <span>Save Article</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste article URL..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoFocus
        required
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <span>Save</span>
        )}
      </button>
      <button
        type="button"
        onClick={() => {
          setIsOpen(false);
          setUrl('');
        }}
        className="px-4 py-2 text-gray-600 hover:text-gray-800"
      >
        Cancel
      </button>
      {error && (
        <span className="text-red-500 text-sm self-center">Failed to save article</span>
      )}
    </form>
  );
}
