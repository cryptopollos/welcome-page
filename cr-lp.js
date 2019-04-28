var $form1 = $("#setgs1"),
  $form2 = $("#setgs2"),
  $s1 = $('#ss1'),
  $s2 = $('#ss2'),
  url = "https://script.google.com/macros/s/AKfycbyyuAJw3Nps2mH7W4SfLxYwGaEWZsL-j8d2zTYWDESu9Hcb6I5B/exec?",
  f_from = null;  // form from which we sent request

var errDiv = null;

function _toGS(e, payload) {
  // send email to Google Sheets
  e.preventDefault();
  var jqxhr = $.ajax({
    url: url,
    // N.B.: can't use POST on Google Sheets
    // cuz it breaks CORS
    method: "GET",
    dataType: "json",
    data: payload
  }).success(function (data) {
    switch (data.result) {
      case "success":
        _success(data); break;
      case "error":
        _error(data); break;
      default:
        console.log("Error...")
    }
  });
}

function _error(d) {
  // server error
  // re-enable all inputs 
  console.log(d);
  var message = "Something went wrong, please try again later";
  var htmlCh = "Subscribe <span class='chicken'>🐔</span>";

  $form1.find("input").removeAttr("disabled");
  $form2.find("input").removeAttr("disabled");

  $s1.removeClass("processing");
  $s2.removeClass("processing");

  $s1.removeAttr("disabled");
  $s2.removeAttr("disabled");

  $s1.html(htmlCh);
  $s2.html(htmlCh);

  notifyError(f_from, message);
}

$s1.on("click", function (e) {
  // checks and sends mails on first form

  f_from = $form1; // sending data from 1st form

  var data = $form1.serializeArray();
  if (!isValidPayload(data)) {
    notifyError($form1, "Cluck! You entered an invalid email address!");
    return;
  }
  _disable($s1, $form1);
  _toGS(e, data);
})

$s2.on("click", function (e) {
  // checks and sends mails on second form

  f_from = $form2; // sending data from 2nd form

  var data = $form2.serializeArray();
  if (!isValidPayload(data)) {
    notifyError($form2, "Cluck! You entered an invalid email address!");
    return;
  }
  _disable($s2, $form2);
  _toGS(e, data);
})

function isValidPayload(payload) {
  // checks if AJAX payload is valid

  // only 1 email per request
  if (payload.length != 1)
    return false;
  // only values in email field
  if (payload[0].name != "email")
    return false;
  // only valid emails
  if (!isValidEmail(payload[0].value))
    return false;
  return true;
}

function isValidEmail(email) {
  // valid email:
  // string@string.string
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function notifyError(f, message) {
  // notifies an error
  var err = $("<div>", {
    class: "w3-container w3-red warning"
  });
  err.html(message);
  f.append(err);

  // remove any existing error dialogs
  if (errDiv) {
    errDiv.remove();
    errDiv = null;
  }
  errDiv = err;
}

function notifySuccess() {
  // creates and displays success modal
  var succ = $("<div>", {
    class: "w3-modal success"
  });
  var succB = $("<div>", {
    class: "w3-modal-content"
  });
  var succC = $("<div>", {
    class: "w3-container"
  });
  var succClose = $("<span>", {
    class: "close w3-button w3-display-topright"
  });

  succClose.html("&times;");
  succClose.click(function () {
    succ.fadeOut(200, function() { succ.remove() });
  })
  succC.append(succClose);
  succC.append("<h1 class='cell-title'>Subscribed!</h1>")
  succC.append("<p>Thank you, we will get back soon!</p>");
  succB.append(succC);
  succ.append(succB);
  succ.css("text-align", "center");
  succ.css("display", "none");
  $("body").append(succ);
  succ.fadeIn(200);
}

function _disable(b, f) {
  // disable form when sending data
  b.addClass("processing");
  b.attr("disabled", "disabled");
  b.html("Sending...");
  f.find("input").attr("disabled", "disabled");
}

function _success() {
  // email correctly saved
  // disable all forms
  [$form1, $form2].forEach(function (f) {
    f.find("input").attr("disabled", "disabled");
  });
  [$s1, $s2].forEach(function (b) {
    b.removeClass("processing");
    b.attr("disabled", "disabled");
    b.html("Subscribed!");
  });

  // create modal and notify success
  notifySuccess();

  // remove any errors left on screen
  if (errDiv) {
    errDiv.remove();
    errDiv = null;
  }
}
