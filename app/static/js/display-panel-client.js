function showLayout(id) {
        if (!id || !layouts.includes(id)) return;
        document.querySelectorAll(".layout").forEach(sec => sec.classList.remove("active"));
        document.getElementById(id)?.classList.add("active");
        if (pill) pill.textContent = "Current: " + id;
        // update URL hash without reloading
        if (history.pushState) history.replaceState(null, "", location.pathname + "?id=" + encodeURIComponent(id));
}
const layouts = ["bible-search", "hymn-search", "display-announcement"];
const pill = document.getElementById("current-pill");


const channel = new BroadcastChannel("broadcast_channel");

channel.onmessage = (event) => {
  if (event.data.type === "layout_change") {
    showLayout(event.data.layout_id);
  }

};

function getEmbeddableSlidesUrl(input) {
  try {
    const u = new URL(input);

    const isGoogle = u.hostname.endsWith('google.com');
    const isSlides = u.pathname.includes('/presentation/');
    const isEmbed = u.pathname.includes('/embed') || u.pathname.includes('/pub');

    if (isGoogle && isSlides && isEmbed) return u.href;
    return null;
  } catch {
    // maybe the user pasted a full <iframe>; try to extract src=""
    const m = input.match(/src\s*=\s*"([^"]+)"/i);
    if (!m) return null;
    return getEmbeddableSlidesUrl(m[1]); // recurse check
  }
}
