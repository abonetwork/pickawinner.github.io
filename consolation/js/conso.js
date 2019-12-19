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
