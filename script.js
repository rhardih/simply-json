// TODO: Some objects doesn't collapse correctly, leaving a linebreak

function toggleContent(id) {
  var div = document.getElementById('content#' + id);
  if(div.innerHTML.length == 0) return;
  var elipsis = document.getElementById('elipsis#' + id);
  var space = document.getElementById('space#' + id);
  if(div.style.display !== 'none') {
    div.style.display = 'none';
    elipsis.style.display = 'inline';
    space.style.display = 'none';
  } else {
    div.style.display = 'block';
    elipsis.style.display = 'none';
    space.style.display = 'inline';
  }
}

function highlightMatching(id, highlight) {
  var leftBracket = document.getElementById('leftBracket#' + id);
  var rightBracket = document.getElementById('rightBracket#' + id);
  if(highlight) {
    leftBracket.style.color = rightBracket.style.color = "white";
    leftBracket.style.backgroundColor = rightBracket.style.backgroundColor = "black";
  } else {
    leftBracket.style.color = rightBracket.style.color = "black";
    leftBracket.style.backgroundColor = rightBracket.style.backgroundColor = "white";
  }
}

/**
 * Escape html entities from string
 *
 * Returns string
 */
function sanitize(str) {
  return str.replace(/[&<>]/g, function(s) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;"}[s] || s;
  });
}

var contentId = 0;
var leftBracketCount = 0;

function format(parsed_json, indent) {
  var result = "";
  var items = [];
  var property;
  var tmp = "";
  var i;
  var bracketCountValue;
  var events = "";
  var spaces = (new Array(indent * 2 + 3)).join(' '); // zero indexed so 3 is min
  var isArray;
  var leftBracket;
  var rightBracket;
  var tmpContentId;

  // TODO: Clarify this
  bracketCountValue = leftBracketCount;
  events = ' onclick="toggleContent(' + contentId + ');"';
  events += ' onmouseover="highlightMatching(' + leftBracketCount + ', true)"';
  events += ' onmouseout="highlightMatching(' + leftBracketCount + ', false)"';

  if(parsed_json === null ||
      typeof(parsed_json) === 'number' ||
      typeof(parsed_json) === 'boolean') {
    result += '<span class="value">' + parsed_json + '</span>';
  } else if(typeof(parsed_json) === 'string') {
    result += '<span class="value">"' + sanitize(parsed_json) + '"</span>';
  } else { // Array or object
    isArray = typeof(parsed_json) === 'object' && parsed_json.length != undefined;
    leftBracket = isArray ? '[' : '{';
    rightBracket = isArray ? ']' : '}';
    result += '<span id="leftBracket#' + leftBracketCount +
      '" class="bracket"' + events + '>' + leftBracket + '</span>';
    leftBracketCount++;
    result += '<span id="elipsis#' + contentId +
      '"class="elipsis" style="display:none;">&#133;</span>';
    result += '<div id="content#' + contentId + '" class="bracket-content">';
    tmpContentId = contentId++;
    items = [];
    if(isArray) {
      for (i = 0; i < parsed_json.length; i++) {
        items.push(spaces + format(parsed_json[i], indent + 1));
      }
    } else {
      for (property in parsed_json) {
        tmp = spaces + '<span class="key">"' +
          property + '"</span><span class="colon">:</span><span class="value">' +
          format(parsed_json[property], indent + 1) + '</span>';
        items.push(tmp);
      }
    }
    result += items.join('<span class="comma">,</span><br />');
    result += '</div>';
    result += '<span id="space#' + tmpContentId + '">' + spaces.substring(0, spaces.length - 2) + '</span>' +
      '<span id="rightBracket#' + bracketCountValue +
      '" class="bracket"' + events + '>' + rightBracket +'</span>';
  }

  return result;
}

function stopDefault(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  else {
    window.event.returnValue = false;
  }
  return false;
}

window.onload = function() {
  var input = document.getElementById("json");
  var url = document.getElementById("url");
  var left = document.getElementById("left");
  var right = document.getElementById("right");
  var rightOffset = right.getBoundingClientRect().left;
  var formattedOutput = document.getElementById("formatted-output");
  var body = document.getElementsByTagName("body")[0];
  var intro = document.getElementById("intro");
  var timeout;
  var json;
  var splitter = document.getElementById("splitter");

  input.onkeyup = function() {
    try {
      json = JSON.parse(input.value);
      formattedOutput.innerHTML = format(json, 0);
      input.className = "";
      intro.style.display = "none";
    } catch (error) {
      input.className = "error";
    }
  }

  url.onkeyup = function() {
    function handleRequest() {
      var xhr = new XMLHttpRequest();
      var json;

      formattedOutput.innerHTML = "";
      body.setAttribute("aria-busy", "true");

      xhr.onreadystatechange = function() {
        switch(xhr.readyState) {
          case XMLHttpRequest.UNSENT:
            break;
          case XMLHttpRequest.OPENED:
            break;
          case XMLHttpRequest.HEADERS_RECEIVED:
            break;
          case XMLHttpRequest.LOADING:
            break;
          case XMLHttpRequest.DONE:
            url.style.borderColor = "#EEE";
            body.setAttribute("aria-busy", "false");
            if(xhr.status == 200) {

              try {
                json = JSON.parse(xhr.responseText);
                input.value = xhr.responseText;
                formattedOutput.innerHTML = format(json, 0);
                intro.style.display = "none";
              } catch (error) {
                body.setAttribute("aria-busy", "error");
              }
            } else {
              body.setAttribute("aria-busy", "error");
            }
            break;
        }
      }

      xhr.open("GET", 'proxy?uri=' + encodeURIComponent(url.value), true);
      xhr.send();
    }

    if(timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(handleRequest, 1200);
  }
}
