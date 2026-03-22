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
    var scrollH = document.documentElement.scrollHeight;
    var offsetH = document.body.offsetHeight;
    var h = Math.max(scrollH, offsetH);
    parent.postMessage({ type: "interactive-codeblock-resize", height: h }, "*");
  }
  new MutationObserver(notifyHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(notifyHeight).observe(document.body);
  }
  window.addEventListener("load", function() {
    notifyHeight();
    setTimeout(notifyHeight, 100);
    setTimeout(notifyHeight, 500);
    setTimeout(notifyHeight, 1000);
  });
  notifyHeight();
</script>
</body>
</html>`;

			const iframe = document.createElement("iframe");
			iframe.setAttribute("sandbox", "allow-scripts");
			iframe.setAttribute("srcdoc", srcdoc);
			iframe.style.height = "300px";
			container.appendChild(iframe);

			const handler = (event: MessageEvent) => {
				if (
					event.data &&
					event.data.type === "interactive-codeblock-resize" &&
					typeof event.data.height === "number"
				) {
					if (event.source === iframe.contentWindow) {
						iframe.style.height = (event.data.height + 20) + "px";
					}
				}
			};
			window.addEventListener("message", handler);

			// Wait for iframe load, then trigger resize
			iframe.addEventListener("load", () => {
				try {
					iframe.contentWindow?.postMessage({ type: "interactive-codeblock-request-resize" }, "*");
				} catch (_) { /* sandbox may block */ }
				// Delayed resizes to catch late-rendering content
				setTimeout(() => {
					try {
						iframe.contentWindow?.postMessage({ type: "interactive-codeblock-request-resize" }, "*");
					} catch (_) { /* sandbox may block */ }
				}, 200);
				setTimeout(() => {
					try {
						iframe.contentWindow?.postMessage({ type: "interactive-codeblock-request-resize" }, "*");
					} catch (_) { /* sandbox may block */ }
				}, 600);
			});

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
