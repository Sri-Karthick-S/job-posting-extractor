function extractJobId(url) {
  const match = url.match(/currentJobId=(\d+)/);
  return match ? match[1] : null;
}

function constructJobUrl(jobId) {
  return `https://www.linkedin.com/jobs/view/${jobId}`;
}

document.getElementById('extractButton').addEventListener('click', () => {
  const loadingElement = document.getElementById('loading');
  const jobDetailsElement = document.getElementById('jobDetails');
  const extractButton = document.getElementById('extractButton');

  // Show loading state
  loadingElement.classList.add('visible');
  extractButton.style.display = 'none';

  // Query the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      const jobId = extractJobId(tabs[0].url);
      const jobUrl = jobId ? constructJobUrl(jobId) : null;

      // Send a message to the content script
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: "extractJobDetails",
          jobUrl: jobUrl
        },
        (response) => {
          // Hide loading state
          loadingElement.classList.remove('visible');

          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
            extractButton.style.display = 'block';
            extractButton.textContent = 'Error extracting details. Try again.';
          } else {
            console.log("Job Details Response:", response);
            updatePopupUI({
              ...response.data,
              jobUrl: jobUrl
            });
            jobDetailsElement.classList.add('visible');
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
  document.getElementById('description').textContent = jobDetails.description || "N/A";
  document.getElementById('location').textContent = jobDetails.location || "N/A";
  document.getElementById('daysPosted').textContent = jobDetails.daysPosted || "N/A";
  document.getElementById('peopleApplied').textContent = jobDetails.peopleApplied || "N/A";
  document.getElementById('hirerInformation').textContent = jobDetails.hirerInformation || "N/A";

  const linkedInElement = document.getElementById('hirerLinkedIn');
  if (jobDetails.hirerLinkedIn && jobDetails.hirerLinkedIn !== "N/A") {
    linkedInElement.href = jobDetails.hirerLinkedIn;
    linkedInElement.style.display = "inline";
  } else {
    linkedInElement.style.display = "none";
  }

  const jobUrlElement = document.getElementById('jobUrl');
  if (jobDetails.jobUrl) {
    jobUrlElement.href = jobDetails.jobUrl;
    jobUrlElement.style.display = "inline";
  } else {
    jobUrlElement.style.display = "none";
  }
}

