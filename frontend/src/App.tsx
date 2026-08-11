import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TenantProvider } from '@/context/TenantContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppRoutes } from '@/routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <AppRoutes />
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  );
};

export default App;
