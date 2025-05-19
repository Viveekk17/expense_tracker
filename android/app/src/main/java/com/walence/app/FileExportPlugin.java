package com.walence.app;

import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

@CapacitorPlugin(name = "FileExport")
public class FileExportPlugin extends Plugin {
    private static final String TAG = "FileExportPlugin";

    @PluginMethod
    public void saveCSV(PluginCall call) {
        String csvContent = call.getString("csvContent");
        String fileName = call.getString("fileName", "expense-report.csv");

        if (csvContent == null) {
            call.reject("No CSV content provided");
            return;
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10 and above - use MediaStore
                saveFileUsingMediaStore(csvContent, fileName, call);
            } else {
                // Older Android versions - use direct file access
                saveFileUsingFileSystem(csvContent, fileName, call);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error saving CSV file", e);
            call.reject("Failed to save CSV file: " + e.getMessage());
        }
    }

    private void saveFileUsingMediaStore(String csvContent, String fileName, PluginCall call) {
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
        values.put(MediaStore.Downloads.MIME_TYPE, "text/csv");
        values.put(MediaStore.Downloads.IS_PENDING, 1);

        Context context = getContext();
        Uri uri = context.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);

        if (uri == null) {
            call.reject("Failed to create file in Downloads");
            return;
        }

        try (OutputStream os = context.getContentResolver().openOutputStream(uri)) {
            if (os == null) {
                call.reject("Failed to open output stream");
                return;
            }

            os.write(csvContent.getBytes());

            // Now update the state to not pending
            values.clear();
            values.put(MediaStore.Downloads.IS_PENDING, 0);
            context.getContentResolver().update(uri, values, null, null);

            JSObject result = new JSObject();
            result.put("uri", uri.toString());
            result.put("success", true);
            call.resolve(result);
        } catch (IOException e) {
            call.reject("Failed to write to file: " + e.getMessage());
        }
    }

    private void saveFileUsingFileSystem(String csvContent, String fileName, PluginCall call) throws IOException {
        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File csvFile = new File(downloadsDir, fileName);

        try (FileOutputStream fos = new FileOutputStream(csvFile)) {
            fos.write(csvContent.getBytes());
            JSObject result = new JSObject();
            result.put("uri", Uri.fromFile(csvFile).toString());
            result.put("success", true);
            call.resolve(result);
        }
    }
} 