import React from 'react';
import Navbar from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="py-8 bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© {new Date().getFullYear()} Campus Expense Compass</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-1">Developed by</p>
              <p className="text-lg font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">Team Study Rankers</p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-xs opacity-80">VSAJ</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
