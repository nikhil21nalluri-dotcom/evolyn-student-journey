import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider, useWorkspace, WorkspaceRole } from './context/WorkspaceContext';
import { LmsProvider } from './context/LmsContext';
import { InterventionProvider } from './context/InterventionContext';
import { GalaxyCanvas } from './components/GalaxyCanvas';
import { Navbar, AppView } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { ImpactSection } from './components/ImpactSection';
import { SimulatorSection } from './components/SimulatorSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { LiveDemoModal } from './components/LiveDemoModal';
import { AuthModal } from './components/auth/AuthModal';
import { WorkspaceAuthGate } from './components/auth/WorkspaceAuthGate';
import { StudentGrowthTrack } from './components/growth-track/StudentGrowthTrack';
import { SilentStruggleDetection } from './components/silent-struggle/SilentStruggleDetection';
import { RoleSelectionModal } from './components/workspace/RoleSelectionModal';
import { FacultyWorkspace } from './components/workspace/FacultyWorkspace';
import { StudentWorkspace } from './components/workspace/StudentWorkspace';
import { AdministratorWorkspace } from './components/workspace/AdministratorWorkspace';
import { StudentSegmentationPage } from './components/segmentation/StudentSegmentationPage';
import { SkillsPlacementWorkspacePage } from './components/workspace/SkillsPlacementWorkspacePage';
import { DataIntegrationWorkspace } from './components/workspace/DataIntegrationWorkspace';
import { SkillsPlacementProvider } from './context/SkillsPlacementContext';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'advisor' | 'educator' | 'student' | 'admin'>('advisor');
  const [currentView, setCurrentView] = useState<AppView>('landing');

  const {
    activeWorkspace,
    setActiveWorkspace,
    isRoleModalOpen,
    closeRoleModal,
    openRoleModal,
  } = useWorkspace();

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = Math.min(1, Math.max(0, window.scrollY / totalScroll));
        setScrollProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  // Synchronize currentView if activeWorkspace changes while in workspace views
  useEffect(() => {
    if (
      currentView === 'faculty-workspace' ||
      currentView === 'student-workspace' ||
      currentView === 'admin-workspace'
    ) {
      const targetView: AppView =
        activeWorkspace === 'faculty'
          ? 'faculty-workspace'
          : activeWorkspace === 'student'
          ? 'student-workspace'
          : 'admin-workspace';
      if (currentView !== targetView) {
        setCurrentView(targetView);
      }
    }
  }, [activeWorkspace, currentView]);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWorkspace = (role: WorkspaceRole) => {
    setActiveWorkspace(role);
    if (role === 'faculty') {
      setCurrentView('faculty-workspace');
    } else if (role === 'student') {
      setCurrentView('student-workspace');
    } else {
      setCurrentView('admin-workspace');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuthForRole = (role: 'advisor' | 'student' | 'admin') => {
    setAuthModalInitialRole(role);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-transparent text-[#f0f1ff] antialiased selection:bg-[#ff6a2b]/30 selection:text-white">
      {/* 3D WebGL Galaxy Background (Rendered at fixed z-0, visible behind all content) */}
      <GalaxyCanvas scrollProgress={scrollProgress} />

      {/* Navigation (Matching Template at z-50 with Workspace Switcher and Auth) */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenAuth={() => {
          setAuthModalInitialRole('advisor');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Content Flow */}
      <main className="relative z-10 w-full overflow-hidden bg-transparent">
        {currentView === 'landing' ? (
          <>
            {/* Landing Hero Section */}
            <HeroSection
              onOpenDemo={() => setIsDemoModalOpen(true)}
              onOpenGrowthTrack={() => handleNavigate('growth-track')}
              onOpenSilentStruggle={() => handleNavigate('silent-struggle')}
              onOpenWorkspace={handleOpenWorkspace}
              onOpenRoleModal={openRoleModal}
            />

            {/* Features Section */}
            <FeaturesSection onNavigate={handleNavigate} />

            {/* Impact Stats Section */}
            <ImpactSection />

            {/* Causal Intelligence & Simulator Section */}
            <SimulatorSection />

            {/* CTA Section */}
            <CtaSection onOpenDemo={() => setIsDemoModalOpen(true)} />

            {/* Footer */}
            <Footer />
          </>
        ) : currentView === 'faculty-workspace' ? (
          /* Dedicated Faculty / Advisor Workspace (Protected by Verified Auth) */
          isLoading ? (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-2 border-[#ff6a2b] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-[#a4a9d0]">Authenticating secure faculty session...</p>
            </div>
          ) : !user ? (
            <WorkspaceAuthGate
              requestedRole="faculty"
              onBackToLanding={() => handleNavigate('landing')}
            />
          ) : (
            <FacultyWorkspace
              onBackToLanding={() => handleNavigate('landing')}
              onOpenAuth={() => handleOpenAuthForRole('advisor')}
              onNavigate={handleNavigate}
            />
          )
        ) : currentView === 'student-workspace' ? (
          /* Dedicated Supportive Student Development Workspace (Always accessible, syncs with auth if signed in) */
          <StudentWorkspace
            onBackToLanding={() => handleNavigate('landing')}
            onOpenAuth={() => handleOpenAuthForRole('student')}
            onNavigate={handleNavigate}
          />
        ) : currentView === 'communication-practice' ? (
          /* Dedicated Fluencis Communication Practice & Growth Workspace */
          <StudentWorkspace
            initialTab="communication-growth"
            onBackToLanding={() => handleNavigate('landing')}
            onOpenAuth={() => handleOpenAuthForRole('student')}
            onNavigate={handleNavigate}
          />
        ) : currentView === 'admin-workspace' ? (
          /* Dedicated Institutional Administrator Workspace (Protected by Verified Auth) */
          isLoading ? (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-[#a4a9d0]">Authenticating secure administrator session...</p>
            </div>
          ) : !user ? (
            <WorkspaceAuthGate
              requestedRole="admin"
              onBackToLanding={() => handleNavigate('landing')}
            />
          ) : (
            <AdministratorWorkspace
              onBackToLanding={() => handleNavigate('landing')}
              onOpenAuth={() => handleOpenAuthForRole('admin')}
              onNavigate={handleNavigate}
            />
          )
        ) : currentView === 'growth-track' ? (
          /* Dedicated Student Growth Track Page */
          <StudentGrowthTrack
            onBackToLanding={() => handleNavigate('landing')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNavigate={handleNavigate}
          />
        ) : currentView === 'segments' ? (
          /* Dedicated Intelligent Student Segmentation Page */
          <StudentSegmentationPage
            onNavigate={handleNavigate}
            onSelectStudent={(studentId) => {
              handleNavigate('faculty-workspace');
            }}
          />
        ) : currentView === 'skills-placement' ? (
          /* Dedicated Skills & Placement Intelligence Page (Step 9) */
          <SkillsPlacementWorkspacePage
            onBackToLanding={() => handleNavigate('landing')}
            onNavigate={handleNavigate}
          />
        ) : currentView === 'data-integration' ? (
          /* Dedicated Student Data Integration, CSV Import & Validation Page (Step 11) */
          <DataIntegrationWorkspace
            onBackToLanding={() => handleNavigate('landing')}
            onNavigate={handleNavigate}
          />
        ) : (
          /* Dedicated Silent Struggle Detection Page */
          <SilentStruggleDetection
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Live Interactive Cohort Demo Modal */}
      <LiveDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      {/* Role Selection / Login Process Modal (Prompted on initial visit or when clicked) */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={closeRoleModal}
        onOpenAuthForRole={handleOpenAuthForRole}
        onNavigateToWorkspace={handleOpenWorkspace}
      />

      {/* Real-Time Login / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authModalInitialRole}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <LmsProvider>
          <InterventionProvider>
            <SkillsPlacementProvider>
              <MainApp />
            </SkillsPlacementProvider>
          </InterventionProvider>
        </LmsProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
