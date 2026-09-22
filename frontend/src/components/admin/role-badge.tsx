import { Badge } from '../ui/badge';

interface RoleBadgeProps {
  role: 'student' | 'instructor' | 'admin';
}

const roleConfig: Record<string, { label: string; variant: 'info' | 'success' | 'danger' }> = {
  student: { label: 'Estudiante', variant: 'info' },
  instructor: { label: 'Instructor', variant: 'success' },
  admin: { label: 'Admin', variant: 'danger' },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role] ?? roleConfig.student;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
