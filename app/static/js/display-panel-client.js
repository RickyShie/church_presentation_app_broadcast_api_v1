function showLayout(id) {
        if (!id || !layouts.includes(id)) return;
        document.querySelectorAll(".layout").forEach(sec => sec.classList.remove("active"));
        document.getElementById(id)?.classList.add("active");
        if (pill) pill.textContent = "Current: " + id;
        // update URL hash without reloading
        if (history.pushState) history.replaceState(null, "", location.pathname + "?id=" + encodeURIComponent(id));
}

function displayBibleSearchResults(event) {
  const results = event.data.bible_search_results || [];
   // Which div gets which translation
  const containers = {
    KOUGO: "kougo-search-results",
    CUNP:  "cunp-search-results",
    NIV:   "niv-search-results",
  };

  // (optional) simple HTML escape
  const esc = (s) => String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

  // make one verse HTML block
  const verseHTML = (v) =>
    `<div class="verse"><sup class="verse-number">${v.verse}</sup>${esc(v.text)}</div>`;

  // group results by translation
  const byTrans = results.reduce((acc, r) => {
    (acc[r.translation] ||= []).push(r);
    return acc;
  }, {});

  // render into each container
  for (const [t, elId] of Object.entries(containers)) {
    const el = document.getElementById(elId);
    const items = byTrans[t] || [];
    el.innerHTML = items.length ? items.map(verseHTML).join("") : `<div class="muted">No results</div>`;
  }
}

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

const channel = new BroadcastChannel("broadcast_channel");
const bibleSearchResultsChannel = new BroadcastChannel("bible_search_results_channel");
const layouts = ["bible-search", "hymn-search", "display-announcement"];
const pill = document.getElementById("current-pill");

channel.onmessage = (event) => {
  if (event.data.type === "layout_change") {
    showLayout(event.data.layout_id);
  } else if (event.data.type === "bible_search") {
    displayBibleSearchResults(event);
  } else if (event.data.type === "set_sermon_metadata") {
    const sermon_metadata = event.data.sermon_metadata || {};
    service_type = document.getElementById("service-type");
    jp_sermon_topic = document.getElementById("jp-sermon-topic");
    cn_sermon_topic = document.getElementById("cn-sermon-topic");
    speaker_name = document.getElementById("speaker-name");
    interpreter_name = document.getElementById("interpreter-name");
    hymns = document.getElementById("hymns");
    pianist_name = document.getElementById("pianist-name");


    // Update new values extracted from sermon metadata form.
    service_type.textContent = sermon_metadata.service_type;
    jp_sermon_topic.textContent = sermon_metadata.jp_sermon_topic;
    cn_sermon_topic.textContent = sermon_metadata.cn_sermon_topic;
    speaker_name.textContent = `説教者：${sermon_metadata.speaker_name}`;
    interpreter_name.textContent = `通訳者：${sermon_metadata.interpreter_name}`;
    opening_hymn = sermon_metadata.opening_hymn;
    closing_hymn = sermon_metadata.closing_hymn;
    hymns.innerHTML = `讚美詩${opening_hymn}<br/>讚美詩${closing_hymn}`;
    pianist_name.textContent = `ピアノ：${sermon_metadata.pianist_name}`;
  }

};
