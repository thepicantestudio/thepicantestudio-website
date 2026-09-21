/* Sentence form (opens WhatsApp with the message pre-written, or emails it),
   the community waitlist and the companies enquiry. Contact details come from config.js. */
(function () {
  "use strict";
  var HV = window.HV || {};
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };

  function status(form, text, kind) {
    var el = form.querySelector("[data-status]");
    if (!el) return;
    el.textContent = text;
    el.className = "form-note" + (kind ? " " + kind : "");
  }

  /* Web3Forms when a key is set, otherwise the visitor's own mail app. */
  function sendEmail(form, subject, lines, replyTo) {
    var body = lines.join("\n");
    if (!HV.web3formsKey) {
      window.location.href = "mailto:" + HV.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status(form, "Your email app should open with the message ready to send. If it doesn’t, write to " + HV.email + ".", "ok");
      return Promise.resolve();
    }
    status(form, "Sending…");
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: HV.web3formsKey, subject: subject, from_name: "honestlyvaibhav.com", replyto: replyTo || undefined, message: body })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.success) throw new Error(j.message || "failed");
      status(form, "Sent. Vaibhav will reply to you personally.", "ok");
      form.reset();
    }).catch(function () {
      status(form, "That didn’t send. Please email " + HV.email + " or message on WhatsApp instead. Your words are still here.", "err");
    });
  }

  /* ---- sentence form ---- */
  $$("[data-sentence]").forEach(function (form) {
    var name = form.elements.name, topic = form.elements.topic, mode = form.elements.mode, email = form.elements.email;
    var extra = form.querySelector("[data-email-extra]");

    function fit(input) { input.style.width = Math.max(input.value.length + 1, input === topic ? 12 : 7) + "ch"; }
    [name, topic].forEach(function (input) {
      input.addEventListener("input", function () { input.classList.remove("bad"); if (input.value) fit(input); else input.style.width = ""; });
    });

    function fitSelect() { mode.style.width = (mode.options[mode.selectedIndex].text.length * 0.92 + 1.5).toFixed(1) + "ch"; }
    mode.addEventListener("change", fitSelect); fitSelect();

    function sentence() {
      return "Hi Vaibhav, my name is " + name.value.trim() + " and I’d like help with " + topic.value.trim() +
        ". I’d prefer to meet " + mode.value + ".";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var via = (e.submitter && e.submitter.getAttribute("data-via")) || "whatsapp";
      var missing = [name, topic].filter(function (i) { return !i.value.trim(); });
      missing.forEach(function (i) { i.classList.add("bad"); });
      if (missing.length) { status(form, "Fill in the blanks first: your name and what you’d like help with.", "err"); missing[0].focus(); return; }

      if (via === "whatsapp") {
        window.open("https://wa.me/" + HV.whatsapp + "?text=" + encodeURIComponent(sentence()), "_blank", "noopener");
        status(form, "WhatsApp is opening with your message. Press send there when you’re ready.", "ok");
        return;
      }
      if (extra.hidden) { extra.hidden = false; email.focus(); status(form, "Add your email so Vaibhav can reply, then press Email instead again."); return; }
      if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) { email.classList.add("bad"); status(form, "That email address doesn’t look right.", "err"); email.focus(); return; }
      sendEmail(form, "New message from " + name.value.trim(), [sentence(), "", "Reply to: " + email.value.trim()], email.value.trim());
    });
  });

  /* ---- waitlist ---- */
  $$("[data-waitlist]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = form.elements.contact.value.trim();
      var isEmail = /^\S+@\S+\.\S+$/.test(v), isPhone = /^\+?[\d\s\-]{8,16}$/.test(v);
      if (!isEmail && !isPhone) { status(form, "Enter an email address or a WhatsApp number.", "err"); form.elements.contact.focus(); return; }
      sendEmail(form, "Community waitlist", ["Please add me to the community waitlist.", "Contact: " + v], isEmail ? v : "");
    });
  });

  /* ---- companies and colleges enquiry ---- */
  $$("[data-enquiry]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements, bad = ["person", "org", "email"].filter(function (k) { return !f[k].value.trim(); });
      if (bad.length || !/^\S+@\S+\.\S+$/.test(f.email.value.trim())) { status(form, "Please add your name, organisation and a valid email.", "err"); (f[bad[0]] || f.email).focus(); return; }
      sendEmail(form, "Enquiry from " + f.org.value.trim(), [
        "Name: " + f.person.value.trim(), "Organisation: " + f.org.value.trim(), "Email: " + f.email.value.trim(),
        "Audience size: " + (f.size.value.trim() || "not given"), "Dates: " + (f.dates.value.trim() || "not given"), "",
        f.message.value.trim()
      ], f.email.value.trim());
    });
  });
})();
