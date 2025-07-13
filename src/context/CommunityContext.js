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

// In-memory storage utility functions (replacing localStorage)
const MemoryStorage = {
  cache: new Map(),
  
  // Save individual community cache
  saveCommunityCache: (cacheMap) => {
    try {
      MemoryStorage.cache.set('community_cache', cacheMap);
    } catch (error) {
      console.warn('Failed to save community cache:', error);
    }
  },

  // Load individual community cache
  loadCommunityCache: () => {
    try {
      return MemoryStorage.cache.get('community_cache') || new Map();
    } catch (error) {
      console.warn('Failed to load community cache:', error);
      return new Map();
    }
  },

  // Save communities list cache
  saveCommunitiesListCache: (cache) => {
    try {
      MemoryStorage.cache.set('communities_list', cache);
    } catch (error) {
      console.warn('Failed to save communities list cache:', error);
    }
  },

  // Load communities list cache
  loadCommunitiesListCache: () => {
    try {
      return MemoryStorage.cache.get('communities_list') || {
        data: [],
        timestamp: null,
        loading: false,
        error: null
      };
    } catch (error) {
      console.warn('Failed to load communities list cache:', error);
      return {
        data: [],
        timestamp: null,
        loading: false,
        error: null
      };
    }
  },

  // Clear all cache
  clearCache: () => {
    try {
      MemoryStorage.cache.clear();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },

  // Check if storage is available
  isStorageAvailable: () => {
    return true; // Memory storage is always available
  }
};

export const CommunityProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  
  // Initialize from memory storage
  const [communityCache, setCommunityCache] = useState(() => {
    return MemoryStorage.loadCommunityCache();
  });
  
  const [communitiesListCache, setCommunitiesListCache] = useState(() => {
    return MemoryStorage.loadCommunitiesListCache();
  });
  
  // Track ongoing requests to prevent duplicate API calls
  const [ongoingRequests, setOngoingRequests] = useState(new Set());

  // Constants
  const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
  const REQUEST_TIMEOUT = 10000; // 10 seconds

  // Persist cache whenever it changes
  useEffect(() => {
    MemoryStorage.saveCommunityCache(communityCache);
  }, [communityCache]);

  useEffect(() => {
    MemoryStorage.saveCommunitiesListCache(communitiesListCache);
  }, [communitiesListCache]);

  // Helper function to check if cache is expired
  const isCacheExpired = useCallback((timestamp) => {
    return !timestamp || Date.now() - timestamp > CACHE_EXPIRY_TIME;
  }, [CACHE_EXPIRY_TIME]);

  // Helper function to get auth token
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return token;
  }, [user?.token]);

  // Enhanced axios instance with timeout and error handling
  const createAxiosConfig = useCallback((token) => ({
    timeout: REQUEST_TIMEOUT,
    headers: { Authorization: `${token}` }
  }), [REQUEST_TIMEOUT]);

  // =================== INDIVIDUAL COMMUNITY FUNCTIONS ===================

  /**
   * Fetch a single community by code with caching
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
      setCommunityCache(prev => {
        const newCache = new Map(prev);
        newCache.set(code, {
          data: communityData,
          timestamp: Date.now()
        });
        return newCache;
      });

      // Also update in communities list cache if it exists there
      setCommunitiesListCache(prev => ({
        ...prev,
        data: prev.data.map(community => 
          community.code === code ? { ...community, ...communityData } : community
        ),
        timestamp: Date.now()
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
   * Update community in cache
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
      ),
      timestamp: Date.now()
    }));
  }, []);

  /**
   * Remove community from cache
   * @param {string} code - Community code
   */
  const removeCommunityFromCache = useCallback((code) => {
    if (!code) return;

    console.log(`Removing community from cache: ${code}`);

    // Remove from individual cache
    setCommunityCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(code);
      return newCache;
    });

    // Remove from list cache
    setCommunitiesListCache(prev => {
      const filteredData = prev.data.filter(community => 
        community.code !== code && 
        community.code_Comm !== code
      );
      
      return {
        ...prev,
        data: filteredData,
        timestamp: Date.now()
      };
    });

    console.log(`Community ${code} removed from cache`);
  }, []);

  // =================== COMMUNITIES LIST FUNCTIONS ===================

  /**
   * Fetch all communities with caching
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
   * @param {boolean} isUserCreated - Whether current user created this community
   */
  const addCommunityToCache = useCallback((newCommunity, isUserCreated = false) => {
    if (!newCommunity || (!newCommunity.code && !newCommunity.code_Comm)) {
      console.warn('Invalid community data for cache');
      return;
    }

    const communityCode = newCommunity.code || newCommunity.code_Comm;
    console.log(`Adding community to cache: ${communityCode}`);

    // Ensure proper structure
    const communityData = {
      ...newCommunity,
      members: newCommunity.members || [],
      memberCount: newCommunity.memberCount || (newCommunity.members?.length || 0),
      membersInfo: newCommunity.membersInfo || [],
      posts: newCommunity.posts || [],
      allTeams: newCommunity.allTeams || [],
      createdAt: newCommunity.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to individual cache
    setCommunityCache(prev => new Map(prev).set(communityCode, {
      data: communityData,
      timestamp: Date.now()
    }));

    // Add to list cache (avoid duplicates)
    setCommunitiesListCache(prev => {
      const exists = prev.data.some(community => 
        community.code === communityCode || 
        community.code_Comm === communityCode
      );
      
      if (exists) {
        return {
          ...prev,
          data: prev.data.map(community => {
            if (community.code === communityCode || community.code_Comm === communityCode) {
              return { ...community, ...communityData };
            }
            return community;
          }),
          timestamp: Date.now()
        };
      }
      
      return {
        ...prev,
        data: [...prev.data, communityData],
        timestamp: Date.now()
      };
    });

    console.log(`Successfully added community ${communityCode} to cache`);
  }, []);

  /**
   * Create community and add to cache
   * @param {Object} communityData - Community data
   * @param {Function} apiCall - API function to create community
   * @param {Object} currentUser - Current user
   */
  const createCommunityWithCache = useCallback(async (communityData, apiCall, currentUser) => {
    try {
      console.log('Creating community and updating cache...');
      
      // Call API to create community
      const response = await apiCall(communityData);
      const newCommunity = response.data || response;
      
      // Ensure the creator is added as a member
      const enrichedCommunity = {
        ...newCommunity,
        members: newCommunity.members || [{ 
          memberId: currentUser.id || currentUser.userId, 
          userId: currentUser.id || currentUser.userId,
          name: currentUser.name,
          email: currentUser.email,
          role: 'creator'
        }],
        memberCount: newCommunity.memberCount || 1,
        membersInfo: newCommunity.membersInfo || [{
          id: currentUser.id || currentUser.userId,
          name: currentUser.name,
          email: currentUser.email,
          role: 'creator'
        }],
        creatorId: currentUser.id || currentUser.userId
      };
      
      // Add to cache
      addCommunityToCache(enrichedCommunity, true);
      
      console.log('Community created and cached successfully');
      return enrichedCommunity;
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  }, [addCommunityToCache]);

  /**
   * Join community via API and update cache
   * @param {string} communityCode - Community code
   * @param {Function} apiCall - API function to join community
   * @param {Object} currentUser - Current user
   */
  const joinCommunityWithCache = useCallback(async (communityCode, apiCall, currentUser) => {
    try {
      console.log(`Joining community ${communityCode} and updating cache...`);
      
      // Call API to join community
      const response = await apiCall(communityCode);
      
      // Update cache with user join
      const userInfo = {
        id: currentUser.id || currentUser.userId,
        name: currentUser.name,
        email: currentUser.email,
        role: 'member'
      };
      
      joinCommunityInCache(communityCode, currentUser.id || currentUser.userId, userInfo);
      
      // Force refresh communities list to ensure consistency
      await fetchAllCommunities(true);
      
      console.log(`Successfully joined community ${communityCode}`);
      return response;
    } catch (error) {
      console.error('Error joining community:', error);
      throw error;
    }
  }, [fetchAllCommunities]);

  /**
   * Refresh community data after any operation
   * @param {string} communityCode - Community code
   */
  const refreshCommunityAfterOperation = useCallback(async (communityCode) => {
    try {
      console.log(`Refreshing community data for: ${communityCode}`);
      
      // Refresh specific community
      await fetchCommunity(communityCode, true);
      
      // Refresh communities list
      await fetchAllCommunities(true);
      
      console.log(`Successfully refreshed community data for: ${communityCode}`);
    } catch (error) {
      console.error('Error refreshing community data:', error);
    }
  }, [fetchCommunity, fetchAllCommunities]);

  // =================== COMMUNITY MEMBERSHIP FUNCTIONS ===================

  /**
   * Join community (update cache)
   * @param {string} communityCode - Community code
   * @param {string} userId - User ID
   * @param {Object} userInfo - Additional user information
   */
  const joinCommunityInCache = useCallback((communityCode, userId, userInfo = null) => {
    if (!communityCode || !userId) return;

    console.log(`Joining community in cache: ${communityCode} for user: ${userId}`);

    // Update individual community cache
    setCommunityCache(prev => {
      const newCache = new Map(prev);
      const existing = newCache.get(communityCode);
      
      if (existing) {
        const community = existing.data;
        const existingMember = community.members?.find(member => 
          member.memberId === userId || member.userId === userId
        );
        
        if (!existingMember) {
          const newMember = {
            memberId: userId,
            userId: userId,
            ...userInfo
          };
          
          const updatedCommunity = {
            ...community,
            members: [...(community.members || []), newMember],
            memberCount: (community.memberCount || 0) + 1,
            membersInfo: [...(community.membersInfo || []), userInfo].filter(Boolean)
          };
          
          newCache.set(communityCode, {
            data: updatedCommunity,
            timestamp: Date.now()
          });
        }
      }
      return newCache;
    });

    // Update communities list cache
    setCommunitiesListCache(prev => ({
      ...prev,
      data: prev.data.map(community => {
        if (community.code === communityCode || community.code_Comm === communityCode) {
          const existingMember = community.members?.find(member => 
            member.memberId === userId || member.userId === userId
          );
          
          if (!existingMember) {
            return {
              ...community,
              members: [...(community.members || []), { memberId: userId, userId, ...userInfo }],
              memberCount: (community.memberCount || 0) + 1,
              membersInfo: [...(community.membersInfo || []), userInfo].filter(Boolean)
            };
          }
        }
        return community;
      }),
      timestamp: Date.now()
    }));

    console.log(`Successfully joined community ${communityCode} in cache`);
  }, []);

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
    
    // Clear memory storage
    MemoryStorage.clearCache();
    
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
   * Refresh cache from memory storage
   */
  const refreshFromMemoryStorage = useCallback(() => {
    const memoryCommunityCache = MemoryStorage.loadCommunityCache();
    const memoryListCache = MemoryStorage.loadCommunitiesListCache();
    
    setCommunityCache(memoryCommunityCache);
    setCommunitiesListCache(memoryListCache);
    
    console.log('Cache refreshed from memory storage');
  }, []);

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
      cacheExpiry: CACHE_EXPIRY_TIME,
      storageAvailable: MemoryStorage.isStorageAvailable()
    };
  }, [communityCache.size, communitiesListCache, isCommunitiesListCacheExpired, ongoingRequests, CACHE_EXPIRY_TIME]);

  // =================== CLEANUP ===================

  // Cleanup expired cache entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredCache();
    }, CACHE_EXPIRY_TIME);

    return () => clearInterval(interval);
  }, [clearExpiredCache, CACHE_EXPIRY_TIME]);

  // Clear cache on user logout
  useEffect(() => {
    if (!user) {
      clearAllCache();
    }
  }, [user, clearAllCache]);

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
    
    // Enhanced join/create functions
    createCommunityWithCache,
    joinCommunityWithCache,
    refreshCommunityAfterOperation,
    
    // Membership functions
    joinCommunityInCache,
    leaveCommunityInCache,
    
    // Cache management
    isCommunitiesListCacheExpired,
    clearAllCache,
    clearExpiredCache,
    refreshFromMemoryStorage,
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
    createCommunityWithCache,
    joinCommunityWithCache,
    refreshCommunityAfterOperation,
    joinCommunityInCache,
    leaveCommunityInCache,
    isCommunitiesListCacheExpired,
    clearAllCache,
    clearExpiredCache,
    refreshFromMemoryStorage,
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