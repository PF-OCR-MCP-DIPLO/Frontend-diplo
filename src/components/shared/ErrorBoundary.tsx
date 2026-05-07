import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatePanel } from '@/components/shared/StatePanel';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Render error captured by ErrorBoundary', error, info.componentStack);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.assign('/');
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className='page-stack'>
        <StatePanel
          tone='warning'
          icon={AlertTriangle}
          title='Algo fallo al mostrar esta pantalla'
          description='La aplicacion sigue activa. Puedes reintentar la carga o volver al inicio.'
          actions={
            <div className='flex flex-wrap gap-3'>
              <Button type='button' onClick={this.handleReload} className='gap-2'>
                <RefreshCw className='size-4' />
                Recargar
              </Button>
              <Button type='button' variant='outline' onClick={this.handleGoHome} className='gap-2'>
                <Home className='size-4' />
                Inicio
              </Button>
            </div>
          }
        />
        {import.meta.env.DEV ? (
          <pre className='overflow-auto rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground'>
            {this.state.error.stack ?? this.state.error.message}
          </pre>
        ) : null}
      </div>
    );
  }
}
