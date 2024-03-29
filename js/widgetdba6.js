function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const LocalRawData = data => {
  // console.log("EntriesB: ", data.localStorage.data);
  const localData = data.localStorage.data;
  let pushLocalDataToRaw = {};
  Object.keys(localData).map(function(key, index) {
    if (localData[key].attributes) {
      pushLocalDataToRaw[localData[key].attributes.id] = {
        id: localData[key].attributes.id,
        name: localData[key].attributes.name
      };
    } else {
      pushLocalDataToRaw[localData[key].id] = {
        id: localData[key].id,
        name: localData[key].name
      };
    }
  });
  // console.log("updatedCookie: ", JSON.stringify(pushLocalDataToRaw));
  return JSON.stringify(pushLocalDataToRaw);
};

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
// function bodyLoad() {

// }

$(function() {
  var FADE_DELAY_MS = 800,
    EXTRA_DELAY = 150,
    SHOW_NAME_DELAY = 150,
    MIN_LIST_LENGTH = 60,
    MAX_LIST_LENGTH = 300;

  // Super simple model - really just need it for the collection
  var NameEntryModel = Backbone.Model.extend({
    defaults: {
      name: ""
    },

    remove: function() {
      this.destroy();
    }
  });

  // Basic tempalte to allow removing of names if needed
  var NameEntryView = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#name-entry-template").html()),

    events: {
      "click .remove": "remove"
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    remove: function() {
      this.model.remove();
      this.$el.remove();
    }
  });

  // Basic template for the winner's name
  var NameWinnerView = Backbone.View.extend({
    // className: "winner",
    // template: _.template($("#name-winner-template").html()),.
    el: $("#pop-upid"),

    events: {
      "click .close": "remove"
    },

    // render: function() {
    //   this.$el.html(this.template(this.model.toJSON()));
    //   return this;
    // },

    remove: function() {
      const modelRemove = this.model;
      const elRemove = this.$el;
      // total hack, but meah
      setTimeout(function() {
        $("#winnerPopup").html("");
        $("#pop-upid").removeClass("open");
        setTimeout(function() {
          congratsSound.stop();
          modelRemove.remove();
          elRemove.remove();
          $("#pick-winner").removeClass("disabled");
        }, 500);
      }, 500);
      // $("#pop-upid").removeClass("open");
      // $("#pop-upid").removeClass("open");
      // $("#selecting-name")
      //   .removeClass("final-winner")
      //   .html("<div id='pick-another'>pick</div>");
    }
  });

  // Collection to hold the name models
  var NameEntryCollection = Backbone.Collection.extend({
    model: NameEntryModel,
    localStorage: new Store("name-entry-list"),
    all: function() {
      return this.filter(function() {
        return true; /* Need to clone the collection */
      });
    }
  });

  var Entries = new NameEntryCollection();

  var App = Backbone.View.extend({
    el: $("#outer-container"),

    events: {
      "keypress #name-input": "createEntry",
      // "click #file-trigger": "showHideFileUpload",
      // "change #file-input": "showFileSample",
      // "click #file-submit": "createEntriesFromFile",
      "click #pick-winner": "pickWinner"
      // "click #pick-another": "pickWinner",
      // "click #clear-all-safety": "clearAllSafety",
      // "click #clear-all": "clearAll"
    },

    initialize: function() {
      this.input = this.$("#name-input");

      Entries.bind("add", this.addEntry, this);
      Entries.bind("reset", this.addAll, this);
      Entries.bind("all", this.render, this);

      Entries.fetch();
    },

    showHideFileUpload: function() {
      $("#file-area").toggle("visible");
    },

    showFileSample: function(e) {
      if (window.File && window.FileReader) {
        var file = e.target.files[0]; //only one file
        $("#file-sample").text("type: " + file.type);
        var reader = new FileReader();
        reader.onload = (function(file) {
          return function(e) {
            var contents = e.target.result || "";
            // assumed separators: newline comma pipe
            var result = contents.split(/,|\||\r\n|\r|\n/g);
            // remove any empty cases
            result = _.reject(result, function(val) {
              return val === "";
            });
            $("#file-sample").data("contents", result.join(","));
            $("#file-sample").text("");
            $("#file-sample").append("Sample of file contents:<br/>");
            _.each(_.first(result, 10), function(val) {
              $("#file-sample").append(_.escape(val) + "<br/>");
            });
            $("#file-sample").append("...etc...");
            return result;
          };
        })(file);
        reader.readAsText(file);
      } else {
        $("#file-sample").text(
          "Your browser doesn't support file reading. Try using Chrome?"
        );
        $("#file-submitd").attr("disabled", true);
      }
    },

    createEntriesFromFile: function() {
      var values = $("#file-sample").data("contents") || "";
      _.each(values.split(","), function(val) {
        Entries.create({ name: val });
      });
      $("#file-input").val("");
      $("#file-sample").text("");
    },

    createEntry: function(e) {
      // console.log("a");
      if (e.which !== 13) return;
      var inputValue = this.input.val().trim();

      if (!inputValue) return;

      Entries.create({ name: inputValue });
      this.input.val("");
    },

    addEntry: function(nameEntry) {
      var view = new NameEntryView({ model: nameEntry }),
        entryListLength = Entries.length,
        nameListClass;

      // Add to the left/right side of the name list
      if (entryListLength !== 0) {
        var indexOfEntry = _.indexOf(Entries.models, nameEntry);
        nameListClass =
          indexOfEntry % 2 === 0 ? ".name-list.left" : ".name-list.right";
      } else {
        nameListClass =
          Entries.length % 2 === 0 ? ".name-list.right" : ".name-list.left";
      }
      this.$(nameListClass).prepend(view.render().el);
    },

    addAll: function() {
      Entries.each(this.addEntry);
    },

    render: function() {
      // console.log("render");
      setCookie("rawdata", LocalRawData(Entries), 30);
      // $(".num-entries").text(Entries.length + " entries");
    },

    getEntries: function() {
      return Entries.all();
    },

    getShuffled: function() {
      // underscore's shuffle uses the Fisher-Yates shuffle
      // should be equiv of picking a name out of a hat
      return _.shuffle(Entries.all());
    },

    getShuffledNames: function() {
      return this.getShuffled().map(function(model) {
        // console.log("Name: " + model.get('name'));
        return model.get("name");
      });
    },

    buildDecentShuffledList: function() {
      console.log("Shuffle and build list of names");
      var list = this.getShuffledNames();
      // Cap at MAX_LIST_LENGTH so the shuffle doesn't take too long
      if (list.length > MAX_LIST_LENGTH) {
        list = _.sample(list, MAX_LIST_LENGTH);
      }
      // Keep appending shuffled list until we reach a minimum length
      // min length is only there so the shuffle looks impressive
      while (list.length < MIN_LIST_LENGTH) {
        list = list.concat(this.getShuffledNames());
      }
      console.log("Total list length:" + list.length);
      return list;
    },

    pickWinner: function() {
      rollSound.playbackRateReset();
      rollSound.play();

      setTimeout(function() {
        $("#winnerPopup").html("");
      }, 1000);
      var that = this,
        shuffledNames = this.buildDecentShuffledList();

      $("#pick-winner").addClass("disabled");
      console.log("Picking winner...");
      // Clean-up existing space
      if ($("#entry-container").length > 0) {
        $("#entry-container").slideUp(FADE_DELAY_MS, function() {
          $(this).remove();
          $("#winner-container").slideDown(FADE_DELAY_MS, function() {
            $(this).removeClass("hidden");
            that.easingTimeout(that.showNames, shuffledNames, SHOW_NAME_DELAY);
          });
        });
      } else {
        //$("#pick-another").fadeOut(FADE_DELAY_MS, function() {
        // $(this).remove();
        that.easingTimeout(that.showNames, shuffledNames, SHOW_NAME_DELAY);
        //});
      }
    },

    showNames: function(names) {
      $("#rollNameId").text(names[0]);
      $("#selecting-name").text(names[0]);
      // console.log("Showed: " + names[0]);
      return names.slice(1);
    },

    easingTimeout: function(callback, names, delay) {
      var that = this;
      var internalCallback = (function(names, delay) {
        return function() {
          $("#winnerPopup").html("");
          if (names && names.length !== 0) {
            if (names.length === 20) {
              delay += EXTRA_DELAY; // Increase overall delay slightly
            }
            if (names.length < 10) {
              delay += 50; // Keep adding to delay, to get the 'slow-down' effect
              rollSound.playbackRate();
            }
            names = callback(names);
            setTimeout(internalCallback, delay);
          } else {
            $("#winnerPopup").html("");
            rollSound.stop();
            winSound.play();
            setTimeout(function() {
              $("#pop-upid").show();
              $("#pop-upid").addClass("open");
              // console.log("a");
              congratsSound.play();
            }, 1000);
            var selectedWinner = $("#selecting-name")
                .text()
                .trim(),
              winner = Entries.where({ name: selectedWinner })[0],
              winnerView = new NameWinnerView({ model: winner });

            setTimeout(function() {
              $("#winnerPopup").html(selectedWinner);
            }, 500);
            console.log("Winner is: " + selectedWinner);
            $("#rollNameId").html(selectedWinner);
            $("#popupdiv").html(winnerView.render().el);
            setTimeout(function() {
              $("#selecting-name").addClass("final-winner");
              $("body").append("<div id='blanket'></div>");
            }, 100);
          }
        };
      })(names, delay);

      setTimeout(internalCallback, 0);
    }

    // clearAllSafety: function() {
    //   this.$el.append(
    //     "<div id='clear-all' class='hidden-trigger'>CLEAR ALL</div>"
    //   );
    //   // Give a 3 second delay before removing clear-all switch
    //   setTimeout(function() {
    //     $("#clear-all").remove();
    //   }, 3000);
    // },

    // clearAll: function() {
    //   _.each(Entries.all(), function(entry) {
    //     entry.remove();
    //   });
    //   $(".name-list").empty();
    //   $("#clear-all").remove();
    //   return false;
    // }
  });

  MyApp = new App();
});

// Snow from https://codepen.io/radum/pen/xICAB

(function() {
  congratsSound = new Sound("assets/sounds/crowd-1.mp3");
  backgroundSound = new Sound("assets/sounds/bg-sound-2.mp3", true);
  rollSound = new Sound("assets/sounds/slowRoll-1.mp3", true);
  rollSound.volumeDown();
  winSound = new Sound("assets/sounds/winRoll.mp3");
  winSound.volumeDown();

  // $(".pop-up").addClass("open");
  $(".close").click(function() {
    // $(".pop-up").addClass("open");
    // console.log("run click");
    setTimeout(function() {
      $("#winnerPopup").html("");
    }, 1000);
  });
  var isBgPlaying = false;
  $("body").click(function() {
    if (!isBgPlaying) {
      console.log("Song playing...");
      backgroundSound.play();
      isBgPlaying = true;
    }
  });
  // $(".pop-up .close").click(function() {
  //   $(".pop-up").removeClass("open");
  // });

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
