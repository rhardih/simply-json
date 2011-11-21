function toggleContent(id) {
  // TODO: Should not collapse an empty object
  //       Array of zero length is rendered as object
  var div = document.getElementById('content#' + id);
  var elipsis = document.getElementById('elipsis#' + id);
  if(div.style.display !== 'none') {
    div.style.display = 'none';
    elipsis.style.display = 'inline';
  } else {
    div.style.display = 'block';
    elipsis.style.display = 'none';
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

  // TODO: Clraify this
  bracketCountValue = leftBracketCount;
  events = ' onclick="toggleContent(' + contentId + ');"';
  events += ' onmouseover="highlightMatching(' + leftBracketCount + ', true)"';
  events += ' onmouseout="highlightMatching(' + leftBracketCount + ', false)"';

  if(parsed_json === null ||
      typeof(parsed_json) === 'number' ||
      typeof(parsed_json) === 'boolean') {
    result += '<span class="value">' + parsed_json + '</span>'; 
  } else if(typeof(parsed_json) === 'string') {
    result += '<span class="value">"' + parsed_json + '"</span>'; 
  } else { // Array or object
    isArray = typeof(parsed_json) === 'object' && parsed_json.length;
    leftBracket = isArray ? '[' : '{';
    rightBracket = isArray ? ']' : '}';
    result += '<span id="leftBracket#' + leftBracketCount +
      '" class="bracket"' + events + '>' + leftBracket + '</span>';
    leftBracketCount++;
    result += '<span id="elipsis#' + contentId +
      '"class="elipsis" style="display:none;">...</span>';
    result += '<div id="content#' + contentId + '" class="bracket-content">';
    contentId++;
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
    result += spaces.substring(0, spaces.length - 2) + 
      '<span id="rightBracket#' + bracketCountValue +
      '" class="bracket"' + events + '>' + rightBracket +'</span>';
  }
  
  return result;
}

window.onload = function() {
  var input = document.getElementById("input");
  var url = document.getElementById("urlinput");
  var alert_box = document.getElementById("alert-box");
  var loader = document.getElementById("loader");
  var timeout;

  input.onkeyup = function() {
    try {
      var json = JSON.parse(input.value);
      input.style.borderColor = "#EEE";
      alert_box.innerHTML = format(json, 0);
    } catch (error) {
      input.style.borderColor = "#E00";
    }
  }
  
  url.onkeyup = function() {
    
    function handleRequest() {
      var xhr = new XMLHttpRequest();
      var json;

      alert_box.innerHTML = "";
      loader.style.display = "block";

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
            loader.style.display = "none";
            if(xhr.status == 200) {

              try {
                json = JSON.parse(xhr.responseText);
                input.value = xhr.responseText;
                alert_box.innerHTML = format(json, 0);
              } catch (error) {}
            } else {
              url.style.borderColor = "#E00";
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

  input.focus();
}
