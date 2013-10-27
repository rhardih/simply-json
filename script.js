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
    result += '<span class="value">"' + parsed_json + '"</span>'; 
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

function formatAsText(parsed_json, indent) {
  var result = "";
  var items = [];
  var property;
  var tmp = "";
  var i;
  var spaces = (new Array(indent * 2 + 3)).join(' '); // zero indexed so 3 is min
  var isArray;
  var leftBracket;
  var rightBracket;
  var tmpContentId;

  if(parsed_json === null ||
      typeof(parsed_json) === 'number' ||
      typeof(parsed_json) === 'boolean') {
    result += parsed_json; 
  } else if(typeof(parsed_json) === 'string') {
    result += '"' + parsed_json + '"'; 
  } else { // Array or object
    isArray = typeof(parsed_json) === 'object' && parsed_json.length != undefined;
    leftBracket = isArray ? '[' : '{';
    rightBracket = isArray ? ']' : '}';
    result += leftBracket;
    result += "\n";
    tmpContentId = contentId++;
    items = [];
    if(isArray) {
      for (i = 0; i < parsed_json.length; i++) {
        items.push(spaces + formatAsText(parsed_json[i], indent + 1));
      }
    } else {
      for (property in parsed_json) {
        tmp = spaces + '"' + property + '":' +
          formatAsText(parsed_json[property], indent + 1);
        items.push(tmp);
      }
    }
    result += items.join(',\n');
    result += '\n';
    result += spaces.substring(0, spaces.length - 2) + rightBracket;
  }
  
  return result;

}

window.onload = function() {
  var input = document.getElementById("json");
  var url = document.getElementById("url");
  var right = document.getElementById("right");
  var body = document.getElementsByTagName("body")[0];
  var timeout;
  var json;

  input.onkeyup = function() {
    try {
      json = JSON.parse(input.value);
      right.innerHTML = format(json, 0);
      input.className = "";
    } catch (error) {
      input.className = "error";
    }
  }
  
  url.onkeyup = function() {
    
    function handleRequest() {
      var xhr = new XMLHttpRequest();
      var json;

      right.innerHTML = "";
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
                right.innerHTML = format(json, 0);
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

  //// ZeroClipboard
  //var clip = new ZeroClipboard.Client();
  //clip.setHandCursor( true );
  //clip.glue( 'd_clip_button', 'd_clip_container' );
  //clip.addEventListener( 'onMouseDown', function() {
  //    json = JSON.parse(input.value);
  //    clip.setText(formatAsText(json, 0));
  //});
  //var label = document.getElementById("label");
  //clip.addEventListener( 'onMouseOver', function() {
  //  label.style.visibility = "visible";
  //});
  //clip.addEventListener( 'onMouseOut', function() {
  //  label.style.visibility = "hidden";
  //});
}
