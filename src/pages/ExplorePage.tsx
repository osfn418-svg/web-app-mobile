import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import ToolCard from '@/components/cards/ToolCard';
import { useAITools, useCategories } from '@/hooks/useRealtimeData';

export default function ExplorePage() {
  const { data: tools, loading: toolsLoading, error: toolsError } = useAITools();
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mappedTools = useMemo(() => {
    return tools.map((tool: any) => ({
      tool_id: tool.id,
      tool_name: tool.name,
      tool_description: tool.description,
      tool_url: tool.url,
      logo_url: tool.logo_url,
      requires_subscription: !!tool.requires_subscription,
      rating: tool.rating ?? 0,
      category_id: 0,
      added_by_admin: 0,
      approved: true,
      // keep any other fields that ToolCard might not use
    }));
  }, [tools]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return mappedTools.filter((tool: any) => {
      const original = tools.find((t: any) => t.id === tool.tool_id);
      const matchesCategory = selectedCategory === null || original?.category_id === selectedCategory;
      const matchesSearch =
        q.length === 0 ||
        tool.tool_name.toLowerCase().includes(q) ||
        tool.tool_description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [mappedTools, searchQuery, selectedCategory, tools]);

  const isLoading = toolsLoading || categoriesLoading;
  const error = toolsError || categoriesError;

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-4">استكشاف</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن أداة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            الكل
          </button>

          {categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category.icon ? `${category.icon} ` : ''}{category.name}
            </button>
          ))}
        </motion.div>

        {/* Errors */}
        {error && (
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-destructive">حدث خطأ أثناء تحميل الأدوات: {error}</p>
          </div>
        )}

        {/* Tools Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 h-40 animate-pulse bg-muted" />
              ))
            : filteredTools.map((tool: any, index: number) => (
                <motion.div
                  key={tool.tool_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
        </motion.div>

        {!isLoading && filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لم يتم العثور على أدوات</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
