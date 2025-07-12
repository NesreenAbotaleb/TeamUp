import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactComponent as SearchIcon } from './../../assets/svgs/search.svg';
import { Link } from 'react-router-dom';
import style from './style.module.css';

const SearchComponent = ({ 
  data = [], 
  placeholder = "Search...", 
  code_Comm, 
  teams,
  maxResults = 10,
  minQueryLength = 1,
  debounceMs = 300,
  onResultClick,
  userTeams
}) => { 
  const [query, setQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const debounceRef = useRef(null);

  // Enhanced filtering function
  const filterData = useCallback((searchQuery) => {
    if (!searchQuery || searchQuery.length < minQueryLength) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    
    return data
      .filter(item => {
        const name = String(item.name || '').toLowerCase();
        const userName = String(item.userName || '').toLowerCase();
        const communityName = String(item.communityName || '').toLowerCase();
        
        return name.includes(query) || 
               userName.includes(query) || 
               communityName.includes(query);
      })
      .slice(0, maxResults)
      .map(item => ({
        ...item,
        // Add relevance score for better sorting
        relevance: calculateRelevance(item, query)
      }))
      .sort((a, b) => b.relevance - a.relevance);
  }, [data, minQueryLength, maxResults]);

  // Calculate relevance score for sorting
  const calculateRelevance = (item, query) => {
    const name = String(item.name || '').toLowerCase();
    const userName = String(item.userName || '').toLowerCase();
    const communityName = String(item.communityName || '').toLowerCase();
    
    let score = 0;
    
    // Exact matches get highest score
    if (name === query) score += 100;
    if (userName === query) score += 100;
    if (communityName === query) score += 100;
    
    // Starts with matches get high score
    if (name.startsWith(query)) score += 50;
    if (userName.startsWith(query)) score += 50;
    if (communityName.startsWith(query)) score += 50;
    
    // Contains matches get base score
    if (name.includes(query)) score += 10;
    if (userName.includes(query)) score += 10;
    if (communityName.includes(query)) score += 10;
    
    return score;
  };

  console.log('userTeams : ' ,userTeams)

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setIsLoading(true);
      const results = filterData(query);
      setFilteredData(results);
      setIsOpen(query.length >= minQueryLength);
      setHighlightedIndex(-1);
      setIsLoading(false);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, filterData, minQueryLength, debounceMs]);

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (query.length >= minQueryLength) {
      setIsOpen(true);
    }
  };

  // Handle input blur
  const handleInputBlur = (e) => {
    // Delay closing to allow for clicks on results
    setTimeout(() => {
      if (!searchRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }, 150);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || filteredData.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredData.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredData.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const selectedItem = filteredData[highlightedIndex];
          handleResultClick(selectedItem);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle result click
  const handleResultClick = (item) => {
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    onResultClick?.(item);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setFilteredData([]);
    setHighlightedIndex(-1);
  };

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="search-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div 
      className={style.searchContainer} 
      ref={searchRef}
    >
      <div className={style.searchInputWrapper}>
        <SearchIcon className={style.searchIcon} />
        <input 
          type="text" 
          className={style.searchInput}
          placeholder={placeholder}
          value={query} 
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {query && (
          <button 
            className={style.searchClear}
            onClick={clearSearch}
            aria-label="Clear search"
            type="button"
          >
            ×
          </button>
        )}
        {isLoading && (
          <div className={style.searchLoading}>
            <div className={style.loadingSpinner}></div>
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className={style.searchResults} ref={resultsRef}>
          <ul className={style.resultsList} role="listbox">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <li 
                  key={item._id || index} 
                  className={style.resultItem}
                  role="option"
                  aria-selected={index === highlightedIndex}
                >
                  <Link 
                    to={`/community/${item.code_Comm || item._id}`} 
                    state={{ usersTeam : userTeams , teams : teams , users : data}}
                    className={style.resultLink}
                    onClick={() => handleResultClick(item)}
                  >
                    <div className={style.resultContent}>
                      <div className={style.resultName}>
                        {highlightText(item.name || item.communityName, query)}
                      </div>
                      <div className={style.resultUsername}>
                        {highlightText(item.userName, query)}
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className={style.noResults} role="option">
                <div className={style.noResultsContent}>
                  <span>No results found for "{query}"</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;