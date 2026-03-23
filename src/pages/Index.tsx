import { useState, useMemo } from 'react';
import { articles, categories, CATEGORY_COLORS, CATEGORY_BG, type Article, type ThreatCategory } from '@/data/articles';
import Icon from '@/components/ui/icon';

const SEVERITY_LABEL: Record<number, string> = {
  1: 'Минимальная',
  2: 'Низкая',
  3: 'Средняя',
  4: 'Высокая',
  5: 'Критическая',
};

function SeverityDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: i <= level
              ? level >= 4 ? 'hsl(0 72% 51%)' : level === 3 ? 'hsl(38 92% 50%)' : 'hsl(142 71% 45%)'
              : 'hsl(0 0% 85%)',
          }}
        />
      ))}
    </div>
  );
}

function CategoryBadge({ category }: { category: ThreatCategory }) {
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded"
      style={{
        color: CATEGORY_COLORS[category],
        background: CATEGORY_BG[category],
      }}
    >
      {category}
    </span>
  );
}

function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group border border-border rounded-sm p-5 bg-card hover:border-foreground/30 transition-all duration-200 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={article.category} />
          <span className="text-xs text-muted-foreground font-mono">{article.platform}</span>
        </div>
        <SeverityDots level={article.severity} />
      </div>
      <h3 className="font-semibold text-base mb-1 group-hover:text-foreground/80 transition-colors">
        {article.title}
      </h3>
      {article.aliases && article.aliases.length > 0 && (
        <p className="text-xs text-muted-foreground font-mono mb-2">
          aka {article.aliases.join(', ')}
        </p>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {article.summary}
      </p>
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Icon name="Calendar" size={12} />
        <span>Впервые обнаружен: {article.firstSeen}</span>
      </div>
    </button>
  );
}

function ArticleView({ article, onBack }: { article: Article; onBack: () => void }) {
  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 story-link"
      >
        <Icon name="ArrowLeft" size={14} />
        <span>Все статьи</span>
      </button>

      <div className="max-w-2xl">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <CategoryBadge category={article.category} />
          <span className="text-sm text-muted-foreground font-mono">{article.platform}</span>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1.5">
            <SeverityDots level={article.severity} />
            <span className="text-xs text-muted-foreground">{SEVERITY_LABEL[article.severity]}</span>
          </div>
        </div>

        <h1 className="text-4xl font-semibold mb-2 tracking-tight">{article.title}</h1>

        {article.aliases && article.aliases.length > 0 && (
          <p className="text-sm text-muted-foreground font-mono mb-6">
            Известен также как: {article.aliases.join(', ')}
          </p>
        )}

        <div
          className="text-base leading-relaxed border-l-2 pl-4 mb-8 italic text-muted-foreground"
          style={{ borderColor: CATEGORY_COLORS[article.category] }}
        >
          {article.summary}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono mb-10 pb-8 border-b border-border">
          <span className="flex items-center gap-1">
            <Icon name="Calendar" size={12} />
            Впервые обнаружен: {article.firstSeen}
          </span>
        </div>

        <div className="space-y-8 animate-stagger">
          {article.content.map((section) => (
            <div key={section.heading}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span
                  className="w-1 h-5 rounded-full inline-block flex-shrink-0"
                  style={{ background: CATEGORY_COLORS[article.category] }}
                />
                {section.heading}
              </h2>
              <p className="text-base text-foreground/80 leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<ThreatCategory | null>(null);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (activeCategory && a.category !== activeCategory) return false;
      if (activePlatform) {
        if (activePlatform === 'Windows' && a.platform === 'Android') return false;
        if (activePlatform === 'Android' && a.platform === 'Windows') return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          (a.aliases || []).some((al) => al.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeCategory, activePlatform, searchQuery]);

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-10">
          <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">
            <Icon name="Shield" size={12} />
            <span>База знаний об угрозах</span>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight mb-4">
            Вредоносное ПО
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Энциклопедия угроз для Windows и Android. Трояны, черви, шпионское ПО, вымогатели и другие виды вредоносного программного обеспечения.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 animate-fade-in">
          <div className="relative max-w-md">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-sm bg-background focus:outline-none focus:border-foreground/40 transition-colors font-mono placeholder:font-sans placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Платформа:</span>
            {['Windows', 'Android'].map((p) => (
              <button
                key={p}
                onClick={() => setActivePlatform(activePlatform === p ? null : p)}
                className="text-xs px-3 py-1 rounded-sm border transition-all duration-150"
                style={{
                  background: activePlatform === p ? 'hsl(0 0% 8%)' : 'transparent',
                  color: activePlatform === p ? 'hsl(0 0% 98%)' : 'hsl(0 0% 45%)',
                  borderColor: activePlatform === p ? 'hsl(0 0% 8%)' : 'hsl(0 0% 88%)',
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-mono mt-1.5">Тип угрозы:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className="text-xs px-3 py-1 rounded-sm border transition-all duration-150"
                style={
                  activeCategory === cat
                    ? {
                        background: CATEGORY_COLORS[cat],
                        color: '#fff',
                        borderColor: CATEGORY_COLORS[cat],
                      }
                    : {
                        background: 'transparent',
                        color: CATEGORY_COLORS[cat],
                        borderColor: CATEGORY_BG[cat],
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground font-mono">
          <span>{filtered.length} статей</span>
          {(activeCategory || activePlatform || searchQuery) && (
            <button
              onClick={() => {
                setActiveCategory(null);
                setActivePlatform(null);
                setSearchQuery('');
              }}
              className="flex items-center gap-1 text-foreground hover:text-destructive transition-colors"
            >
              <Icon name="X" size={10} />
              сбросить фильтры
            </button>
          )}
        </div>

        {/* Articles grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground animate-fade-in">
            <Icon name="SearchX" size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
            {filtered.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 mt-16 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>ThreatWiki — только в образовательных целях</span>
          <span>{articles.length} статей в базе</span>
        </div>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border bg-background/95 sticky top-0 z-10 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
            <Icon name="Bug" size={13} className="text-background" />
          </div>
          <span className="font-semibold text-sm tracking-tight">ThreatWiki</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Windows + Android
          </span>
        </div>
      </div>
    </header>
  );
}
