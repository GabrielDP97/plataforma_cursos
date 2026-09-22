import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { AppLayout } from '../components/layout/AppLayout';

// Lazy-loaded pages — named exports require the .then() unwrap
const HomePage = lazy(() =>
  import('../pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const LoginPage = lazy(() =>
  import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const ChangePasswordPage = lazy(() =>
  import('../pages/auth/ChangePasswordPage').then((m) => ({
    default: m.ChangePasswordPage,
  }))
);
const AdminSetupPage = lazy(() =>
  import('../pages/internal/AdminSetupPage').then((m) => ({
    default: m.AdminSetupPage,
  }))
);
const CatalogPage = lazy(() =>
  import('../pages/catalog/CatalogPage').then((m) => ({
    default: m.CatalogPage,
  }))
);
const CourseDetailPage = lazy(() =>
  import('../pages/course/CourseDetailPage').then((m) => ({
    default: m.CourseDetailPage,
  }))
);
const CourseHome = lazy(() =>
  import('../pages/courses/CourseHome').then((m) => ({
    default: m.default,
  }))
);
const ModuleLanding = lazy(() =>
  import('../pages/courses/ModuleLanding').then((m) => ({
    default: m.default,
  }))
);
const LessonPage = lazy(() =>
  import('../pages/courses/LessonPage').then((m) => ({
    default: m.default,
  }))
);

// Student pages
const StudentDashboard = lazy(() =>
  import('../pages/student/StudentDashboard').then((m) => ({
    default: m.StudentDashboard,
  }))
);
const CoursePlayer = lazy(() =>
  import('../pages/course/CoursePlayer').then((m) => ({
    default: m.CoursePlayer,
  }))
);
const ProfilePage = lazy(() =>
  import('../pages/shared/ProfilePage').then((m) => ({
    default: m.ProfilePage,
  }))
);
const PrivacyPage = lazy(() =>
  import('../pages/shared/PrivacyPage').then((m) => ({
    default: m.PrivacyPage,
  }))
);

// Instructor pages
const InstructorDashboard = lazy(() =>
  import('../pages/instructor/InstructorDashboard').then((m) => ({
    default: m.InstructorDashboard,
  }))
);
const InstructorCourses = lazy(() =>
  import('../pages/instructor/InstructorCourses').then((m) => ({
    default: m.InstructorCourses,
  }))
);
const CreateCourse = lazy(() =>
  import('../pages/instructor/CreateCourse').then((m) => ({
    default: m.CreateCourse,
  }))
);
const CourseEditor = lazy(() =>
  import('../pages/instructor/CourseEditor').then((m) => ({
    default: m.CourseEditor,
  }))
);

// Admin pages
const AdminDashboard = lazy(() =>
  import('../pages/admin/AdminDashboard').then((m) => ({
    default: m.AdminDashboard,
  }))
);
const AdminUsers = lazy(() =>
  import('../pages/admin/AdminUsers').then((m) => ({
    default: m.AdminUsers,
  }))
);
const AdminCourses = lazy(() =>
  import('../pages/admin/AdminCourses').then((m) => ({
    default: m.AdminCourses,
  }))
);
const AdminCourseDetail = lazy(() =>
  import('../pages/admin/AdminCourseDetail').then((m) => ({
    default: m.AdminCourseDetail,
  }))
);

// Shared pages
const NotFoundPage = lazy(() =>
  import('../pages/shared/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  }))
);
const ContactPage = lazy(() =>
  import('../pages/contact/ContactPage').then((m) => ({
    default: m.ContactPage,
  }))
);

// Legal pages
const AvisoLegalPage = lazy(() =>
  import('../pages/legal/AvisoLegalPage').then((m) => ({
    default: m.AvisoLegalPage,
  }))
);
const PoliticaPrivacidadPage = lazy(() =>
  import('../pages/legal/PoliticaPrivacidadPage').then((m) => ({
    default: m.PoliticaPrivacidadPage,
  }))
);
const PoliticaCookiesPage = lazy(() =>
  import('../pages/legal/PoliticaCookiesPage').then((m) => ({
    default: m.PoliticaCookiesPage,
  }))
);
const CondicionesUsoPage = lazy(() =>
  import('../pages/legal/CondicionesUsoPage').then((m) => ({
    default: m.CondicionesUsoPage,
  }))
);
const CondicionesContratacionPage = lazy(() =>
  import('../pages/legal/CondicionesContratacionPage').then((m) => ({
    default: m.CondicionesContratacionPage,
  }))
);

// Loading fallback
function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

// Lazy route wrapper — renders Suspense around each lazy page
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Public routes with layout
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: (
          <LazyPage>
            <HomePage />
          </LazyPage>
        ),
      },
      {
        path: '/courses',
        element: (
          <LazyPage>
            <CatalogPage />
          </LazyPage>
        ),
      },
      {
        path: '/courses/:courseId',
        element: (
          <LazyPage>
            <CourseDetailPage />
          </LazyPage>
        ),
      },
      {
        path: '/courses/:courseId/home',
        element: (
          <LazyPage>
            <CourseHome />
          </LazyPage>
        ),
      },
      {
        path: '/courses/:courseId/modules/:moduleId',
        element: (
          <LazyPage>
            <ModuleLanding />
          </LazyPage>
        ),
      },
      {
        path: '/courses/:courseId/modules/:moduleId/lessons/:lessonId',
        element: (
          <LazyPage>
            <LessonPage />
          </LazyPage>
        ),
      },

      // Auth routes
      {
        path: '/login',
        element: (
          <LazyPage>
            <LoginPage />
          </LazyPage>
        ),
      },
      {
        path: '/contacto',
        element: (
          <LazyPage>
            <ContactPage />
          </LazyPage>
        ),
      },
      {
        path: '/aviso-legal',
        element: (
          <LazyPage>
            <AvisoLegalPage />
          </LazyPage>
        ),
      },
      {
        path: '/privacidad',
        element: (
          <LazyPage>
            <PoliticaPrivacidadPage />
          </LazyPage>
        ),
      },
      {
        path: '/cookies',
        element: (
          <LazyPage>
            <PoliticaCookiesPage />
          </LazyPage>
        ),
      },
      {
        path: '/condiciones-de-uso',
        element: (
          <LazyPage>
            <CondicionesUsoPage />
          </LazyPage>
        ),
      },
      {
        path: '/condiciones-de-contratacion',
        element: (
          <LazyPage>
            <CondicionesContratacionPage />
          </LazyPage>
        ),
      },
      {
        path: '/change-password',
        element: (
          <LazyPage>
            <ChangePasswordPage />
          </LazyPage>
        ),
      },

      // Admin setup (internal, not linked from any navigation)
      {
        path: '/internal/admin-setup',
        element: (
          <LazyPage>
            <AdminSetupPage />
          </LazyPage>
        ),
      },

      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/dashboard',
            element: (
              <LazyPage>
                <StudentDashboard />
              </LazyPage>
            ),
          },
          {
            path: '/learn/:courseId',
            element: (
              <LazyPage>
                <CoursePlayer />
              </LazyPage>
            ),
          },
          {
            path: '/learn/:courseId/lesson/:lessonId',
            element: (
              <LazyPage>
                <CoursePlayer />
              </LazyPage>
            ),
          },
          {
            path: '/profile',
            element: (
              <LazyPage>
                <ProfilePage />
              </LazyPage>
            ),
          },
          {
            path: '/settings/privacy',
            element: (
              <LazyPage>
                <PrivacyPage />
              </LazyPage>
            ),
          },
        ],
      },

      // Instructor routes
      {
        element: <ProtectedRoute requiredRole="instructor" />,
        children: [
          {
            path: '/instructor',
            element: (
              <LazyPage>
                <InstructorDashboard />
              </LazyPage>
            ),
          },
          {
            path: '/instructor/courses',
            element: (
              <LazyPage>
                <InstructorCourses />
              </LazyPage>
            ),
          },
          {
            path: '/instructor/courses/new',
            element: (
              <LazyPage>
                <CreateCourse />
              </LazyPage>
            ),
          },
          {
            path: '/instructor/courses/:courseId',
            element: (
              <LazyPage>
                <CourseEditor />
              </LazyPage>
            ),
          },
          {
            path: '/instructor/courses/:courseId/edit',
            element: (
              <LazyPage>
                <CourseEditor />
              </LazyPage>
            ),
          },
        ],
      },

      // Admin routes
      {
        element: <ProtectedRoute requiredRole="admin" />,
        children: [
          {
            path: '/admin',
            element: (
              <LazyPage>
                <AdminDashboard />
              </LazyPage>
            ),
          },
          {
            path: '/admin/users',
            element: (
              <LazyPage>
                <AdminUsers />
              </LazyPage>
            ),
          },
          {
            path: '/admin/courses',
            element: (
              <LazyPage>
                <AdminCourses />
              </LazyPage>
            ),
          },
          {
            path: '/admin/courses/:courseId',
            element: (
              <LazyPage>
                <AdminCourseDetail />
              </LazyPage>
            ),
          },
        ],
      },

      // 404
      {
        path: '*',
        element: (
          <LazyPage>
            <NotFoundPage />
          </LazyPage>
        ),
      },
    ],
  },
]);
