/* site.js - shared behavior across the portfolio */
(function () {

  // -----------------------------
  // 2) Voice-to-Text (Reusable)
  // Works for any button with:
  //   .js-voice-btn
  //   data-target="#fieldId"
  //   data-status="#statusId"
  // -----------------------------
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const buttons = document.querySelectorAll(".js-voice-btn");

  if (buttons.length) {
    // If browser doesn't support it, disable all voice buttons
    if (!SpeechRecognition) {
      buttons.forEach((btn) => {
        const statusSel = btn.getAttribute("data-status");
        const statusEl = statusSel ? document.querySelector(statusSel) : null;

        if (statusEl) {
          statusEl.textContent = "Voice input not supported in this browser. Try Chrome or Edge.";
          statusEl.classList.add("error");
        }

        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let activeBtn = null;
    let activeField = null;
    let activeStatus = null;

    function setStatus(text, mode) {
      if (!activeStatus) return;
      activeStatus.textContent = text || "";
      activeStatus.classList.remove("listening", "error");
      if (mode) activeStatus.classList.add(mode);
    }

    function setBtnRecording(isRecording) {
      if (!activeBtn) return;
      activeBtn.classList.toggle("recording", isRecording);
      activeBtn.setAttribute("aria-label", isRecording ? "Stop voice recording" : "Start voice recording");
      const label = activeBtn.querySelector(".btn-text");
      if (label) label.textContent = isRecording ? "Stop" : "Record";
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const fieldSel = btn.getAttribute("data-target");
        const statusSel = btn.getAttribute("data-status");
        const field = fieldSel ? document.querySelector(fieldSel) : null;
        const status = statusSel ? document.querySelector(statusSel) : null;

        if (!field) return;

        // Clicking the same active button stops recording
        if (activeBtn === btn) {
          recognition.stop();
          return;
        }

        activeBtn = btn;
        activeField = field;
        activeStatus = status;

        try {
          recognition.start();
        } catch (e) {
          setStatus("Please try again in a second.", "error");
        }
      });
    });

    recognition.onstart = function () {
      setBtnRecording(true);
      setStatus("Listening. Speak now!", "listening");
    };

    recognition.onresult = function (event) {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }

      if (finalTranscript && activeField) {
        const needsSpace = activeField.value && !activeField.value.endsWith(" ");
        activeField.value += (needsSpace ? " " : "") + finalTranscript;
        activeField.focus();
      }

      if (interimTranscript) {
        setStatus(`Hearing: "${interimTranscript}"`, "listening");
      }
    };

    recognition.onend = function () {
      setBtnRecording(false);
      setStatus(
        activeField && activeField.value
          ? "Recording complete! Your text has been captured."
          : "Ready to record.",
        null
      );
      activeBtn = null;
    };

    recognition.onerror = function (event) {
      setBtnRecording(false);

      const msg = (function () {
        switch (event.error) {
          case "not-allowed":
            return "Microphone access denied. Allow mic permission and try again.";
          case "no-speech":
            return "No speech detected. Try again and speak clearly.";
          case "network":
            return "Network error. Check your connection and try again.";
          default:
            return "Voice input error: " + event.error;
        }
      })();

      setStatus(msg, "error");
      activeBtn = null;
    };
  }

  // -----------------------------
  // 3) jQuery zone
  // -----------------------------
  if (window.jQuery) {
    $(function () {
      // Example placeholder:
      // console.log("jQuery ready");
    });
  }
})();
