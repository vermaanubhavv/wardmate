import UIKit
import Capacitor
import WebKit

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

/// WKWebView ignores window.print(), so every Print button in the app was dead. The site posts
/// to this handler instead (lib/print.ts) and the sheet goes to the native print dialog, which
/// also offers "Save to Files" as a PDF.
class PrintingBridgeViewController: CAPBridgeViewController, WKScriptMessageHandler {
    override func capacitorDidLoad() {
        webView?.configuration.userContentController.add(self, name: "print")
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let webView = webView else { return }
        let printer = UIPrintInteractionController.shared
        let info = UIPrintInfo(dictionary: nil)
        info.outputType = .general
        info.jobName = webView.title ?? "WardMate"
        printer.printInfo = info
        printer.printFormatter = webView.viewPrintFormatter()
        printer.present(animated: true)
    }
}
