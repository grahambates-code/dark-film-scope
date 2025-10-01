import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface DeckGLInstance {
  id: string;
  lastVisibleTime: number;
}

interface DeckGLManagerContextValue {
  registerInstance: (id: string) => boolean;
  unregisterInstance: (id: string) => void;
  updateVisibility: (id: string, isVisible: boolean) => void;
  canMount: (id: string) => boolean;
}

const DeckGLManagerContext = createContext<DeckGLManagerContextValue | null>(null);

const MAX_INSTANCES = 4;

export const DeckGLManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mountedInstances, setMountedInstances] = useState<Map<string, DeckGLInstance>>(new Map());
  const visibilityTracking = useRef<Map<string, number>>(new Map());

  const canMount = useCallback((id: string) => {
    return mountedInstances.has(id) || mountedInstances.size < MAX_INSTANCES;
  }, [mountedInstances.size]);

  const registerInstance = useCallback((id: string): boolean => {
    if (mountedInstances.has(id)) {
      return true; // Already registered
    }

    if (mountedInstances.size >= MAX_INSTANCES) {
      // Find least recently visible instance to unmount
      let oldestId: string | null = null;
      let oldestTime = Infinity;

      mountedInstances.forEach((instance, instanceId) => {
        if (instance.lastVisibleTime < oldestTime) {
          oldestTime = instance.lastVisibleTime;
          oldestId = instanceId;
        }
      });

      if (oldestId) {
        setMountedInstances(prev => {
          const newMap = new Map(prev);
          newMap.delete(oldestId);
          return newMap;
        });
      } else {
        return false; // Can't register if we can't find one to remove
      }
    }

    // Register the new instance
    setMountedInstances(prev => {
      const newMap = new Map(prev);
      newMap.set(id, {
        id,
        lastVisibleTime: Date.now()
      });
      return newMap;
    });

    return true;
  }, [mountedInstances]);

  const unregisterInstance = useCallback((id: string) => {
    setMountedInstances(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    visibilityTracking.current.delete(id);
  }, []);

  const updateVisibility = useCallback((id: string, isVisible: boolean) => {
    if (isVisible) {
      visibilityTracking.current.set(id, Date.now());
      
      // Update the lastVisibleTime for mounted instances
      setMountedInstances(prev => {
        if (!prev.has(id)) return prev;
        const newMap = new Map(prev);
        const instance = newMap.get(id);
        if (instance) {
          newMap.set(id, {
            ...instance,
            lastVisibleTime: Date.now()
          });
        }
        return newMap;
      });
    }
  }, []);

  const value: DeckGLManagerContextValue = {
    registerInstance,
    unregisterInstance,
    updateVisibility,
    canMount
  };

  return (
    <DeckGLManagerContext.Provider value={value}>
      {children}
    </DeckGLManagerContext.Provider>
  );
};

export const useDeckGLManager = () => {
  const context = useContext(DeckGLManagerContext);
  if (!context) {
    throw new Error('useDeckGLManager must be used within DeckGLManagerProvider');
  }
  return context;
};
