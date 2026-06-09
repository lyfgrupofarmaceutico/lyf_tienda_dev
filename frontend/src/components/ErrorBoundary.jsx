import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * ErrorBoundary - Captura errores de renderizado en componentes hijos
 *
 * Uso:
 * <ErrorBoundary>
 *   <ComponenteQuePuedeFallar />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturó un error:", error, errorInfo);
    this.setState({ errorInfo });

    // En producción, podrías enviar el error a un servicio de monitoreo
    if (import.meta.env.PROD) {
      // TODO: Integrar con Sentry o similar
      console.error("[PROD ERROR]", error.message);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bgPrimario p-4">
          <div className="max-w-md w-full bg-bgSecundario rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>

            <h1 className="text-2xl font-bold text-primario mb-2">
              ¡Ups! Algo salió mal
            </h1>

            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. No te preocupes, puedes intentar recargar la página.
            </p>

            {/* Mostrar detalles del error solo en desarrollo */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left bg-gray-100 rounded p-3 text-xs font-mono overflow-auto max-h-40">
                <summary className="cursor-pointer font-semibold text-gray-700">
                  Detalles del error (solo desarrollo)
                </summary>
                <p className="mt-2 text-red-600">{this.state.error.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 text-gray-600 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primario text-white rounded-md hover:bg-secundario transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Recargar página
              </button>

              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Home className="h-4 w-4" />
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
