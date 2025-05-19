import { registerPlugin } from '@capacitor/core';

// Define the interface for our plugin
export interface FileExportPlugin {
  saveCSV(options: { csvContent: string; fileName?: string }): Promise<{ uri: string; success: boolean }>;
}

// Register the plugin
const FileExport = registerPlugin<FileExportPlugin>('FileExport');

// Export a utility function to save CSV content
export const saveCSVToDevice = async (
  csvContent: string,
  fileName: string = 'expense-report.csv'
): Promise<string> => {
  try {
    // Check if we're running on a device with the plugin
    if (window.Capacitor && FileExport) {
      const result = await FileExport.saveCSV({
        csvContent,
        fileName
      });
      
      if (result.success) {
        console.log('File saved successfully on device at:', result.uri);
        return result.uri;
      }
    }
    throw new Error('FileExport plugin not available');
  } catch (e) {
    console.error('Error saving file with FileExport plugin:', e);
    throw e;
  }
}; 