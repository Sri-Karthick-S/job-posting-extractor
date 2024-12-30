function extractJobId(url) {
  const match = url.match(/currentJobId=(\d+)/);
  return match ? match[1] : null;
}

function constructJobUrl(jobId) {
  return `https://www.linkedin.com/jobs/view/${jobId}`;
}

function getCookie(name) {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((c) => c.startsWith(name + "="));
  return cookie ? cookie.split("=")[1] : null;
}

let currentJobDetails = null;

document.getElementById("extractButton").addEventListener("click", () => {
  const loadingElement = document.getElementById("loading");
  const jobDetailsElement = document.getElementById("jobDetails");
  const extractButton = document.getElementById("extractButton");
  const saveButton = document.getElementById("saveButton");

  loadingElement.classList.add("visible");
  extractButton.style.display = "none";
  saveButton.classList.remove("visible");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      const jobId = extractJobId(tabs[0].url);
      const jobUrl = jobId ? constructJobUrl(jobId) : null;

      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: "extractJobDetails",
          jobUrl: jobUrl,
        },
        (response) => {
          loadingElement.classList.remove("visible");

          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
            extractButton.style.display = "block";
            extractButton.textContent =
              "Error extracting details. Try again.";
          } else {
            console.log("Job Details Response:", response);
            currentJobDetails = {
              ...response.data,
              jobUrl: jobUrl,
            };
            updatePopupUI(currentJobDetails);
            jobDetailsElement.classList.add("visible");
            saveButton.classList.add("visible");
          }
        }
      );
    }
  });
});

document.getElementById("saveButton").addEventListener("click", async () => {
  if (!currentJobDetails) return;

  const saveButton = document.getElementById("saveButton");
  const originalText = saveButton.textContent;
  saveButton.textContent = "Saving...";
  saveButton.disabled = true;

  try {
    await postJobDetails(currentJobDetails);
    saveButton.textContent = "Saved!";
    saveButton.style.background = "#059669";
  } catch (error) {
    console.error("Error saving job details:", error);
    saveButton.textContent = "Error saving";
    saveButton.style.background = "#DC2626";
  }

  saveButton.disabled = false;
  setTimeout(() => {
    saveButton.textContent = originalText;
    saveButton.style.background = "";
  }, 2000);
});

function updatePopupUI(jobDetails) {
  document.getElementById("jobTitle").textContent =
    jobDetails.jobTitle || "N/A";
  document.getElementById("companyName").textContent =
    jobDetails.companyName || "N/A";
  document.getElementById("description").textContent =
    jobDetails.description || "N/A";
  document.getElementById("location").textContent =
    jobDetails.location || "N/A";
  document.getElementById("daysPosted").textContent =
    jobDetails.daysPosted || "N/A";
  document.getElementById("peopleApplied").textContent =
    jobDetails.peopleApplied || "N/A";
  document.getElementById("hirerInformation").textContent =
    jobDetails.hirerInformation || "N/A";

  const linkedInElement = document.getElementById("hirerLinkedIn");
  if (jobDetails.hirerLinkedIn && jobDetails.hirerLinkedIn !== "N/A") {
    linkedInElement.href = jobDetails.hirerLinkedIn;
    linkedInElement.style.display = "inline";
  } else {
    linkedInElement.style.display = "none";
  }

  const jobUrlElement = document.getElementById("jobUrl");
  if (jobDetails.jobUrl) {
    jobUrlElement.href = jobDetails.jobUrl;
    jobUrlElement.style.display = "inline";
  } else {
    jobUrlElement.style.display = "none";
  }
}

async function postJobDetails(jobDetails) {
  return new Promise((resolve, reject) => {
    chrome.cookies.get({
      url: 'http://localhost:3000',
      name: 'sb-ogubbwjbocvlumqcwosf-auth-token'
    }, async (cookie) => {
      let token = null;
      if (cookie) {
        const rawToken = cookie.value.replace('base64-', '');
        try {
          const tokenData = JSON.parse(atob(rawToken));
          token = tokenData.access_token;
        } catch (error) {
          console.error('Error parsing token:', error);
          reject(error);
          return;
        }
      }

      try {
        const response = await fetch('', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'apikey': '',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(jobDetails)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
        }

        const data = await response
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
}