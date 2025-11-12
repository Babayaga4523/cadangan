<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class ImageController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        try {
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                // Check if file is valid
                if (!$file->isValid()) {
                    return response()->json([
                        'error' => 'Invalid file uploaded'
                    ], 400);
                }
                
                $filename = time() . '_' . $file->getClientOriginalName();
                
                // Ensure the images directory exists
                $imagesPath = storage_path('app/public/images');
                if (!file_exists($imagesPath)) {
                    mkdir($imagesPath, 0755, true);
                }
                
                // Try to store the file
                $path = $file->storeAs('images', $filename, 'public');
                
                if (!$path) {
                    return response()->json([
                        'error' => 'Failed to store file'
                    ], 500);
                }
                
                // Generate the URL manually to ensure it works
                $url = URL::to('/storage/images/' . $filename);
                
                Log::info('Image uploaded successfully', [
                    'filename' => $filename,
                    'path' => $path,
                    'url' => $url,
                    'full_path' => storage_path('app/public/images/' . $filename)
                ]);
                
                return response()->json([
                    'url' => $url,
                    'filename' => $filename
                ]);
            }

            return response()->json([
                'error' => 'No image file uploaded'
            ], 400);
        } catch (\Exception $e) {
            Log::error('Image upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file_info' => $request->hasFile('image') ? [
                    'original_name' => $request->file('image')->getClientOriginalName(),
                    'size' => $request->file('image')->getSize(),
                    'mime' => $request->file('image')->getMimeType()
                ] : null
            ]);
            
            return response()->json([
                'error' => 'Failed to upload image',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}