// Animation delay multiplier for the number balls display sequence:
const animationDelayMultiplier = 1.0;

// build the numbers row:
const _buildResultsHTML = numbers => {
  const delayTime = (numbers.length + 1 * animationDelayMultiplier) * 1000;
  setTimeout(function() {
    $("#removeBtn").show();
    $("button[id='pickAWinnerBtn']").attr("disabled", true);
  }, delayTime);
  return numbers
    .map((number, index) => {
      const animationDelay = index * animationDelayMultiplier + "s";

      return `<span class="number" style="animation-delay: ${animationDelay};">${number}</span>`;
    })
    .join("");
};

// Generate a single unique number:
var winnernumbersArray;
const _generateNumber = (
  numbersArray,
  numbersHTML,
  totalNumbers = 20,
  minNumber = 1,
  maxNumber = 60
) => {
  let number =
    Math.ceil(Math.random() * (maxNumber - minNumber + 1)) - 1 + minNumber;
  //   console.log(nameEntryListTemp);
  //    let arrNameEntryList = [];

  //    Object.keys(nameEntryListTemp).map((key, index) => {
  //      //  console.log(nameEntryListTemp[key].name,index);
  //      arrNameEntryList.push(nameEntryListTemp[key].name);
  //    });

  // var a = ["a", "b", "c", "d", "e", "f"];
  var randomValue =
    arrNameEntryList[Math.floor(arrNameEntryList.length * Math.random())];
  //   console.log(randomValue);

  winnernumbersArray = numbersArray;
  //   const formatedNumber = number < 10 ? String("0" + number) : number;
  return numbersArray.indexOf(randomValue) < 0
    ? numbersArray.push(randomValue)
    : _generateNumber(
        numbersArray,
        numbersHTML,
        totalNumbers,
        minNumber,
        maxNumber
      );
};

// Helper function to get the value of an element by id:
const getVal = id => parseInt(document.getElementById(id).value);

// Main Function:
var nameEntryListTemp;
var arrNameEntryList = [];
const getLockyNumbers = () => {
  // Create the Array to store the numbers and the string for HTML template:
  nameEntryListTemp = JSON.parse(localStorage.getItem("name-entry-list"));
  console.log("nameEntryList: ", nameEntryListTemp);
  $("button[id='pickAWinnerBtn']").attr("disabled", true);

  Object.keys(nameEntryListTemp).map((key, index) => {
    //  console.log(nameEntryListTemp[key].name,index);
    arrNameEntryList.push(nameEntryListTemp[key].name);
  });

  const numbersArray = [];
  let numbersHTML = "";

  // Update the values:
  const qtySlots = getVal("numberSlots");
  const minNumber = getVal("minNumber");
  const maxNumber = getVal("maxNumber");

  // ---

  // Start mapping the numbers:
  if (maxNumber >= qtySlots) {
    for (let i = 0; i < qtySlots; i++) {
      _generateNumber(
        numbersArray,
        numbersHTML,
        qtySlots,
        minNumber,
        maxNumber
      );
    }
  } else {
    window.alert(
      "Number of slots is lower than the available numbers.\nTry to higher the Max Number value."
    );
  }

  // Check if the numbers fill all the slots:
  if (numbersArray.length === qtySlots) {
    $("#removeBtn").hide();

    // order the numbers and convert it to html formated string:
    const luckyNumbers = _buildResultsHTML(numbersArray.sort());

    // Set the complete html:
    const resultsTemplate = `<h1>Your Lucky Employee ID's are:</h1><div class="numbers">${luckyNumbers}</div>`;

    // Write the results in DOM:
    document.getElementById("resultsContainer").innerHTML = resultsTemplate;
  }
};

const removeLuckyWinners = () => {
  var nameEntryListTemp = JSON.parse(localStorage.getItem("name-entry-list"));
  winnernumbersArray.map(winnerItem => {
    Object.keys(nameEntryListTemp).map((key, index) => {
      if (nameEntryListTemp[key].name == winnerItem) {
        console.log("remove winner:", nameEntryListTemp[key].id);
        delete nameEntryListTemp[nameEntryListTemp[key].id];
      }
    });
  });

  localStorage.setItem("name-entry-list", JSON.stringify(nameEntryListTemp));
  console.log(JSON.stringify(nameEntryListTemp));
  setCookie("rawdata", JSON.stringify(nameEntryListTemp), 30);

  document.getElementById("resultsContainer").innerHTML = "";
  $("#removeBtn").hide();
  $("button[id='pickAWinnerBtn']").removeAttr("disabled");
};

function setCookie(cname, cvalue, exdays) {
  console.log("cvalue: ", cvalue);
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

var congratsSound;
var backgroundSound;
var rollSound;
var winSound;

function Sound(src, loop) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();
    if (loop) {
      this.sound.loop = true;
    }
  };
  this.pause = function() {
    this.sound.pause();
  };
  this.stop = function() {
    this.sound.pause();
    this.sound.currentTime = 0;
  };
  this.playbackRate = function() {
    this.sound.playbackRate = 0.7;
  };
  this.playbackRateReset = function() {
    this.sound.playbackRate = 1;
  };
  this.volumeDown = function() {
    this.sound.volume = 0.4;
  };
}
console.log("running")(function() {
  backgroundSound = new Sound("../../assets/sounds/bg-sound-2.mp3", true);
  var isBgPlaying = false;
  $("body").click(function() {
    if (!isBgPlaying) {
      console.log("Song playing...");
      backgroundSound.play();
      isBgPlaying = true;
    }
  });

  var COUNT = 300;
  var masthead = document.querySelector(".sky");
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var width = masthead.clientWidth;
  var height = masthead.clientHeight;
  var i = 0;
  var active = false;

  function onResize() {
    width = masthead.clientWidth;
    height = masthead.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = "#FFF";

    var wasActive = active;
    active = width > 600;

    if (!wasActive && active) requestAnimFrame(update);
  }

  var Snowflake = function() {
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.vx = 0;
    this.r = 0;

    this.reset();
  };

  Snowflake.prototype.reset = function() {
    this.x = Math.random() * width;
    this.y = Math.random() * -height;
    this.vy = 1 + Math.random() * 3;
    this.vx = 0.5 - Math.random();
    this.r = 1 + Math.random() * 2;
    this.o = 0.5 + Math.random() * 0.5;
  };

  canvas.style.position = "absolute";
  canvas.style.zIndex = "-1";
  canvas.style.left = canvas.style.top = "0";

  var snowflakes = [],
    snowflake;
  for (i = 0; i < COUNT; i++) {
    snowflake = new Snowflake();
    snowflake.reset();
    snowflakes.push(snowflake);
  }

  function update() {
    ctx.clearRect(0, 0, width, height);

    if (!active) return;

    for (i = 0; i < COUNT; i++) {
      snowflake = snowflakes[i];
      snowflake.y += snowflake.vy;
      snowflake.x += snowflake.vx;

      ctx.globalAlpha = snowflake.o;
      ctx.beginPath();
      ctx.arc(snowflake.x, snowflake.y, snowflake.r, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();

      if (snowflake.y > height) {
        snowflake.reset();
      }
    }

    requestAnimFrame(update);
  }

  // shim layer with setTimeout fallback
  window.requestAnimFrame = (function() {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();

  onResize();
  window.addEventListener("resize", onResize, false);

  masthead.appendChild(canvas);
})();
