import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import api from '../api/API';
import UserContext from './Usercontext';

const CommunityContext = createContext();

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

export const CommunityProvider = ({ children }) => {
  // Individual community cache (Map for O(1) lookup)
  const [communityCache, setCommunityCache] = useState(new Map());
  
  // Communities list cache (for all communities)
  const [communitiesListCache, setCommunitiesListCache] = useState({
    data: [],
    timestamp: null,
    loading: false,
    error: null
  });
  
  // Track ongoing requests to prevent duplicate API calls
  const [ongoingRequests, setOngoingRequests] = useState(new Set());
  
  const { user } = useContext(UserContext);

  // Constants
  const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
  const REQUEST_TIMEOUT = 10000; // 10 seconds

  // Helper function to check if cache is expired
  const isCacheExpired = useCallback((timestamp) => {
    return !timestamp || Date.now() - timestamp > CACHE_EXPIRY_TIME;
  }, []);

  // Helper function to get auth token
  const getAuthToken = useCallback(() => {
    const token = user?.token || localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }
    return token;
  }, [user?.token]);

  // Enhanced axios instance with timeout and error handling
  const createAxiosConfig = useCallback((token) => ({
    timeout: REQUEST_TIMEOUT,
    headers: { Authorization: `${token}` }
  }), []);

  // =================== INDIVIDUAL COMMUNITY FUNCTIONS ===================

  /**
   * Fetch a single community by code with caching and duplicate request prevention
   * @param {string} code - Community code
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} Community data
   */
  const fetchCommunity = useCallback(async (code, forceRefresh = false) => {
    if (!code) {
      throw new Error("Community code is required");
    }

    // Check cache first
    if (!forceRefresh && communityCache.has(code)) {
      const cachedData = communityCache.get(code);
      if (cachedData && !isCacheExpired(cachedData.timestamp)) {
        console.log(`Using cached community data for: ${code}`);
        return cachedData.data;
      }
    }

    // Prevent duplicate requests
    const requestKey = `community-${code}`;
    if (ongoingRequests.has(requestKey)) {
      // Wait for the ongoing request to complete
      await new Promise(resolve => {
        const checkRequest = () => {
          if (!ongoingRequests.has(requestKey)) {
            resolve();
          } else {
            setTimeout(checkRequest, 100);
          }
        };
        checkRequest();
      });
      
      // Return cached data if available
      const cachedData = communityCache.get(code);
      if (cachedData && !isCacheExpired(cachedData.timestamp)) {
        return cachedData.data;
      }
    }

    try {
      setOngoingRequests(prev => new Set(prev).add(requestKey));
      
      const token = getAuthToken();
      console.log(`Fetching community from API: ${code}`);
      
      const response = await axios.get(`${api}/community/${code}`, createAxiosConfig(token));
      const communityData = response.data;

      // Update cache
      setCommunityCache(prev => new Map(prev).set(code, {
        data: communityData,
        timestamp: Date.now()
      }));

      // Also update in communities list cache if it exists there
      setCommunitiesListCache(prev => ({
        ...prev,
        data: prev.data.map(community => 
          community.code === code ? { ...community, ...communityData } : community
        )
      }));

      return communityData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to load community.";
      console.error(`Error fetching community ${code}:`, error);
      throw new Error(errorMessage);
    } finally {
      setOngoingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
    }
  }, [communityCache, isCacheExpired, ongoingRequests, getAuthToken, createAxiosConfig]);

  /**
   * Get cached community data
   * @param {string} code - Community code
   * @returns {Object|null} Cached community data or null
   */
  const getCachedCommunity = useCallback((code) => {
    if (!code) return null;
    const cached = communityCache.get(code);
    return cached && !isCacheExpired(cached.timestamp) ? cached.data : null;
  }, [communityCache, isCacheExpired]);

  /**
   * Update community in cache (unified function)
   * @param {string} code - Community code
   * @param {Object} updates - Updates to apply
   */
  const updateCommunityCache = useCallback((code, updates) => {
    if (!code || !updates) return;

    // Update individual cache
    setCommunityCache(prev => {
      const newCache = new Map(prev);
      const existing = newCache.get(code);
      if (existing) {
        newCache.set(code, {
          ...existing,
          data: { ...existing.data, ...updates },
          timestamp: Date.now()
        });
      } else {
        // Create new entry if doesn't exist
        newCache.set(code, {
          data: updates,
          timestamp: Date.now()
        });
      }
      return newCache;
    });

    // Update communities list cache
    setCommunitiesListCache(prev => ({
      ...prev,
      data: prev.data.map(community => 
        community.code === code 
          ? { ...community, ...updates }
          : community
      )
    }));
  }, []);

  /**
   * Remove community from cache
   * @param {string} code - Community code
   */
  const removeCommunityFromCache = useCallback((code) => {
    if (!code) return;

    // Remove from individual cache
    setCommunityCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(code);
      return newCache;
    });

    // Remove from list cache
    setCommunitiesListCache(prev => ({
      ...prev,
      data: prev.data.filter(community => community.code !== code),
      timestamp: Date.now()
    }));
  }, []);

  // =================== COMMUNITIES LIST FUNCTIONS ===================

  /**
   * Fetch all communities with caching and duplicate request prevention
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} Array of communities
   */
  const fetchAllCommunities = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh && 
        communitiesListCache.data.length > 0 && 
        !isCacheExpired(communitiesListCache.timestamp)) {
      console.log('Using cached communities list');
      return communitiesListCache.data;
    }

    // Prevent duplicate requests
    const requestKey = 'communities-all';
    if (ongoingRequests.has(requestKey)) {
      // Wait for the ongoing request to complete
      await new Promise(resolve => {
        const checkRequest = () => {
          if (!ongoingRequests.has(requestKey)) {
            resolve();
          } else {
            setTimeout(checkRequest, 100);
          }
        };
        checkRequest();
      });
      
      // Return cached data if available
      if (communitiesListCache.data.length > 0 && 
          !isCacheExpired(communitiesListCache.timestamp)) {
        return communitiesListCache.data;
      }
    }

    try {
      setOngoingRequests(prev => new Set(prev).add(requestKey));
      setCommunitiesListCache(prev => ({ ...prev, loading: true, error: null }));

      const token = getAuthToken();
      console.log('Fetching communities list from API');
      
      const response = await axios.get(`${api}/community`, createAxiosConfig(token));
      const communities = response.data.communities || [];

      // Update list cache
      setCommunitiesListCache({
        data: communities,
        timestamp: Date.now(),
        loading: false,
        error: null
      });

      // Update individual community cache for each community
      setCommunityCache(prev => {
        const newCache = new Map(prev);
        communities.forEach(community => {
          if (community.code) {
            newCache.set(community.code, {
              data: community,
              timestamp: Date.now()
            });
          }
        });
        return newCache;
      });

      return communities;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to load communities.";
      
      setCommunitiesListCache(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      throw new Error(errorMessage);
    } finally {
      setOngoingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
    }
  }, [communitiesListCache, isCacheExpired, ongoingRequests, getAuthToken, createAxiosConfig]);

  /**
   * Get cached communities list
   * @returns {Array} Cached communities array
   */
  const getCachedCommunities = useCallback(() => {
    return communitiesListCache.data;
  }, [communitiesListCache.data]);

  /**
   * Get user's communities from cached list with memoization
   */
  const getUserCommunities = useMemo(() => {
    if (!user?.id) return [];
    return communitiesListCache.data.filter(community => 
      community.members?.some(member => 
        member.memberId === user.id || member.userId === user.id
      )
    );
  }, [communitiesListCache.data, user?.id]);

  /**
   * Add new community to cache
   * @param {Object} newCommunity - New community data
   */
  const addCommunityToCache = useCallback((newCommunity) => {
    if (!newCommunity || !newCommunity.code) {
      console.warn('Invalid community data for cache');
      return;
    }

    // Add to individual cache
    setCommunityCache(prev => new Map(prev).set(newCommunity.code, {
      data: newCommunity,
      timestamp: Date.now()
    }));

    // Add to list cache (avoid duplicates)
    setCommunitiesListCache(prev => {
      const exists = prev.data.some(community => community.code === newCommunity.code);
      if (exists) {
        return {
          ...prev,
          data: prev.data.map(community => 
            community.code === newCommunity.code ? { ...community, ...newCommunity } : community
          ),
          timestamp: Date.now()
        };
      }
      return {
        ...prev,
        data: [...prev.data, newCommunity],
        timestamp: Date.now()
      };
    });
  }, []);

  // =================== COMMUNITY MEMBERSHIP FUNCTIONS ===================

  /**
   * Join community (update cache)
   * @param {string} communityCode - Community code
   * @param {string} userId - User ID
   */
  const joinCommunityInCache = useCallback((communityCode, userId) => {
    if (!communityCode || !userId) return;

    const community = getCachedCommunity(communityCode);
    if (community) {
      const existingMember = community.members?.find(member => 
        member.memberId === userId || member.userId === userId
      );
      
      if (!existingMember) {
        const updates = {
          members: [...(community.members || []), { memberId: userId, userId }],
          memberCount: (community.memberCount || 0) + 1
        };
        updateCommunityCache(communityCode, updates);
      }
    }
  }, [getCachedCommunity, updateCommunityCache]);

  /**
   * Leave community (update cache)
   * @param {string} communityCode - Community code
   * @param {string} userId - User ID
   */
  const leaveCommunityInCache = useCallback((communityCode, userId) => {
    if (!communityCode || !userId) return;

    const community = getCachedCommunity(communityCode);
    if (community && community.members) {
      const filteredMembers = community.members.filter(member => 
        member.memberId !== userId && member.userId !== userId
      );
      
      const updates = {
        members: filteredMembers,
        memberCount: filteredMembers.length
      };
      updateCommunityCache(communityCode, updates);
    }
  }, [getCachedCommunity, updateCommunityCache]);

  // =================== CACHE MANAGEMENT FUNCTIONS ===================

  /**
   * Check if communities list cache is expired
   * @returns {boolean} True if expired
   */
  const isCommunitiesListCacheExpired = useCallback(() => {
    return isCacheExpired(communitiesListCache.timestamp);
  }, [communitiesListCache.timestamp, isCacheExpired]);

  /**
   * Clear all cache data
   */
  const clearAllCache = useCallback(() => {
    setCommunityCache(new Map());
    setCommunitiesListCache({
      data: [],
      timestamp: null,
      loading: false,
      error: null
    });
    setOngoingRequests(new Set());
    console.log('All cache cleared');
  }, []);

  /**
   * Clear expired cache entries
   */
  const clearExpiredCache = useCallback(() => {
    setCommunityCache(prev => {
      const newCache = new Map();
      for (const [key, value] of prev) {
        if (!isCacheExpired(value.timestamp)) {
          newCache.set(key, value);
        }
      }
      return newCache;
    });

    if (isCacheExpired(communitiesListCache.timestamp)) {
      setCommunitiesListCache(prev => ({
        ...prev,
        data: [],
        timestamp: null
      }));
    }
  }, [isCacheExpired, communitiesListCache.timestamp]);

  /**
   * Get cache statistics for debugging
   * @returns {Object} Cache statistics
   */
  const getCacheStats = useCallback(() => {
    return {
      individualCacheSize: communityCache.size,
      communitiesListSize: communitiesListCache.data.length,
      communitiesListExpired: isCommunitiesListCacheExpired(),
      lastFetch: communitiesListCache.timestamp ? new Date(communitiesListCache.timestamp).toLocaleString() : 'Never',
      ongoingRequests: Array.from(ongoingRequests),
      cacheExpiry: CACHE_EXPIRY_TIME
    };
  }, [communityCache.size, communitiesListCache, isCommunitiesListCacheExpired, ongoingRequests]);

  // =================== BACKGROUND CLEANUP ===================

  // Cleanup expired cache entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredCache();
    }, CACHE_EXPIRY_TIME);

    return () => clearInterval(interval);
  }, [clearExpiredCache]);

  // =================== CONTEXT VALUE ===================

  const contextValue = useMemo(() => ({
    // Individual community functions
    fetchCommunity,
    getCachedCommunity,
    updateCommunityCache,
    removeCommunityFromCache,
    
    // Communities list functions
    fetchAllCommunities,
    getCachedCommunities,
    getUserCommunities,
    addCommunityToCache,
    
    // Membership functions
    joinCommunityInCache,
    leaveCommunityInCache,
    
    // Cache management
    isCommunitiesListCacheExpired,
    clearAllCache,
    clearExpiredCache,
    getCacheStats,
    
    // State data
    allCommunities: communitiesListCache.data,
    userCommunities: getUserCommunities,
    communitiesLoading: communitiesListCache.loading,
    communitiesError: communitiesListCache.error,
    
    // Raw cache data (for debugging)
    communityCache: Object.fromEntries(communityCache),
    communitiesListCache
  }), [
    fetchCommunity,
    getCachedCommunity,
    updateCommunityCache,
    removeCommunityFromCache,
    fetchAllCommunities,
    getCachedCommunities,
    getUserCommunities,
    addCommunityToCache,
    joinCommunityInCache,
    leaveCommunityInCache,
    isCommunitiesListCacheExpired,
    clearAllCache,
    clearExpiredCache,
    getCacheStats,
    communitiesListCache,
    communityCache
  ]);

  return (
    <CommunityContext.Provider value={contextValue}>
      {children}
    </CommunityContext.Provider>
  );
};