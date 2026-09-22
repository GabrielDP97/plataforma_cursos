import { useState, useEffect } from 'react';
import { userApi, type ConsentData } from '../../api/modules/user';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert } from '../../components/ui/alert';
import { Dialog } from '../../components/ui/dialog';
import { Download } from 'lucide-react';

function PrivacySkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-8 w-56" />
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-48" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function PrivacyPage() {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Cancel delete state
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const data = await userApi.getConsent();
        setConsent(data);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || 'No se pudo cargar la información de consentimiento');
      } finally {
        setLoading(false);
      }
    };

    fetchConsent();
  }, []);

  const handleExport = async () => {
    setExportError('');
    setExportSuccess('');
    setExporting(true);
    try {
      await userApi.exportData();
      setExportSuccess('Descarga iniciada correctamente');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setExportError(apiError.message || 'No se pudieron descargar los datos');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== 'ELIMINAR') return;

    setDeleteError('');
    setDeleting(true);
    try {
      const result = await userApi.deleteAccount();
      setDeleteSuccess(result.message || 'Tu cuenta será eliminada en 30 días. Puedes cancelar desde esta página.');
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setDeleteError(apiError.message || 'No se pudo procesar la solicitud');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = async () => {
    setCancelError('');
    setCancelling(true);
    try {
      const result = await userApi.cancelDeleteAccount();
      setCancelSuccess(result.message || 'Eliminación cancelada correctamente');
      setDeleteSuccess('');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setCancelError(apiError.message || 'No se pudo cancelar la eliminación');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <PrivacySkeleton />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Privacidad y datos</h1>

      {/* Data Export Section */}
      <Card>
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Tus datos</h2>
          <p className="text-sm text-gray-600">
            Descarga una copia de los datos asociados a tu cuenta.
          </p>

          {exportSuccess && (
            <Alert variant="success">{exportSuccess}</Alert>
          )}
          {exportError && (
            <Alert variant="error">{exportError}</Alert>
          )}

          <Button
            variant="outline"
            onClick={handleExport}
            loading={exporting}
            disabled={exporting}
          >
            <Download className="h-4 w-4" />
            Descargar mis datos
          </Button>
        </div>
      </Card>

      {/* Consent Section */}
      <Card>
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Consentimiento</h2>

          {error && !consent ? (
            <Alert variant="error">{error}</Alert>
          ) : consent && consent.history.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Versión aceptada:</span> {consent.currentVersion}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Fecha de aceptación:</span>{' '}
                {formatDate(consent.history[consent.history.length - 1].acceptedAt)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay registros de consentimiento</p>
          )}
        </div>
      </Card>

      {/* Account Deletion Section */}
      <Card>
        <div className="space-y-4">
          <h2 className="font-semibold text-red-600">Eliminar cuenta</h2>

          <Alert variant="warning">
            <div className="space-y-1">
              <p className="font-medium">⚠️ Esta acción iniciará el proceso de eliminación de tu cuenta.</p>
              <p>Tienes un periodo de gracia de 30 días para cancelar. Después de este periodo, tus datos serán eliminados permanentemente.</p>
            </div>
          </Alert>

          {deleteSuccess && (
            <div className="space-y-3">
              <Alert variant="warning">{deleteSuccess}</Alert>
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                loading={cancelling}
                disabled={cancelling}
              >
                Cancelar eliminación
              </Button>
            </div>
          )}

          {cancelSuccess && (
            <Alert variant="success">{cancelSuccess}</Alert>
          )}

          {cancelError && (
            <Alert variant="error">{cancelError}</Alert>
          )}

          {!deleteSuccess && (
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              Solicitar eliminación
            </Button>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText('');
          setDeleteError('');
        }}
        title="⚠️ Eliminar cuenta"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Esta acción iniciará el proceso de eliminación de tu cuenta.
          </p>
          <p className="text-sm text-gray-600">
            Tienes un periodo de gracia de 30 días durante el cual puedes cancelar la eliminación.
          </p>
          <p className="text-sm text-gray-600">
            Después de este periodo, todos tus datos serán eliminados permanentemente.
          </p>

          {deleteError && (
            <Alert variant="error">{deleteError}</Alert>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Para confirmar, escribe ELIMINAR:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              disabled={deleting}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
                setDeleteError('');
              }}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleteConfirmText !== 'ELIMINAR' || deleting}
            >
              Eliminar cuenta
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
