import { Suspense, lazy, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './layouts/app-shell'
import { RouteError } from './route-error'
import { NotFoundPage } from '@/features/not-found/not-found-page'
import { PageFallback } from './page-fallback'

const DashboardPage = lazy(() =>
  import('@/features/dashboard/dashboard-page').then((module) => ({
    default: module.DashboardPage,
  })),
)
const ProjectsPage = lazy(() =>
  import('@/features/projects/projects-page').then((module) => ({
    default: module.ProjectsPage,
  })),
)
const ProjectNewPage = lazy(() =>
  import('@/features/projects/project-new-page').then((module) => ({
    default: module.ProjectNewPage,
  })),
)
const ProjectDetailPage = lazy(() =>
  import('@/features/projects/project-detail-page').then((module) => ({
    default: module.ProjectDetailPage,
  })),
)
const ProjectEditPage = lazy(() =>
  import('@/features/projects/project-edit-page').then((module) => ({
    default: module.ProjectEditPage,
  })),
)
const MonitorPage = lazy(() =>
  import('@/features/monitoring/monitor-page').then((module) => ({
    default: module.MonitorPage,
  })),
)
const AlertsPage = lazy(() =>
  import('@/features/alerts/alerts-page').then((module) => ({
    default: module.AlertsPage,
  })),
)
const ActivityPage = lazy(() =>
  import('@/features/activity/activity-page').then((module) => ({
    default: module.ActivityPage,
  })),
)
const ReportsPage = lazy(() =>
  import('@/features/reports/reports-page').then((module) => ({
    default: module.ReportsPage,
  })),
)
const SettingsPage = lazy(() =>
  import('@/features/settings/settings-page').then((module) => ({
    default: module.SettingsPage,
  })),
)

function page(node: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: page(<DashboardPage />) },
      { path: 'projects', element: page(<ProjectsPage />) },
      { path: 'projects/new', element: page(<ProjectNewPage />) },
      { path: 'projects/:id/edit', element: page(<ProjectEditPage />) },
      { path: 'projects/:id', element: page(<ProjectDetailPage />) },
      { path: 'monitor', element: page(<MonitorPage />) },
      { path: 'alerts', element: page(<AlertsPage />) },
      { path: 'activity', element: page(<ActivityPage />) },
      { path: 'reports', element: page(<ReportsPage />) },
      { path: 'settings', element: page(<SettingsPage />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
