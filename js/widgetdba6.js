(function($) {
  $.fn.extend({
    /**
     * Random Name Selector Widget
     *
     * @param options
     * @param args
     * @returns {*}
     */
    randomNameSelector: function(options, args) {
      var $this = $(this),
        prefsName = "randomNameSelector",
        prefs = $this.data(prefsName),
        func = {
          /**
           * Initialises the widget
           *
           * @returns {*|HTMLElement}
           */

          init: function() {
            // console.log("prefs: ", prefs);

            if (prefs.debug) {
              console.log("Initialisation");
            }

            // turn references into selectors
            prefs.elementStart = $(prefs.elementStart);
            // prefs.elementPageTitle = $(prefs.elementPageTitle);
            // prefs.elementPageTitleBackground = $(
            //   prefs.elementPageTitleBackground
            // );
            prefs.elementStudents = $(prefs.elementStudents);
            prefs.elementSlot = $(prefs.elementSlot);
            prefs.elementSlotList = $(prefs.elementSlotList);
            prefs.elementNames = $(prefs.elementNames);
            // prefs.elementWordList = $(prefs.elementWordList);
            // prefs.elementSpinnerDuration = $(prefs.elementSpinnerDuration);
            // prefs.elementTheme = $(prefs.elementTheme);
            prefs.elementRemoveName = $(prefs.elementRemoveName);
            // prefs.elementRemovedStudents = $(prefs.elementRemovedStudents);
            prefs.elementHideOptions = $(prefs.elementHideOptions);

            // prefs.elementStudents.val(
            //   prefs.elementWordList.find(":selected").attr("data-content")
            // );

            // $("#removed-students").hide();

            // $("#reset-students").click(function() {
            //   prefs.students = prefs.elementStudents.val().split(",");

            //   $this.randomNameSelector("resetStudents");
            // });

            // custom list change handler
            // prefs.elementStudents.blur(function() {
            prefs.students = [
              "175",
              "55",
              "124",
              "45",
              "2",
              "178",
              "142",
              "23",
              "65",
              "95",
              "69",
              "287",
              "345",
              "455",
              "225",
              "123",
              "456",
              "475",
              "125",
              "78",
              "86",
              "96",
              "90",
              "245",
              "154",
              "214"
            ];
            $this.randomNameSelector("resetStudents");

            if ($(".wrapper li").length > 2) {
              prefs.elementStart.prop("disabled", false);
              prefs.elementRemoveName.prop("disabled", false);
            }

            // remove name button handler
            prefs.elementRemoveName.click(function() {
              // console.log(
              //   "prefs.finishedIndex: ",
              //   prefs.students[prefs.finishedIndex]
              // );
              if (prefs.debug) {
                console.log("Removing " + prefs.finishedIndex);
              }

              if (
                prefs.finishedIndex === 0 ||
                prefs.finishedIndex === $(".wrapper li").length - 1
              ) {
                $(".wrapper li:last, .wrapper li:first").remove();
              } else {
                $(
                  ".wrapper li:eq(" +
                    prefs.finishedIndex +
                    "), .wrapper li:last"
                ).remove();
              }

              $this.randomNameSelector("reset");

              prefs.students = [];
              $(".wrapper li").each(function(i, o) {
                prefs.students.push($(o).text());
                //refresh array
              });

              prefs.students.pop();

              if (prefs.students.length === 1) {
                prefs.elementStart.prop("disabled", true);
                prefs.elementRemoveName.prop("disabled", true);
              }

              //   $("#removed-students").show();
              prefs.elementRemoveName.hide();

              // $('.wrapper').css({top:0});
            });

            // set up the spinner
            $this.randomNameSelector("addSlots").randomNameSelector("reset");

            return $this;
          },

          /**
           * Gets parameters from the URL
           *
           * @param name
           * @returns {string}
           */
          getParams: function(name) {
            var regex = new RegExp(
                "[\\?&]" +
                  name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]") +
                  "=([^&#]*)"
              ),
              results = regex.exec(location.search);

            return results === null
              ? ""
              : decodeURIComponent(results[1].replace(/\+/g, " "));
          },

          /**
           * Called when the spinner starts
           *
           * @returns {*|HTMLElement}
           */
          start: function() {
            if (prefs.debug) {
              console.log("start!");
            }

            prefs.elementRemoveName.fadeOut();
            prefs.elementRemoveName.prop("disabled", true);
            prefs.elementStart.prop("disabled", true);

            return $this;
          },

          /**
           * Called when the spinner ends
           *
           * @param finalNumbers
           * @returns {*|HTMLElement}
           */
          stop: function(finalNumbers) {
            var slotIndex = finalNumbers[0] - 1,
              slotName = prefs.elementSlot.eq(slotIndex).text();
            if (prefs.debug) {
              console.log("finished!");
              console.log(finalNumbers);
            }

            prefs.elementRemoveName.fadeIn();
            prefs.elementRemoveName.removeAttr("disabled");
            prefs.elementStart.removeAttr("disabled");

            prefs.finishedIndex = slotIndex;

            $("#selected-history").prepend(
              '<span class="label label-default">' + slotName + "</span>"
            );
            console.log("1");
            return $this;
          },

          /**
           * Adds slots
           *
           * @returns {*|HTMLElement}
           */
          addSlots: function() {
            prefs.students = prefs.students.length
              ? prefs.students
              : prefs.elementStudents.val().split(",");

            if (prefs.debug) {
              console.log("Add new slots");
              console.log("Names count: " + prefs.students.length);
            }

            $(".wrapper").empty();

            $.each(prefs.students, function(i, o) {
              $(".wrapper").append('<li class="slot">' + o.trim() + "</li>");
            });

            return $this;
          },

          /**
           * Resets removed students
           *
           * @returns {*|HTMLElement}
           */
          resetStudents: function() {
            if (prefs.debug) {
              console.log("Resetting students");
            }

            $(".label-removed").remove();
            // prefs.elementRemovedStudents.slideUp();

            $this.randomNameSelector("addSlots").randomNameSelector("reset");

            return $this;
          },

          /**
           * Renders the widget
           *
           * @returns {*|HTMLElement}
           */
          reset: function() {
            if (prefs.debug) {
              console.log("Resetting the widget");
            }

            // Refresh jSlots
            $(".wrapper").jSlots({
              number: prefs.numberOfSlots,
              spinner: prefs.elementStart.selector,
              onStart: function() {
                $this.randomNameSelector("start");
              },
              onEnd: function(finalNumbers) {
                $this.randomNameSelector("stop", finalNumbers);
                console.log("3: ", prefs.students[prefs.finishedIndex]);
              },
              easing: prefs.animationType,
              time: prefs.spinnerDuration * 1000
            });

            if (
              $(".wrapper")
                .parent()
                .is(".jSlots-wrapper") &&
              $(".wrapper")
                .parent()
                .parent()
                .is(".jSlots-wrapper")
            ) {
              $(".wrapper")
                .parent()
                .unwrap();
            }

            return $this;
          }
        };

      // if calling a method
      if (typeof options === "string") {
        return func[options](args);
      }

      // customisable options
      options = options || {};
      options.debug = options.debug || false;
      options.numberOfSlots = options.numberOfSlots || 1;
      options.spinnerDuration = options.spinnerDuration || 1;
      options.animationType = options.animationType || "easeOutSine";

      // page elements
      options.elementStart = options.elementStart || "";
      options.elementStudents = options.elementStudents || "";
      options.elementSlot = options.elementSlot || "";
      options.elementSlotList = options.elementSlotList || "";
      options.elementNames = options.elementNames || "";
      //   options.elementWordList = options.elementWordList || "";
      //   options.elementSpinnerDuration = options.elementSpinnerDuration || "";
      //   options.elementTheme = options.elementTheme || "";
      options.elementRemoveName = options.elementRemoveName || "";
      //   options.elementRemovedStudents = options.elementRemovedStudents || "";

      // default options
      options.slotIndex = 0;
      options.studentInput = "";
      options.students = [];
      options.amount = 0;
      options.rotations = 0;
      options.slots = 0;
      options.theme = "";
      options.finishedIndex = 0;

      // store the preferences
      $this.data(prefsName, options);

      // start
      return $this.randomNameSelector("init");
    }
  });
})(jQuery);

// Snow from https://codepen.io/radum/pen/xICAB

(function() {
  // $(".pop-up").addClass("open");
  $(".clickme").click(function() {
    // $(".pop-up").addClass("open");
  });

  $(".pop-up .close").click(function() {
    $(".pop-up").removeClass("open");
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
