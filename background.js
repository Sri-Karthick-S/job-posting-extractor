chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "logDetails") {
      console.log("Logging details in background:", message.data);
      sendResponse({ status: "logged" });
    }
  });
  