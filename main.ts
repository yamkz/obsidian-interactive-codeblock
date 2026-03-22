import { Plugin } from "obsidian";

export default class InteractiveCodeblockPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor("interactive", (source, el) => {
			const container = el.createDiv({ cls: "interactive-codeblock-container" });
			const isDark = document.body.classList.contains("theme-dark");

			const srcdoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body {
    margin: 0;
    padding: 0;
    background: ${isDark ? "#1e1e1e" : "#ffffff"};
    color: ${isDark ? "#dcddde" : "#1a1a1a"};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
</style>
</head>
<body>
${source}
<script>
  function notifyHeight() {
    var h = document.documentElement.scrollHeight;
    parent.postMessage({ type: "interactive-codeblock-resize", height: h }, "*");
  }
  new MutationObserver(notifyHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
  window.addEventListener("load", notifyHeight);
  notifyHeight();
</script>
</body>
</html>`;

			const iframe = document.createElement("iframe");
			iframe.setAttribute("sandbox", "allow-scripts");
			iframe.setAttribute("srcdoc", srcdoc);
			iframe.style.height = "100px";
			container.appendChild(iframe);

			const handler = (event: MessageEvent) => {
				if (
					event.data &&
					event.data.type === "interactive-codeblock-resize" &&
					typeof event.data.height === "number"
				) {
					// Check that this message came from one of our iframes
					if (event.source === iframe.contentWindow) {
						iframe.style.height = event.data.height + "px";
					}
				}
			};
			window.addEventListener("message", handler);

			// Clean up listener when the element is removed
			const observer = new MutationObserver(() => {
				if (!el.isConnected) {
					window.removeEventListener("message", handler);
					observer.disconnect();
				}
			});
			observer.observe(el.parentElement || document.body, { childList: true, subtree: true });
		});
	}

	onunload() {}
}
