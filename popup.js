document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("apiKey");
  const profileArea = document.getElementById("profile");
  const saveButton = document.getElementById("saveButton");
  const fillFormButton = document.getElementById("fillFormButton");
  const statusDiv = document.getElementById("status");

  chrome.storage.local.get(["openaiApiKey", "profile"], function (result) {
    if (result.openaiApiKey) apiKeyInput.value = result.openaiApiKey;
    if (result.profile) profileArea.value = result.profile;
  });

  saveButton.addEventListener("click", function () {
    chrome.storage.local.set(
      {
        openaiApiKey: apiKeyInput.value,
        profile: profileArea.value,
      },
      function () {
        statusDiv.textContent = "Saved!";
        setTimeout(() => {
          statusDiv.textContent = "";
        }, 3000);
      }
    );
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "checkForm" },
      function (response) {
        if (response && response.formExists) {
          fillFormButton.style.display = "block";
        }
      }
    );
  });

  fillFormButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "fillForm" });
    });
  });
});
