const TenantError = () => {
  const tenantId = import.meta.env.VITE_TENANT_ID || '(not set)';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration Error</h1>
        <p className="text-gray-600 mb-4">
          Unable to load tenant configuration for{' '}
          <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">{tenantId}</code>.
        </p>
        <p className="text-gray-500 text-sm">
          Please ensure the <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">VITE_TENANT_ID</code> environment variable is set to a valid tenant identifier.
        </p>
      </div>
    </div>
  );
};

export default TenantError;
