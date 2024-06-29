let formsExist = false;

function checkForForms() {
  const forms = document.getElementsByTagName("form");
  const newFormsExist = forms.length > 0;

  if (newFormsExist !== formsExist) {
    formsExist = newFormsExist;
    chrome.runtime.sendMessage({
      action: formsExist ? "formDetected" : "formRemoved",
    });
  }
}

// ページロード時とDOMの変更時にフォームをチェック
checkForForms();
new MutationObserver(checkForForms).observe(document.body, {
  childList: true,
  subtree: true,
});

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkForm") {
    sendResponse({ formExists: formsExist });
  } else if (request.action === "fillForm") {
    if (formsExist) {
      const forms = document.getElementsByTagName("form");

      const formData = Array.from(forms[forms.length - 1].elements)
        .filter((element) => element.name)
        .map((element) => ({ name: element.name, type: element.type }));

      chrome.runtime.sendMessage({
        action: "getOpenAICompletion",
        formData: formData,
      });
    }
  } else if (request.action === "updateForm") {
    if (formsExist) {
      const forms = document.getElementsByTagName("form");
      const form = forms[forms.length - 1];

      const fields = JSON.parse(request.text);
      Object.keys(fields).forEach((field) => {
        const element = form.elements[field];
        if (element) {
          element.value = fields[field];
        }
      });
    }
  }
  return true;
});
