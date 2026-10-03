// Loads a script from a CDN only once, only when needed
const loaded = {};

export function loadScript(url) {
  if (!loaded[url]) {
    loaded[url] = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = url;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return loaded[url];
}

// Dark SweetAlert2 popup (falls back to a normal alert if the CDN is blocked)
export async function alertBox(options) {
  try {
    await loadScript("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js");
    return await window.Swal.fire({ background: "#14141d", color: "#f3f3fa", confirmButtonColor: "#a24bff", ...options });
  } catch (err) {
    window.alert(options.text || options.title);
  }
}
