import UIKit
import WebKit

final class WebViewController: UIViewController, WKNavigationDelegate {
    private lazy var webView: WKWebView = {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true

        let userContentController = WKUserContentController()
        userContentController.add(self, name: "koalaHabit")
        configuration.userContentController = userContentController

        let view = WKWebView(frame: .zero, configuration: configuration)
        view.navigationDelegate = self
        view.allowsBackForwardNavigationGestures = true
        view.scrollView.contentInsetAdjustmentBehavior = .never
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    private let errorLabel: UILabel = {
        let label = UILabel()
        label.isHidden = true
        label.numberOfLines = 0
        label.textAlignment = .center
        label.textColor = UIColor(red: 0.13, green: 0.21, blue: 0.17, alpha: 1)
        label.font = .systemFont(ofSize: 16, weight: .semibold)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.96, green: 0.95, blue: 0.92, alpha: 1)
        view.addSubview(webView)
        view.addSubview(errorLabel)

        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            errorLabel.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 24),
            errorLabel.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -24),
            errorLabel.centerYAnchor.constraint(equalTo: view.safeAreaLayoutGuide.centerYAnchor)
        ])

        loadApp()
    }

    private func loadApp() {
        guard let url = appURL() else {
            showError("Koala Habit URL is invalid.")
            return
        }

        errorLabel.isHidden = true
        webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 20))
    }

    private func appURL() -> URL? {
        let value = Bundle.main.object(forInfoDictionaryKey: "KoalaHabitWebURL") as? String
        let trimmed = value?.trimmingCharacters(in: .whitespacesAndNewlines)
        return URL(string: trimmed?.isEmpty == false ? trimmed! : "http://localhost:3006")
    }

    private func showError(_ message: String) {
        let target = appURL()?.absoluteString ?? "unknown URL"
        errorLabel.text = "\(message)\n\nTarget: \(target)\n\nRun npm run restart and make sure this device is on the same Wi-Fi as the Mac."
        errorLabel.isHidden = false
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showError(error.localizedDescription)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showError(error.localizedDescription)
    }
}

extension WebViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "koalaHabit",
              let payload = message.body as? [String: Any],
              let action = payload["action"] as? String
        else {
            return
        }

        if action == "reload" {
            loadApp()
        }
    }
}
