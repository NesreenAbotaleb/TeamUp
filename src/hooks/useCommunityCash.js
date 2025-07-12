// hooks/useCommunityCache.js
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../api/API';

// Global cache object (persists across component unmounts)
const communityCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Global current active community code
let currentCommunityCode = null;

export const setCurrentCommunityCode = (code) => {
  currentCommunityCode = code;
  localStorage.setItem('currentCommunityCode', code);
};

export const getCurrentCommunityCode = () => {
  if (currentCommunityCode) return currentCommunityCode;
  return localStorage.getItem('currentCommunityCode');
};

const useCommunityCache = (code) => {
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Handle the case where code might be null initially
  const [finalCode, setFinalCode] = useState(code || getCurrentCommunityCode());
  const [prevCode, setPrevCode] = useState(null);
  
  // ✅ FIX: Initialize as true and be more careful about when we set it to false
  const isMountedRef = useRef(true);
  
  // ✅ FIX: Only set mounted to false on actual unmount
  useEffect(() => {
    isMountedRef.current = true; // Ensure it's true on mount
    console.log("🔧 Component mounted, isMountedRef set to true");
    
    return () => {
      console.log("🔧 Component unmounting, setting isMountedRef to false");
      isMountedRef.current = false;
    };
  }, []);

  // ✅ Update finalCode when code prop changes
  useEffect(() => {
    const newCode = code || getCurrentCommunityCode();
    console.log("📝 Code changed from", finalCode, "to", newCode);
    if (newCode !== finalCode) {
      setPrevCode(finalCode);
      setFinalCode(newCode);
    }
  }, [code]);

  // ✅ Define fetchCommunity directly in the hook
  const fetchCommunity = async (forceRefresh = false) => {
    console.log("🚀 fetchCommunity called with code:", finalCode, "forceRefresh:", forceRefresh, "isMounted:", isMountedRef.current);
    
    if (!finalCode) {
      console.log("❌ No finalCode provided");
      // ✅ Remove isMounted check for error states to ensure they're set
      setLoading(false);
      setError("No community code provided");
      return null;
    }

    // Check cache first (only if not forcing refresh)
    if (!forceRefresh) {
      const cachedData = communityCache.get(finalCode);
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
        console.log("📦 Using cached data for:", finalCode);
        // ✅ Always update state for cached data
        setCommunity(cachedData.data);
        setError(null);
        setLoading(false);
        return cachedData.data;
      }
    }

    // Set loading state before fetching
    console.log("⏳ Setting loading to true for:", finalCode, "isMounted:", isMountedRef.current);
    // ✅ Always set loading state
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("🌐 Making API call for:", finalCode);
      const response = await axios.get(`${api}/community/${finalCode}`, {
        headers: { Authorization: `${token}` }
      });

      const communityData = response.data;
      console.log("✅ API Response received:", communityData);
      console.log("🔍 API Response details:", {
        type: typeof communityData,
        isNull: communityData === null,
        isUndefined: communityData === undefined,
        keys: communityData ? Object.keys(communityData) : 'no keys',
        stringified: JSON.stringify(communityData, null, 2)
      });
      
      // Update cache
      communityCache.set(finalCode, {
        data: communityData,
        timestamp: Date.now()
      });
      console.log("💾 Data cached for:", finalCode);

      // ✅ ALWAYS update component state - remove isMounted check
      console.log("✅ Updating component state with data");
      setCommunity(communityData);
      setLoading(false);
      setError(null);
      
      return communityData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Failed to load community.";
      
      console.error("❌ Error fetching community:", errorMessage);
      
      // ✅ ALWAYS update error state
      setError(errorMessage);
      setLoading(false);
      setCommunity(null);
      
      return null;
    }
  };

  const getCachedCommunity = () => {
    const cached = communityCache.get(finalCode);
    return cached ? cached.data : null;
  };

  const invalidateCache = () => {
    if (finalCode) {
      communityCache.delete(finalCode);
    }
  };

  const updateCache = (updates) => {
    if (!finalCode) return;
    
    const existing = communityCache.get(finalCode);
    if (existing) {
      const updatedData = { ...existing.data, ...updates };
      communityCache.set(finalCode, {
        data: updatedData,
        timestamp: Date.now()
      });
      
      setCommunity(updatedData);
    }
  };

  const refetch = () => {
    return fetchCommunity(true);
  };

  // ✅ Effect that runs when finalCode changes
  const hasInitialized = useRef(false);
  
  useEffect(() => {
    console.log("🔄 useEffect triggered with finalCode:", finalCode, "prevCode:", prevCode, "isMounted:", isMountedRef.current);
    
    if (finalCode) {
      console.log("✅ Valid finalCode found, calling fetchCommunity");
      
      // Only reset community if we're switching to a different code (not from null to code)
      if (prevCode && prevCode !== finalCode) {
        console.log("🔄 Code changed from", prevCode, "to", finalCode, "- resetting community");
        setCommunity(null);
      }
      
      setError(null);
      
      // ⚠️ Prevent double calls on initial mount
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        console.log("🚀 First time initialization - calling fetchCommunity");
        fetchCommunity().catch(err => {
          console.error("Error in useEffect fetchCommunity:", err);
        });
      } else if (prevCode && prevCode !== finalCode) {
        console.log("🔄 Code changed - calling fetchCommunity");
        fetchCommunity().catch(err => {
          console.error("Error in useEffect fetchCommunity:", err);
        });
      }
    } else {
      console.log("❌ No finalCode, setting error state");
      setCommunity(null);
      setError("No community code provided");
      setLoading(false);
    }
  }, [finalCode]);

  // ✅ Debug effect to track state changes
  useEffect(() => {
    console.log("🔍 State Update:", {
      community: community ? "Data received" : "null",
      loading,
      error,
      finalCode,
      isMounted: isMountedRef.current
    });
  }, [community, loading, error, finalCode]);

  return {
    community,
    loading,
    error,
    fetchCommunity,
    getCachedCommunity,
    invalidateCache,
    updateCache,
    refetch
  };
};

export default useCommunityCache;