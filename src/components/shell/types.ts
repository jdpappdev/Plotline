import React from 'react';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Settings as SettingsIcon,
  Users,
} from 'lucide-react';
import { RouteId } from '../../domain/types';

export interface RouteConfig {
  id: RouteId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ROUTES: RouteConfig[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Projects', label: 'Projects', icon: FolderKanban },
  { id: 'Tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'Calendar', label: 'Calendar', icon: Calendar },
  { id: 'Analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'Team', label: 'Team', icon: Users },
  { id: 'Settings', label: 'Settings', icon: SettingsIcon },
  { id: 'Help', label: 'Help', icon: HelpCircle },
];

export const MOBILE_PRIMARY_TABS: RouteConfig[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'Calendar', label: 'Calendar', icon: Calendar },
  { id: 'Team', label: 'Team', icon: Users },
];

export const MOBILE_MORE_ROUTES: RouteConfig[] = [
  { id: 'Projects', label: 'Projects', icon: FolderKanban },
  { id: 'Analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'Settings', label: 'Settings', icon: SettingsIcon },
  { id: 'Help', label: 'Help', icon: HelpCircle },
];

export const TASK_CATEGORIES = [
  'Cartography',
  'Telemetry',
  'Interface',
  'Architecture',
  'Visualization',
  'Field Ops',
  'Outreach',
];

export function formatTimerHMS(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function resolveRouteFromLocation(): RouteId {
  if (typeof window === 'undefined') return 'Dashboard';
  const rawHash = window.location.hash;
  const cleanedHash = rawHash.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  if (cleanedHash) {
    const match = ROUTES.find((r) => r.id.toLowerCase() === cleanedHash);
    return match ? match.id : 'NotFound';
  }
  const cleanedPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!cleanedPath || cleanedPath === 'index.html') {
    return 'Dashboard';
  }
  const pathMatch = ROUTES.find((r) => r.id.toLowerCase() === cleanedPath);
  return pathMatch ? pathMatch.id : 'NotFound';
}
