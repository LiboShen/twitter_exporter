/* global chrome */

const statusEl = document.getElementById("status");
document.getElementById("start").onclick = async () => {
  statusEl.textContent = "Running… switch to the profile tab.";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const limit = parseInt(document.getElementById("limit").value, 10) || 3200;
  chrome.tabs.sendMessage(tab.id, { type: "start-harvest", limit });
};

// receive harvested data, create download
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "finished") {
    const blob = new Blob([JSON.stringify(msg.data, null, 2)], {
      type: "application/json"
    });
    chrome.downloads.download({
      url: URL.createObjectURL(blob),
      filename: "tweets.json",
      saveAs: true
    });
    statusEl.textContent = `Done – exported ${msg.data.length} tweets.`;
  }
});
