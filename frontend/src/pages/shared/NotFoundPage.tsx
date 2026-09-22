import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Code2 } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-xl shadow-indigo-500/20">
        <Code2 className="h-10 w-10 text-white" />
      </div>
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-xl font-semibold text-gray-900">Página no encontrada</p>
      <p className="mt-2 max-w-md text-gray-500">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link to="/" className="mt-8">
        <Button>Volver al Inicio</Button>
      </Link>
    </div>
  );
}
