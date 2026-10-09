import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { STUDENT_GROWTH_DATA } from '../data/studentGrowthData';

export type WorkspaceRole = 'faculty' | 'student' | 'admin';

interface WorkspaceContextType {
  activeWorkspace: WorkspaceRole;
  setActiveWorkspace: (role: WorkspaceRole) => void;
  selectedStudentId: string;
  setSelectedStudentId: (studentId: string) => void;
  isRoleModalOpen: boolean;
  openRoleModal: () => void;
  closeRoleModal: () => void;
  hasSelectedInitialRole: boolean;
  selectRoleAndWorkspace: (role: WorkspaceRole, autoRedirect?: boolean) => void;
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'evolyn_workspace_role';
const ROLE_CHOSEN_KEY = 'evolyn_role_chosen_session';
const DEMO_MODE_STORAGE_KEY = 'evolyn_is_demo_mode';

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, user } = useAuth();
  
  // Default to stored role or faculty
  const [activeWorkspace, setActiveWorkspaceState] = useState<WorkspaceRole>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    if (saved === 'faculty' || saved === 'student' || saved === 'admin') {
      return saved;
    }
    return 'faculty';
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>('arjun-kumar');
  
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    return saved !== 'false';
  });

  const setIsDemoMode = (isDemo: boolean) => {
    setIsDemoModeState(isDemo);
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(isDemo));
  };
  
  // Prompt user whenever they open Evolyn
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(() => {
    // Show on each new page visit/session unless explicitly dismissed
    const sessionSeen = sessionStorage.getItem(ROLE_CHOSEN_KEY);
    return !sessionSeen;
  });

  const [hasSelectedInitialRole, setHasSelectedInitialRole] = useState<boolean>(() => {
    return !!sessionStorage.getItem(ROLE_CHOSEN_KEY);
  });

  // Sync with userProfile role if signed in
  useEffect(() => {
    if (userProfile?.role) {
      if (userProfile.role === 'student') {
        setActiveWorkspaceState('student');
        if (userProfile.displayName || userProfile.email) {
          const match = STUDENT_GROWTH_DATA.find((s) => {
            const name = (userProfile.displayName || '').toLowerCase().trim();
            const email = (userProfile.email || '').toLowerCase().trim();
            if (!name && !email) return false;
            return (
              (name && (name.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(name))) ||
              (email && (email.includes(s.id) || email.includes(s.name.toLowerCase().replace(/\s+/g, ''))))
            );
          });
          if (match) {
            setSelectedStudentId(match.id);
          }
        }
      } else if (userProfile.role === 'admin') {
        setActiveWorkspaceState('admin');
      } else {
        setActiveWorkspaceState('faculty');
      }
    }
  }, [userProfile]);

  const setActiveWorkspace = (role: WorkspaceRole) => {
    setActiveWorkspaceState(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  };

  const selectRoleAndWorkspace = (role: WorkspaceRole) => {
    setActiveWorkspace(role);
    sessionStorage.setItem(ROLE_CHOSEN_KEY, 'true');
    setHasSelectedInitialRole(true);
    setIsRoleModalOpen(false);
  };

  const openRoleModal = () => setIsRoleModalOpen(true);
  const closeRoleModal = () => {
    sessionStorage.setItem(ROLE_CHOSEN_KEY, 'true');
    setIsRoleModalOpen(false);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        setActiveWorkspace,
        selectedStudentId,
        setSelectedStudentId,
        isRoleModalOpen,
        openRoleModal,
        closeRoleModal,
        hasSelectedInitialRole,
        selectRoleAndWorkspace,
        isDemoMode,
        setIsDemoMode,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
