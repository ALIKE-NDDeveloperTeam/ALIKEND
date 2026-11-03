import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App runtime error caught by boundary:', error, errorInfo);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

    // Auto-recover from dynamic module loading errors (e.g. after deployment or Vite dev server rebuild)
    const isModuleError =
      error?.name === 'ChunkLoadError' ||
      /failed to fetch dynamically imported module/i.test(error?.message || '') ||
      /loading chunk/i.test(error?.message || '');

    if (isModuleError && typeof window !== 'undefined') {
      const key = 'eb_dynamic_import_reloaded';
      const lastReload = sessionStorage.getItem(key);
      const now = Date.now();
      // Allow auto-reload if not reloaded within the last 15 seconds
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    try {
      sessionStorage.removeItem('eb_dynamic_import_reloaded');
<<<<<<< HEAD
=======
=======
  }

  private handleReload = () => {
    try {
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      const isDynamicImport =
        this.state.error?.name === 'ChunkLoadError' ||
        /failed to fetch dynamically imported module/i.test(this.state.error?.message || '') ||
        /loading chunk/i.test(this.state.error?.message || '');

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-2 uppercase">
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            {isDynamicImport ? 'মডিউল সিঙ্ক আপডেট / Module Sync' : 'Application Recovery'}
          </h1>
          <p className="text-neutral-400 text-sm max-w-md mb-6 leading-relaxed">
            {isDynamicImport
              ? 'অ্যাপ্লিকেশনের নতুন মডিউল লোড সম্পন্ন করতে নিচে রিলোড বা রিফ্রেশ চাপুন।'
              : 'A temporary display sync occurred. Click below to refresh the page and restore the application view.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>পুনরায় চেষ্টা করুন (Try Again)</span>
            </button>
<<<<<<< HEAD
=======
=======
            Application Recovery
          </h1>
          <p className="text-neutral-400 text-sm max-w-md mb-6 leading-relaxed">
            A temporary display sync occurred. Click below to refresh the page and restore the application view.
          </p>
          <div className="flex gap-3">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Reset Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
