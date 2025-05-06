/* global chrome */

// storage for collected tweets (key = tweet id)
const tweets = new Map();

function collectTweets() {
  // find visible tweet texts
  document
    .querySelectorAll('article div[data-testid="tweetText"]')
    .forEach(node => {
      const article   = node.closest('article');
      const timeEl    = article?.querySelector('time');
      const url       = timeEl?.parentElement?.href ?? "";
      const id        = url.match(/status\/(\d+)/)?.[1];
      if (!id || tweets.has(id)) return;

      tweets.set(id, {
        id,
        text: node.innerText.trim(),
        datetime: timeEl?.dateTime ?? "",
        url
      });
    });
}

async function scrollAndHarvest(limit = 3200) {
  let lastHeight = 0;
  while (tweets.size < limit) {
    collectTweets();

    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000)); // 1‑3 s

    const newHeight = document.body.scrollHeight;
    if (newHeight === lastHeight) break;          // end reached
    lastHeight = newHeight;
  }
  chrome.runtime.sendMessage({ type: "finished", data: [...tweets.values()] });
}

// Listen for start signal from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "start-harvest") {
    tweets.clear();
    scrollAndHarvest(msg.limit);
  }
});
