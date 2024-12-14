 document.getElementById('extractButton').addEventListener('click', () => {
    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Send a message to the content script
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "extractJobDetails" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
              document.getElementById('status').textContent = "Error extracting job details.";
            } else {
              console.log("Job Details Response:", response);
              updatePopupUI(response.data);
            }
          }
        );
      }
    });
  });
  
  // Function to update the popup UI with job details
  function updatePopupUI(jobDetails) {
    document.getElementById('jobTitle').textContent = jobDetails.jobTitle || "N/A";
    document.getElementById('companyName').textContent = jobDetails.companyName || "N/A";
    document.getElementById('location').textContent = jobDetails.location || "N/A";
    document.getElementById('daysPosted').textContent = jobDetails.daysPosted || "N/A";
    document.getElementById('peopleApplied').textContent = jobDetails.peopleApplied || "N/A";
    document.getElementById('hirerInformation').textContent = jobDetails.hirerInformation || "N/A";
    const linkedInElement = document.getElementById('hirerLinkedIn');
    if (jobDetails.hirerLinkedIn && jobDetails.hirerLinkedIn !== "N/A") {
        linkedInElement.href = jobDetails.hirerLinkedIn;
        linkedInElement.textContent = "View LinkedIn Profile";
        linkedInElement.style.display = "inline";
    } else {
        linkedInElement.href = "#";
        linkedInElement.textContent = "N/A";
        linkedInElement.style.display = "inline";
    }
  }
  