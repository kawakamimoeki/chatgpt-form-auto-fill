chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "formDetected") {
    chrome.action.setBadgeText({ text: "✓" });
  } else if (request.action === "getOpenAICompletion") {
    chrome.storage.local.get(["openaiApiKey", "profile"], function (result) {
      const apiKey = result.openaiApiKey;
      const profile = result.profile;

      if (!apiKey) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "error",
          message: "API key is required.",
        });
        return;
      }

      console.log(JSON.stringify(request.formData));

      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "Please use the following saved text as a reference to fill in the form and return it as a JSON:" +
                profile,
            },
            {
              role: "user",
              content:
                "Please enter the appropriate values in the following form fields:" +
                JSON.stringify(request.formData),
            },
          ],
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error.message);
          }
          const generatedText = data.choices[0].message.content;

          console.log(generatedText);

          chrome.tabs.sendMessage(sender.tab.id, {
            action: "updateForm",
            text: generatedText,
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "error",
            message: error.message,
          });
        });
    });
  }
});
