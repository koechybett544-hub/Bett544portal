package ke.ac.reberwet.jssportal

import android.Manifest
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var offlineLayout: LinearLayout
    private lateinit var btnRetry: Button
    private lateinit var appInterface: WebAppInterface

    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    // Pending download parameters if runtime permission is needed (Android 9 and below)
    private var pendingDownloadUrl: String? = null
    private var pendingUserAgent: String? = null
    private var pendingContentDisposition: String? = null
    private var pendingMimetype: String? = null

    // Launcher for file selection (student photos, reports, csv)
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val intentData = result.data
            val results: Array<Uri>? = when {
                intentData?.clipData != null -> {
                    val count = intentData.clipData!!.itemCount
                    Array(count) { i -> intentData.clipData!!.getItemAt(i).uri }
                }
                intentData?.data != null -> {
                    arrayOf(intentData.data!!)
                }
                else -> null
            }
            fileUploadCallback?.onReceiveValue(results)
        } else {
            fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
    }

    // Permission launcher for older Android devices (API <= 28)
    private val storagePermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            pendingDownloadUrl?.let { url ->
                enqueueDownloadManager(
                    url,
                    pendingUserAgent ?: "",
                    pendingContentDisposition ?: "",
                    pendingMimetype ?: "application/octet-stream"
                )
            }
        } else {
            Toast.makeText(this, "Storage permission is required to save downloads on this Android version.", Toast.LENGTH_LONG).show()
        }
        pendingDownloadUrl = null
        pendingUserAgent = null
        pendingContentDisposition = null
        pendingMimetype = null
    }

    companion object {
        // Direct Standalone Reberwet Portal URL - Launches directly with zero AI Studio dependencies
        const val PRODUCTION_PORTAL_URL = "https://ais-pre-brto7rvnc34xdj7v3kvy3y-516798102925.europe-west2.run.app"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupWebView()
        setupBackNavigation()
        loadPortalUrl()
    }

    private fun initViews() {
        webView = findViewById(R.id.portal_webview)
        swipeRefreshLayout = findViewById(R.id.swipe_refresh_layout)
        progressBar = findViewById(R.id.loading_progress)
        offlineLayout = findViewById(R.id.layout_offline)
        btnRetry = findViewById(R.id.btn_retry_connection)

        swipeRefreshLayout.setColorSchemeColors(
            getColor(R.color.portal_maroon),
            getColor(R.color.portal_maroon_dark),
            getColor(R.color.portal_light_blue)
        )

        swipeRefreshLayout.setOnRefreshListener {
            if (isNetworkAvailable()) {
                offlineLayout.visibility = View.GONE
                webView.visibility = View.VISIBLE
                webView.reload()
            } else {
                swipeRefreshLayout.isRefreshing = false
                showOfflineNotice()
            }
        }

        btnRetry.setOnClickListener {
            if (isNetworkAvailable()) {
                offlineLayout.visibility = View.GONE
                webView.visibility = View.VISIBLE
                loadPortalUrl()
            } else {
                Toast.makeText(this, "No internet connection detected.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        // Cache configuration for fast loading and offline resilience
        settings.cacheMode = if (isNetworkAvailable()) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        // Custom User Agent identifier to tell portal it is running as a native Android app
        val defaultUserAgent = settings.userAgentString
        settings.userAgentString = "$defaultUserAgent ReberwetAndroidApp/2.6.0 StandaloneMobile"

        // Inject Native JavaScript Bridge
        appInterface = WebAppInterface(this, webView)
        webView.addJavascriptInterface(appInterface, "AndroidBridge")
        webView.addJavascriptInterface(appInterface, "Android")

        // Attach Clients
        webView.webViewClient = PortalWebViewClient(
            swipeRefreshLayout = swipeRefreshLayout,
            onPageFinishedListener = {
                progressBar.visibility = View.GONE
                offlineLayout.visibility = View.GONE
                webView.visibility = View.VISIBLE
            },
            onErrorListener = {
                if (!isNetworkAvailable()) {
                    showOfflineNotice()
                }
            }
        )

        webView.webChromeClient = PortalChromeClient(
            onFileChooser = { callback ->
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = callback

                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "application/pdf", "text/csv", "application/vnd.ms-excel"))
                }
                filePickerLauncher.launch(Intent.createChooser(intent, "Select File to Upload"))
            }
        )

        // Native Download Listener for report cards, certificates, CSV exports
        // Properly handles blob:, data:, and remote URLs without "permission not granted" failures
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            try {
                val guessedFileName = URLUtil.guessFileName(url, contentDisposition, mimetype)
                val finalFileName = if (guessedFileName.contains(".")) guessedFileName else "$guessedFileName.pdf"

                if (url.startsWith("data:")) {
                    // Direct base64 data URI handling via AndroidBridge (no DownloadManager error)
                    appInterface.saveBase64File(url, finalFileName, mimetype ?: "application/octet-stream")
                } else if (url.startsWith("blob:")) {
                    // Blob URLs cannot be handled by DownloadManager. Convert to base64 via JavaScript!
                    handleBlobDownload(url, finalFileName, mimetype ?: "application/pdf")
                } else {
                    // Standard remote HTTP/HTTPS URL
                    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
                        if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                            pendingDownloadUrl = url
                            pendingUserAgent = userAgent
                            pendingContentDisposition = contentDisposition
                            pendingMimetype = mimetype
                            storagePermissionLauncher.launch(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                            return@setDownloadListener
                        }
                    }
                    enqueueDownloadManager(url, userAgent, contentDisposition, mimetype)
                }
            } catch (e: Exception) {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                } catch (_: Exception) {
                    Toast.makeText(this, "Could not complete download: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    /**
     * Converts a local WebView blob: URL into base64 and saves it directly to Downloads.
     * Prevents the "permission not granted. download failed" error when downloading PDFs in WebViews!
     */
    private fun handleBlobDownload(blobUrl: String, fileName: String, mimeType: String) {
        val safeFileName = fileName.replace("'", "\\'").replace("\"", "\\\"")
        val safeMimeType = mimeType.replace("'", "\\'").replace("\"", "\\\"")
        val js = """
            (function() {
                try {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', '$blobUrl', true);
                    xhr.responseType = 'blob';
                    xhr.onload = function() {
                        if (this.status === 200 || this.status === 0) {
                            var blob = this.response;
                            var reader = new FileReader();
                            reader.readAsDataURL(blob);
                            reader.onloadend = function() {
                                if (window.AndroidBridge && typeof window.AndroidBridge.saveBase64File === 'function') {
                                    window.AndroidBridge.saveBase64File(reader.result, '$safeFileName', '$safeMimeType');
                                }
                            };
                        }
                    };
                    xhr.onerror = function() {
                        console.error('Blob download network error');
                    };
                    xhr.send();
                } catch(e) {
                    console.error('Blob convert error', e);
                }
            })();
        """.trimIndent()
        webView.evaluateJavascript(js, null)
    }

    private fun enqueueDownloadManager(url: String, userAgent: String, contentDisposition: String, mimetype: String) {
        val request = DownloadManager.Request(Uri.parse(url)).apply {
            setMimeType(mimetype)
            addRequestHeader("User-Agent", userAgent)
            setDescription("Downloading Reberwet JSS Document")
            setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype))
            setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            setDestinationInExternalPublicDir(
                Environment.DIRECTORY_DOWNLOADS,
                URLUtil.guessFileName(url, contentDisposition, mimetype)
            )
        }
        val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        dm.enqueue(request)
        Toast.makeText(this, "Downloading file to Downloads folder...", Toast.LENGTH_SHORT).show()
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun loadPortalUrl() {
        progressBar.visibility = View.VISIBLE
        webView.loadUrl(PRODUCTION_PORTAL_URL)
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    private fun showOfflineNotice() {
        offlineLayout.visibility = View.VISIBLE
        progressBar.visibility = View.GONE
    }
}
