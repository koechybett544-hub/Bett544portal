package ke.ac.reberwet.jssportal

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import java.io.File
import java.io.FileOutputStream

/**
 * Native JavaScript Bridge exposed to the Reberwet JSS Web Portal as `window.AndroidBridge`
 */
class WebAppInterface(private val context: Context, private val webView: WebView) {

    @JavascriptInterface
    fun isAndroidApp(): Boolean {
        return true
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return "2.6.0"
    }

    @JavascriptInterface
    fun showToast(message: String) {
        webView.post {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun openInBrowser(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (_: Exception) {
            showToast("Could not open browser")
        }
    }

    @JavascriptInterface
    fun shareText(title: String, text: String) {
        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TITLE, title)
            putExtra(Intent.EXTRA_TEXT, text)
            type = "text/plain"
        }
        val shareIntent = Intent.createChooser(sendIntent, title)
        shareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(shareIntent)
    }

    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator?.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(durationMs)
                }
            }
        } catch (_: Exception) {
            // Graceful fallback if vibration permission not granted
        }
    }

    /**
     * Saves a generated PDF directly to the Android device's Downloads folder
     * Works on Android 7.0 through Android 15+ using MediaStore and Scoped Storage
     */
    @JavascriptInterface
    fun savePdfToDownloads(base64Data: String, fileName: String): Boolean {
        val cleanFileName = if (fileName.endsWith(".pdf", ignoreCase = true)) fileName else "$fileName.pdf"
        return saveBase64File(base64Data, cleanFileName, "application/pdf")
    }

    @JavascriptInterface
    fun savePdfToDocuments(base64Data: String, fileName: String): Boolean {
        return savePdfToDownloads(base64Data, fileName)
    }

    /**
     * Universal file saver for PDFs, CSVs, and documents.
     * Uses MediaStore.Downloads on Android 10+ (API 29+) which requires 0 storage permissions!
     * Fallbacks gracefully to public Downloads on older Android devices.
     */
    @JavascriptInterface
    fun saveBase64File(base64Data: String, fileName: String, mimeType: String): Boolean {
        return try {
            val cleanBase64 = if (base64Data.contains(",")) {
                base64Data.substringAfter(",")
            } else {
                base64Data
            }
            val fileBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
            val cleanFileName = fileName.replace("[/\\\\?%*:|\"<>]".toRegex(), "_")
            val cleanMime = when {
                mimeType.isNotBlank() && mimeType != "*/*" -> mimeType
                cleanFileName.endsWith(".pdf", ignoreCase = true) -> "application/pdf"
                cleanFileName.endsWith(".csv", ignoreCase = true) -> "text/csv"
                cleanFileName.endsWith(".docx", ignoreCase = true) -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                cleanFileName.endsWith(".png", ignoreCase = true) -> "image/png"
                cleanFileName.endsWith(".jpg", ignoreCase = true) || cleanFileName.endsWith(".jpeg", ignoreCase = true) -> "image/jpeg"
                else -> "application/octet-stream"
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+ (Scoped Storage): MediaStore.Downloads requires ZERO runtime permissions!
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, cleanFileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, cleanMime)
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }
                val resolver = context.contentResolver
                val uri: Uri? = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                if (uri != null) {
                    resolver.openOutputStream(uri)?.use { os ->
                        os.write(fileBytes)
                        os.flush()
                    }
                    contentValues.clear()
                    contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                    resolver.update(uri, contentValues, null, null)
                    showToast("Downloaded $cleanFileName to Downloads folder")
                    true
                } else {
                    showToast("Failed to create download file on Android device.")
                    false
                }
            } else {
                // Android 9 and lower: Legacy external storage
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                if (!downloadsDir.exists()) {
                    downloadsDir.mkdirs()
                }
                val file = File(downloadsDir, cleanFileName)
                FileOutputStream(file).use { fos ->
                    fos.write(fileBytes)
                    fos.flush()
                }
                MediaScannerConnection.scanFile(
                    context,
                    arrayOf(file.absolutePath),
                    arrayOf(cleanMime),
                    null
                )
                showToast("Downloaded $cleanFileName to Downloads folder")
                true
            }
        } catch (e: Exception) {
            e.printStackTrace()
            showToast("Download error: ${e.localizedMessage ?: e.message}")
            false
        }
    }
}
