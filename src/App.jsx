import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { Search, Loader2, X, Star, Heart, Zap, Shield, Flame } from 'lucide-react';

const TYPE_COLORS = {
  fire: 'var(--fire)', water: 'var(--water)', grass: 'var(--grass)', 
  electric: 'var(--electric)', psychic: 'var(--psychic)', ice: 'var(--ice)', 
  dragon: 'var(--dragon)', dark: 'var(--dark-type)', fairy: 'var(--fairy)', 
  normal: 'var(--normal)', fighting: 'var(--fighting)', flying: 'var(--flying)', 
  poison: 'var(--poison)', ground: 'var(--ground)', rock: 'var(--rock)', 
  bug: 'var(--bug)', ghost: 'var(--ghost)', steel: 'var(--steel)',
};

const App = () => {
  const [allPokemon, setAllPokemon] = useState([]); // List all {name, url}
  const [displayedPokemon, setDisplayedPokemon] = useState([]); // Detailed objects
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoke, setSelectedPoke] = useState(null);
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;

  // 1. Fetch ALL pokemon names once
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300');
        const data = await res.json();
        const formatted = data.results.map((p, index) => ({
          name: p.name,
          url: p.url,
          id: index + 1
        }));
        setAllPokemon(formatted);
        loadDetails(formatted.slice(0, itemsPerPage));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

  // 2. Filter names based on search
  const filteredList = useMemo(() => {
    if (!searchTerm) return allPokemon;
    return allPokemon.filter(p => 
      p.name.includes(searchTerm.toLowerCase()) || p.id.toString() === searchTerm
    );
  }, [searchTerm, allPokemon]);

  // 3. Load details for a slice of pokemon
  const loadDetails = async (slice) => {
    setLoading(true);
    try {
      const details = await Promise.all(
        slice.map(async (p) => {
          const res = await fetch(p.url);
          return await res.json();
        })
      );
      setDisplayedPokemon(prev => {
        // Avoid duplicates
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNew = details.filter(item => !existingIds.has(item.id));
        return [...prev, ...uniqueNew];
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Search change
  useEffect(() => {
    if (searchTerm) {
      const topResults = filteredList.slice(0, 20);
      // Check if we already have details for these
      const needsFetch = topResults.filter(tr => !displayedPokemon.find(dp => dp.id === tr.id));
      if (needsFetch.length > 0) {
        loadDetails(needsFetch);
      }
    }
  }, [searchTerm, filteredList]);

  // 5. Load More
  const handleLoadMore = () => {
    const nextBatch = allPokemon.slice(displayedPokemon.length, displayedPokemon.length + itemsPerPage);
    loadDetails(nextBatch);
  };

  const currentView = useMemo(() => {
    return displayedPokemon
      .filter(p => p.name.includes(searchTerm.toLowerCase()) || p.id.toString() === searchTerm)
      .sort((a, b) => a.id - b.id);
  }, [displayedPokemon, searchTerm]);

  return (
    <div className="app">
      <header className="header">
        <div className="container header-flex">
          <div className="logo-section">
            <div className="logo-icon"><Flame fill="white" /></div>
            <h1>PokéVerse</h1>
          </div>
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <X size={18} className="clear-search" onClick={() => setSearchTerm('')} />}
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div className="container">
          <div className="hero-text">
            <h2>Catch 'Em All In Style</h2>
            <p>Explore all {allPokemon.length} Pokémon in our premium database.</p>
          </div>
        </div>
      </section>

      <main className="container">
        <div className="pokemon-grid">
          {currentView.map((p) => (
            <div 
              key={p.id} 
              className="poke-card" 
              onClick={() => setSelectedPoke(p)}
              style={{ '--type-color': p.types?.[0] ? TYPE_COLORS[p.types[0].type.name] : '#777' }}
            >
              <div className="card-bg-glow"></div>
              <span className="poke-id">#{p.id.toString().padStart(3, '0')}</span>
              <div className="poke-img">
                <img 
                  src={p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default} 
                  alt={p.name} 
                  loading="lazy"
                />
              </div>
              <div className="poke-info">
                <h3>{p.name}</h3>
                <div className="types">
                  {p.types?.map(t => (
                    <span key={t.type.name} className="type-badge" style={{ backgroundColor: TYPE_COLORS[t.type.name] }}>
                      {t.type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="loading-state">
            <Loader2 className="spinner" size={48} />
          </div>
        )}

        {!loading && !searchTerm && displayedPokemon.length < allPokemon.length && (
          <div className="load-more">
            <button onClick={handleLoadMore}>Load More</button>
          </div>
        )}

        {!loading && searchTerm && currentView.length === 0 && (
          <div className="loading-state">
            <p>No Pokémon found matching "{searchTerm}"</p>
          </div>
        )}
      </main>

      {/* Modal Details */}
      {selectedPoke && (
        <div className="modal-overlay" onClick={() => setSelectedPoke(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ '--type-color': selectedPoke.types?.[0] ? TYPE_COLORS[selectedPoke.types[0].type.name] : '#777' }}>
            <button className="close-btn" onClick={() => setSelectedPoke(null)}>×</button>
            <div className="modal-header">
              <div className="modal-img">
                <img src={selectedPoke.sprites?.other?.['official-artwork']?.front_default || selectedPoke.sprites?.front_default} alt={selectedPoke.name} />
              </div>
              <div className="modal-title-info">
                <span className="modal-id">#{selectedPoke.id.toString().padStart(3, '0')}</span>
                <h2>{selectedPoke.name}</h2>
                <div className="types">
                  {selectedPoke.types?.map(t => (
                    <span key={t.type.name} className="type-badge" style={{ backgroundColor: TYPE_COLORS[t.type.name] }}>
                      {t.type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="stats-grid">
                {selectedPoke.stats?.map(s => (
                  <div key={s.stat.name} className="stat-row">
                    <div className="stat-label"><span>{s.stat.name}</span></div>
                    <div className="stat-bar-container">
                      <div className="stat-bar" style={{ width: `${Math.min(100, (s.base_stat / 150) * 100)}%`, backgroundColor: 'var(--type-color)' }}></div>
                    </div>
                    <span className="stat-value">{s.base_stat}</span>
                  </div>
                ))}
              </div>
              <div className="info-cards">
                <div className="info-item">
                  <span className="label">Height</span>
                  <span className="value">{selectedPoke.height / 10} m</span>
                </div>
                <div className="info-item">
                  <span className="label">Weight</span>
                  <span className="value">{selectedPoke.weight / 10} kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>&copy; 2026 PokéVerse. Total indexed: {allPokemon.length}</p>
      </footer>
    </div>
  );
};

export default App;
