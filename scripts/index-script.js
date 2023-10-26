$(document).ready(function(){
    setGreeting()
    setWidgets()

    setIndexInterval()
})

let indexInterval
function setIndexInterval() {
    clearInterval(indexInterval)
    indexInterval = setInterval(function(){
        setGreeting()
        countdown()
    }, 1000)
}


// WIDGETS

let widgets = getFromLocalStorage("widgets")

function setWidgets() {
    // create sections
    for (let place in widgets) {
      $("main").append("<section id='" + camelToHyphen(place) + "' class='widget " + widgets[place]["widgetType"] + "'></section>")
    }

    let nullWidgetCount = 0
    for (let widget of Object.values(widgets)) { // source for using a for/of loop on an object: https://stackoverflow.com/questions/29885220/using-objects-in-for-of-loops#answer-36615836
        if (Object.keys(widget).length == 0 || widget.widgetType == "null" ) nullWidgetCount++
    }

    if (nullWidgetCount == 6) {
        $("main").append("<p id='go-to-settings'>Please go to <a href='settings.html'>settings</a> to set home page widgets<span><br>or to change name</span></p>")
    }


    for (let pos in widgets) {
        let widget = widgets[pos]
        let type = widget.widgetType
        let htmlID = camelToHyphen(pos)
        let htmlDiv = $("#" + htmlID)

        if (type == "clock") {
            htmlDiv.html(clock(widget))

            setInterval(function() {
              htmlDiv.html(clock(widget))
            }, 1000)


        } else if (type == "note") {
            if (getNote(widget)) {
                htmlDiv.html(getNote(widget))
            } else {
                htmlDiv.addClass("note-deleted")
                htmlDiv.html(`
                    <p>This note was not found. It may have been deleted.</p>
                    <form action='notes.html'><button type='submit'>Notes</button></form>
                    <form action='settings.html'><button type='submit'>Settings</button></form>
                `)
            }

        } else if (type == "timer") {
            loadActiveTimer(widget)
            htmlDiv.html(displayTimer(widget))
            if (widget.active) htmlDiv.addClass("timer-active")
        }

        else if (type == "calendar") {
            htmlDiv.html(calendar(widget))
        }
    }
}



// GREETING

let prevHour, personalDetails = getFromLocalStorage("personalDetails")

function setGreeting() {
    if (!personalDetails.name || personalDetails.name.length == 0) {
        $("#greeting").hide()
        $("#set-name-form").show()
        $("#go-to-settings span").hide()

    } else {
        let now = new Date()
        let hour = now.getHours()

        if (!prevHour || hour != prevHour) { // only run rest of code if hour has changed
            prevHour = hour
            let greeting = "Good "

            if (hour < 12)      { greeting += "morning"  }
            else if (hour < 17) { greeting += "afternoon" }
            else                { greeting += "evening" }

            greeting += ", "
            greeting += personalDetails.name
            $("#set-name-form").hide()
            $("#greeting").text(greeting).show()

        }
    }

}

$("#set-name-form").submit(function(e) {
    if ($("#set-name").val()) {
        personalDetails.name = sanitise($("#set-name").val())
        setLocalStorage("personalDetails", personalDetails)
        setGreeting()
        $("#go-to-settings span").show()
    }

    return false // prevents page reload onsubmit
})

// LAYOUT

// NAV
$("#nav-toggle").click(toggleNav)

let navTimeout
function toggleNav() {
    if ($("nav ul").css("visibility") == "hidden") {
        $("nav ul").css({
            "visibility": "visible",
            "opacity": "1"
        })

        $("#set-name-form").css({
            "max-width": "66vw",
            "font-size": "3.5em"
        })

        $("#nav-toggle").html("<span class=\"material-symbols-outlined\">close</span>")
        navTimeout = setTimeout(toggleNav, 7500)

    } else {
        $("nav ul").css({
            "visibility": "hidden",
            "opacity": "0",
        })

        setTimeout(function() { // form will only expand after nav visibility transition is complete
            $("#set-name-form").css({
                "max-width": "",
                "font-size": ""
            })
        }, parseFloat($("nav ul").css("transition-duration")) * 1000)

        $("#nav-toggle").html("<span class=\"material-symbols-outlined\">menu</span>")

        clearTimeout(navTimeout)
    }
}

