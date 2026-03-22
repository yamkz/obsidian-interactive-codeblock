import { Plugin } from "obsidian";

export default class InteractiveCodeblockPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor("interactive", (source, el) => {
			const container = el.createDiv({ cls: "interactive-codeblock-container" });
			const isDark = document.body.classList.contains("theme-dark");

			// Skeleton UI with shimmer effect
			const skeleton = container.createDiv({ cls: "interactive-codeblock-skeleton" });

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
  var lastHeight = 0;
  function notifyHeight() {
    var scrollH = document.documentElement.scrollHeight;
    var offsetH = document.body.offsetHeight;
    var h = Math.max(scrollH, offsetH);
    if (h !== lastHeight) {
      lastHeight = h;
      parent.postMessage({ type: "interactive-codeblock-resize", height: h }, "*");
    }
  }
  new MutationObserver(notifyHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(notifyHeight).observe(document.body);
  }
  window.addEventListener("load", function() {
    notifyHeight();
    setTimeout(notifyHeight, 300);
  });
  notifyHeight();
</script>
</body>
</html>`;

			const iframe = document.createElement("iframe");
			iframe.setAttribute("sandbox", "allow-scripts");
			iframe.setAttribute("srcdoc", srcdoc);
			iframe.style.height = "1px";
			iframe.style.opacity = "0";
			iframe.style.position = "absolute";
			container.appendChild(iframe);

			let currentHeight = 0;

			const handler = (event: MessageEvent) => {
				if (
					event.data &&
					event.data.type === "interactive-codeblock-resize" &&
					typeof event.data.height === "number"
				) {
					if (event.source === iframe.contentWindow) {
						const newHeight = event.data.height;
						if (newHeight > 0 && newHeight !== currentHeight) {
							currentHeight = newHeight;
							iframe.style.height = newHeight + "px";
							iframe.style.position = "relative";
						}
						// Show iframe, hide skeleton
						if (newHeight > 0 && skeleton.parentElement) {
							skeleton.classList.add("interactive-codeblock-skeleton-hide");
							iframe.classList.add("interactive-codeblock-iframe-show");
							setTimeout(() => skeleton.remove(), 300);
						}
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
