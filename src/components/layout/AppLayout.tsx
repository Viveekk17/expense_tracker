import React from 'react';
import Navbar from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background dark:bg-background transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
      <footer className="py-6 sm:py-8 bg-gray-900 dark:bg-gray-950 text-gray-100 mt-8 sm:mt-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm">© {new Date().getFullYear()} Walence</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-1">Developed by</p>
              <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">Team Study Rankers</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs opacity-80">VSAJ</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
