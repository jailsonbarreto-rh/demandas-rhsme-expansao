import fs from 'node:fs';

function replaceOnce(content, source, replacement, label) {
  const first = content.indexOf(source);
  if (first < 0) throw new Error(`Trecho não encontrado: ${label}`);
  if (content.indexOf(source, first + source.length) >= 0) throw new Error(`Trecho duplicado: ${label}`);
  return content.slice(0, first) + replacement + content.slice(first + source.length);
}

const filterPath = 'src/components/FilterPanel.tsx';
let filterPanel = fs.readFileSync(filterPath, 'utf8');
filterPanel = replaceOnce(
  filterPanel,
  `    onCommitSearch?.(cleanQuery);
    setSearchFocused(false);`,
  `    onCommitSearch?.(cleanQuery);`,
  'estado de foco após confirmar busca',
);
fs.writeFileSync(filterPath, filterPanel, 'utf8');

const appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');
const oldBlock = `  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState(() => loadRecentSearches());

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      navigate({ pathname: '/demandas', search: searchParams.toString() });
      window.setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 0);
    };

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [navigate, searchParams]);`;

const newBlock = `  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState(() => loadRecentSearches());
  const [searchFocusRequested, setSearchFocusRequested] = useState(false);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      setSearchFocusRequested(true);
      navigate({ pathname: '/demandas', search: searchParams.toString() });
    };

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [navigate, searchParams]);

  useEffect(() => {
    if (!searchFocusRequested || activeTab !== 'demandas' || data.loading) return;
    const frame = window.requestAnimationFrame(() => {
      const input = searchInputRef.current;
      if (!input) return;
      input.focus();
      input.select();
      setSearchFocusRequested(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, data.loading, searchFocusRequested]);`;

app = replaceOnce(app, oldBlock, newBlock, 'atalho e foco da busca');
fs.writeFileSync(appPath, app, 'utf8');
