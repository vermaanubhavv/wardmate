import UIKit
import Capacitor
import WebKit
import AuthenticationServices

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = PrintingBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

/// The app's web view, with the three things the site cannot do from inside it.
///
/// Print: WKWebView ignores window.print(), so every Print button in the app was dead. The site
/// posts to the "print" handler instead (lib/print.ts) and the sheet goes to the native print
/// dialog, which also offers "Save to Files" as a PDF.
///
/// Google sign-in: Google refuses OAuth inside an embedded web view (disallowed_useragent). The
/// login page posts Supabase's Google URL to "googleSignIn" (app/login/page.tsx); it opens in
/// Apple's sign-in sheet, which Google accepts, and comes back to in.wardmate.app://auth/callback
/// with the one-time code. The web view then loads the site's own /auth/callback with that code,
/// which signs in exactly as the website does — the PKCE verifier is already in this web view's
/// cookies, set when the URL was asked for.
///
/// Swipe back: a swipe in from the left edge goes back a screen, as in Safari and every app.
class PrintingBridgeViewController: CAPBridgeViewController, WKScriptMessageHandler, ASWebAuthenticationPresentationContextProviding {
    private var authSession: ASWebAuthenticationSession?

    override func capacitorDidLoad() {
        webView?.configuration.userContentController.add(self, name: "print")
        webView?.configuration.userContentController.add(self, name: "googleSignIn")
        webView?.allowsBackForwardNavigationGestures = true
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "googleSignIn" {
            startGoogleSignIn(message.body as? String)
            return
        }
        guard let webView = webView else { return }
        let printer = UIPrintInteractionController.shared
        let info = UIPrintInfo(dictionary: nil)
        info.outputType = .general
        info.jobName = webView.title ?? "WardMate"
        printer.printInfo = info
        printer.printFormatter = webView.viewPrintFormatter()
        printer.present(animated: true)
    }

    private func startGoogleSignIn(_ link: String?) {
        // Only ever Supabase's own sign-in address — nothing else is opened from here.
        guard authSession == nil, let link = link, let url = URL(string: link),
              url.scheme == "https", url.host?.hasSuffix(".supabase.co") == true else { return }
        let session = ASWebAuthenticationSession(url: url, callbackURLScheme: "in.wardmate.app") { [weak self] callback, _ in
            DispatchQueue.main.async { self?.finishGoogleSignIn(callback) }
        }
        session.presentationContextProvider = self
        authSession = session
        if !session.start() { finishGoogleSignIn(nil) }
    }

    /// Hands the result to the site's /auth/callback, on whichever address the app is showing.
    /// A closed sheet arrives as error=cancelled, which the callback already turns into "you
    /// closed Google" on the sign-in page.
    private func finishGoogleSignIn(_ callback: URL?) {
        authSession = nil
        guard let webView = webView, let current = webView.url,
              var target = URLComponents(url: current, resolvingAgainstBaseURL: false) else { return }
        target.path = "/auth/callback"
        target.fragment = nil
        target.queryItems = callback.flatMap { URLComponents(url: $0, resolvingAgainstBaseURL: false)?.queryItems }
            ?? [URLQueryItem(name: "error", value: "cancelled")]
        if let url = target.url { webView.load(URLRequest(url: url)) }
    }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        view.window ?? ASPresentationAnchor()
    }
}
