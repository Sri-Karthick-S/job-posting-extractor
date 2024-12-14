// Helper function to get text content safely
function getText(selector) {
    const element = document.querySelector(selector);
    return element ? element.textContent.trim() : "N/A";
  }

// Helper function to extract text until the first newline
function getTextUntilNewline(selector) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      const firstLine = text.split('\n')[0].trim();
      return firstLine;
    }
    return "N/A";
  }

// Helper function to extract href attribute from an anchor tag
function getHref(selector) {
    const element = document.querySelector(selector);
    return element ? element.href : "N/A";
  }
  
function parseJobLocation(text) {
    const locationMatch = text.match(/^(.*?)·/);
    const location = locationMatch ? locationMatch[1].trim() : "N/A";
  
    const segments = text.split('·').map(segment => segment.trim());
    const daysPosted = segments.length > 1 ? segments[1] : "N/A";
    const peopleApplied = segments.length > 2 ? segments[2] : "N/A";
  
    return { location, daysPosted, peopleApplied };
  }

  // Listener for messages from the popup script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractJobDetails") {
      const rawJobLocation = getText('.job-details-jobs-unified-top-card__primary-description-container');
      const parsedLocation = parseJobLocation(rawJobLocation);
  
      const jobDetails = {
        jobTitle: getText('.job-details-jobs-unified-top-card__job-title'),
        companyName: getText('.job-details-jobs-unified-top-card__company-name'),
        location: parsedLocation.location,
        daysPosted: parsedLocation.daysPosted,
        peopleApplied: parsedLocation.peopleApplied,
        hirerInformation: getTextUntilNewline('.hirer-card__hirer-information'),
        hirerLinkedIn: getHref('.hirer-card__hirer-information a')
      };
  
      console.log("Extracted Job Details:", jobDetails);
      sendResponse({ status: "success", data: jobDetails });
    }
  
    return true; // Keep the message channel open for async response
  });
  
  