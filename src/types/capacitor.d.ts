// Type definitions for Capacitor APIs
interface Window {
  Capacitor?: {
    Plugins: {
      Filesystem?: {
        writeFile: (options: {
          path: string;
          data: string;
          directory: string;
          encoding: string;
        }) => Promise<void>;
      };
      Share?: {
        share: (options: {
          title?: string;
          text?: string;
          url?: string;
          dialogTitle?: string;
        }) => Promise<void>;
      };
    };
  };
} 