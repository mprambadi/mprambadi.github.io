(function () {
  'use strict';

  var form = document.querySelector('.contact-form');
  var status = document.getElementById('contact-status');
  var submit = form.querySelector('button[type="submit"]');
  var submissionId = form.elements.submissionId;
  var startedAt = form.elements.startedAt;
  var widgetId;
  var pendingId = '';
  var timeoutId;
  var loadTimeoutId = setTimeout(function () {
    setStatus('Verification could not load. Check your connection and try again.', 'error');
  }, 10000);

  function newSubmission() {
    var bytes = crypto.getRandomValues(new Uint8Array(16));
    submissionId.value = Array.from(bytes, function (byte) {
      return byte.toString(16).padStart(2, '0');
    }).join('');
    startedAt.value = String(Date.now());
  }

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state || '';
  }

  function resetForRetry() {
    clearTimeout(timeoutId);
    pendingId = '';
    form.removeAttribute('aria-busy');
    submit.disabled = true;
    newSubmission();
    if (widgetId !== undefined) window.turnstile.reset(widgetId);
  }

  window.contactTurnstileReady = function () {
    clearTimeout(loadTimeoutId);
    widgetId = window.turnstile.render('#contact-turnstile', {
      sitekey: '0x4AAAAAAEW-d_LMbn1vpPin',
      action: 'contact',
      callback: function () {
        submit.disabled = false;
        setStatus('', '');
      },
      'expired-callback': resetForRetry,
      'error-callback': function () {
        resetForRetry();
        setStatus('Verification unavailable. Please try again.', 'error');
      },
    });
  };

  window.contactTurnstileError = function () {
    clearTimeout(loadTimeoutId);
    setStatus('Verification could not load. Check your connection and try again.', 'error');
  };

  form.addEventListener('submit', function (event) {
    if (!form.checkValidity() || pendingId) {
      event.preventDefault();
      return;
    }
    pendingId = submissionId.value;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    setStatus('Sending message...', 'busy');
    timeoutId = setTimeout(function () {
      resetForRetry();
      setStatus('Message could not be confirmed. Please try again.', 'error');
    }, 20000);
  });

  window.addEventListener('message', function (event) {
    if (!/^https:\/\/[a-z0-9.-]+\.googleusercontent\.com$/.test(event.origin)) return;

    var data;
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      return;
    }
    if (data.type !== 'contact-form-result' || data.submissionId !== pendingId) return;

    clearTimeout(timeoutId);
    var accepted = data.result === 'accepted';
    if (accepted) form.reset();
    resetForRetry();
    setStatus(
      accepted ? 'Message sent. Thank you.' : 'Message rejected. Check your details and try again.',
      accepted ? 'success' : 'error'
    );
  });

  newSubmission();
}());
