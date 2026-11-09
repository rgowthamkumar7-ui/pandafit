import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PandaFit Error Boundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    if (window.confirm('Reset local cache and reload PandaFit?')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-sm w-full bg-white p-6 rounded-3xl border-2 border-[#302D35]/15 shadow-xl space-y-4">
            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center text-3xl">
              🐼
            </div>
            <h2 className="text-lg font-black text-[#302D35]">
              Panda-San had a tiny hiccup!
            </h2>
            <p className="text-xs text-[#302D35]/70 font-bold leading-relaxed">
              Something went wrong while rendering. Don't worry, your data is safe!
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-[#F97316] text-white text-xs font-black rounded-2xl shadow-md hover:bg-[#EA580C] transition-all"
              >
                Reload App
              </button>
              <button
                onClick={this.handleReset}
                className="py-3 px-4 bg-gray-100 text-gray-700 text-xs font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
              >
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
