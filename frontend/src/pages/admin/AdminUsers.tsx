import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Trash2, ChevronLeft, ChevronRight, UserPlus, KeyRound, Copy, Check } from 'lucide-react';
import { adminApi } from '../../api/modules/admin';
import type { Course, User } from '../../api/types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { Alert } from '../../components/ui/alert';
import { Dialog } from '../../components/ui/dialog';

type RoleFilter = 'all' | 'student' | 'instructor' | 'admin';

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'student', label: 'Estudiantes' },
  { value: 'instructor', label: 'Instructores' },
  { value: 'admin', label: 'Admins' },
];

const PAGE_SIZE = 10;

function UsersSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      <Card padding="none">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

interface CreateUserData {
  fullName: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  username: string;
  courseIds: string[];
}

export function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const currentSearch = searchParams.get('search') || '';
  const currentRole = (searchParams.get('role') as RoleFilter) || 'all';

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    temporaryPassword: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetCredentials, setResetCredentials] = useState<{
    temporaryPassword: string;
  } | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);

  const [createForm, setCreateForm] = useState<CreateUserData>({
    fullName: '',
    email: '',
    role: 'student',
    username: '',
    courseIds: [],
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
        });
        if (updates.search !== undefined || updates.role !== undefined) {
          next.set('page', '1');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        page: number;
        limit: number;
        search?: string;
        role?: string;
      } = {
        page: currentPage,
        limit: PAGE_SIZE,
      };
      if (currentSearch) params.search = currentSearch;
      if (currentRole !== 'all') params.role = currentRole;

      const result = await adminApi.listUsers(params);
      setUsers(result.data);
      setTotal(result.meta.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar usuarios',
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, currentRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    if (showCreateDialog && courses.length === 0) {
      adminApi.listCourses({ limit: 100, status: 'published' })
        .then((result) => setCourses(result.data))
        .catch(() => {});
    }
  }, [showCreateDialog, courses.length]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value });
    }, 300);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleLoading(userId);
    try {
      await adminApi.updateUser(userId, { role: newRole });
      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cambiar el rol del usuario',
      );
    } finally {
      setRoleLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await adminApi.disableUser(deletingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeletingUser(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al deshabilitar el usuario',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!createForm.fullName.trim()) {
      setCreateError('El nombre es requerido');
      return;
    }
    if (!createForm.email.trim()) {
      setCreateError('El email es requerido');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      setCreateError('Email no valido');
      return;
    }

    setCreateLoading(true);
    try {
      const result = await adminApi.createUser({
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        role: createForm.role,
        username: createForm.username.trim() || undefined,
        courseIds: createForm.role === 'student' ? createForm.courseIds : undefined,
      });

      setCreatedCredentials({
        username: result.user.username,
        temporaryPassword: result.temporaryPassword,
      });

      setCreateForm({
        fullName: '',
        email: '',
        role: 'student',
        username: '',
        courseIds: [],
      });

      await fetchUsers();
    } catch (err) {
      const apiError = err as { code?: string; message?: string };
      if (apiError.code === 'EMAIL_EXISTS') {
        setCreateError('Ya existe un usuario con ese email');
      } else if (apiError.code === 'USERNAME_EXISTS') {
        setCreateError('Ese nombre de usuario ya esta en uso');
      } else {
        setCreateError(apiError.message || 'Error al crear el usuario');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser) return;
    setResetLoading(true);
    try {
      const result = await adminApi.resetPassword(resetPasswordUser.id);
      setResetCredentials({ temporaryPassword: result.temporaryPassword });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al restablecer la contrasena',
      );
      setResetPasswordUser(null);
    } finally {
      setResetLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
    }
  };

  const generateUsername = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s.-]/g, '')
      .replace(/\s+/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .substring(0, 255);
  };

  const resetCreateForm = () => {
    setShowCreateDialog(false);
    setCreateError('');
    setCreatedCredentials(null);
    setCreateForm({
      fullName: '',
      email: '',
      role: 'student',
      username: '',
      courseIds: [],
    });
  };

  if (loading && users.length === 0) return <UsersSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion de Usuarios</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" aria-live="polite">
          <Alert variant="error" title="Error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {/* Search */}
      <div className="max-w-md">
        <label htmlFor="admin-user-search" className="sr-only">
          Buscar usuarios
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="admin-user-search"
            type="text"
            placeholder="Buscar por nombre, email o usuario..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm placeholder-gray-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-indigo-400"
            aria-label="Buscar usuarios"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ role: tab.value === 'all' ? '' : tab.value })}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              currentRole === tab.value
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {users.length === 0 && !loading ? (
        <Card>
          <EmptyState
            icon={<Search className="h-12 w-12" />}
            title={
              currentSearch || currentRole !== 'all'
                ? 'No se encontraron usuarios'
                : 'No hay usuarios'
            }
            message={
              currentSearch || currentRole !== 'all'
                ? 'Intenta con otros filtros de busqueda.'
                : 'Crea el primer usuario haciendo clic en "Nuevo usuario".'
            }
          />
        </Card>
      ) : (
        <Card padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Email Verificado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {user.username || '\u2014'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  </TableCell>
                  <TableCell>
                    <label htmlFor={`role-${user.id}`} className="sr-only">
                      Rol de {user.name}
                    </label>
                    <select
                      id={`role-${user.id}`}
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={roleLoading === user.id}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-indigo-400"
                    >
                      <option value="student">Estudiante</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.emailVerified
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {user.emailVerified ? '\u2713 Verificado' : 'Pendiente'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResetPasswordUser(user)}
                        title="Restablecer contrasena"
                      >
                        <KeyRound className="h-4 w-4 text-amber-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingUser(user)}
                        title="Deshabilitar usuario"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pagina {currentPage} de {totalPages} ({total} usuarios)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateParams({ page: String(currentPage - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateParams({ page: String(currentPage + 1) })}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={resetCreateForm}
        title="Crear nuevo usuario"
      >
        {createdCredentials ? (
          <div className="space-y-4">
            <Alert variant="success">
              Usuario creado correctamente. Guarda estas credenciales, solo se muestran una vez.
            </Alert>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Usuario</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {createdCredentials.username}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdCredentials.username, 'username')}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
                    title="Copiar usuario"
                  >
                    {copiedField === 'username' ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Contrasena temporal</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {createdCredentials.temporaryPassword}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdCredentials.temporaryPassword, 'password')}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
                    title="Copiar contrasena"
                  >
                    {copiedField === 'password' ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={resetCreateForm}>Cerrar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateUser} className="space-y-4">
            {createError && (
              <Alert variant="error">{createError}</Alert>
            )}
            <Input
              label="Nombre completo"
              type="text"
              value={createForm.fullName}
              onChange={(e) => {
                const name = e.target.value;
                setCreateForm((prev) => ({
                  ...prev,
                  fullName: name,
                  username: prev.username || generateUsername(name),
                }));
              }}
              required
              placeholder="Juan Perez"
            />
            <Input
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              placeholder="juan@email.com"
            />
            <div className="space-y-1">
              <label htmlFor="create-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rol
              </label>
              <select
                id="create-role"
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    role: e.target.value as CreateUserData['role'],
                    courseIds: [],
                  }))
                }
                className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="student">Estudiante</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Input
              label="Nombre de usuario"
              type="text"
              value={createForm.username}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Se genera automaticamente si se deja vacio"
            />
            {createForm.role === 'student' && courses.length > 0 && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cursos (opcional)
                </label>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-300 p-3 dark:border-gray-600">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center gap-2 py-1 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={createForm.courseIds.includes(course.id)}
                        onChange={(e) => {
                          setCreateForm((prev) => ({
                            ...prev,
                            courseIds: e.target.checked
                              ? [...prev.courseIds, course.id]
                              : prev.courseIds.filter((id) => id !== course.id),
                          }));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {course.title}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={resetCreateForm}>
                Cancelar
              </Button>
              <Button type="submit" loading={createLoading}>
                Crear usuario
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={!!resetPasswordUser}
        onClose={() => {
          setResetPasswordUser(null);
          setResetCredentials(null);
        }}
        title="Restablecer contrasena"
      >
        {resetCredentials ? (
          <div className="space-y-4">
            <Alert variant="success">
              Contrasena restablecida. Guarda esta contrasena temporal, solo se muestra una vez.
            </Alert>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Contrasena temporal</p>
                  <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    {resetCredentials.temporaryPassword}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(resetCredentials.temporaryPassword, 'reset-password')}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
                  title="Copiar contrasena"
                >
                  {copiedField === 'reset-password' ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              El usuario debera cambiar su contrasena al iniciar sesion.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setResetPasswordUser(null);
                  setResetCredentials(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Se generara una nueva contrasena temporal para{' '}
              <strong>{resetPasswordUser?.name}</strong> ({resetPasswordUser?.email}).
              El usuario debera cambiarla al iniciar sesion.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setResetPasswordUser(null);
                  setResetCredentials(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                loading={resetLoading}
                onClick={handleResetPassword}
              >
                Restablecer contrasena
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Deshabilitar Usuario"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Estas seguro de que deseas deshabilitar al usuario{' '}
            <strong>{deletingUser?.name}</strong> ({deletingUser?.email})?
            No podra iniciar sesion hasta que se reactive su cuenta.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeletingUser(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleDeleteUser}
            >
              Deshabilitar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
