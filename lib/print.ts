/** Print the current page. Inside the iOS app WKWebView silently ignores window.print(), so the
 *  native shell (ios/App/App/SceneDelegate.swift) exposes a "print" message handler instead. */
export function printPage() {
  const native = (window as unknown as { webkit?: { messageHandlers?: { print?: { postMessage(m: unknown): void } } } })
    .webkit?.messageHandlers?.print;
  if (native) return native.postMessage(null);
  // An app build from before the handler existed: say so rather than leave a dead button.
  if (navigator.userAgent.includes("WardMateApp"))
    return alert("Printing needs the latest WardMate app. Open this page in Safari to print it for now.");
  window.print();
}
