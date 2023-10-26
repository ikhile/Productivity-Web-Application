widgets = getFromLocalStorage("widgets")

function loadActiveTimer(widget) { // If timer is running, this function allows countdown to continue from correct point
    if (widget.active) {
        widget.timeLeft = (new Date(widget.ringAt).getTime() - new Date().getTime()) / 1000 // /1000 to convert to seconds
        setLocalStorage("widgets", widgets)
        widgets = getFromLocalStorage("widgets")
    }
}

function displayTimer(widget) {
    let hh, mm, ss

    if (widget.active) {
        let remaining = widget.timeLeft
        hh = Math.floor(remaining / 3600),
        mm = Math.floor((remaining % 3600) /60),
        ss = Math.floor(remaining % 60)
    } else {
        hh = widget.duration.hours
        mm = widget.duration.minutes
        ss = widget.duration.seconds
    }

    hh = leadingZeroes(hh.toString())
    mm = leadingZeroes(mm.toString())
    ss = leadingZeroes(ss.toString())

    let labelText = widget.label ? widget.label : "<span class='no-label'>Click to label this timer</span>"
    let labelValue = widget.label ? `value="${widget.label}"` : ""

    return `<section class="timer-label">
                <div class="timer-label-update">
                    <input type="text" class="timer-label-input" placeholder="Name your timer..." ${labelValue}>  
                    <button class="cancel-timer-label" onclick="saveTimerLabel($(this), true)">Cancel</button>
                    <button class="save-timer-label" onclick="saveTimerLabel($(this))">OK</button>
                </div>
                <h2 class="timer-label-display" onclick="editTimerLabel($(this))">${labelText}</h2>    
            </section>
            
            <section class="timer-clock">
            <section class="time-section hours">
                <button class="change-time increase symbol-button" onclick="changeTimer($(this))">&#9650;</button>
                <span>${hh}</span>
                <button class="change-time decrease symbol-button" onclick="changeTimer($(this))">&#9660;</button>
            </section>
            :
            <section class="time-section minutes">
                <button class="change-time increase symbol-button" onclick="changeTimer($(this))">&#9650;</button>
                <span>${mm}</span>
                <button class="change-time decrease symbol-button" onclick="changeTimer($(this))">&#9660;</button>
            </section>
            :
            <section class="time-section seconds">
                <button class="change-time increase symbol-button" onclick="changeTimer($(this))">&#9650;</button>
                <span>${ss}</span>
                <button class="change-time decrease symbol-button" onclick="changeTimer($(this))">&#9660;</button>
            </section>
          </section>
          <button class="start-timer" onclick="startTimer($(this))">Start</button>
          <button class="stop-timer" onclick="stopTimer($(this))">Stop</button>
          <p class="timer-p">The timer will continue to run if you leave this page</p>`
}

function getParentWidget(element) { // This function returns the widget object that a given element relates to
    return widgets[hyphenToCamel(element.parents(".widget").attr("id"))]
}

function getParentIdHtml(element) { // Returns the HTML ID of an element's parent widget
    return element.parents(".widget").attr("id")
}

function startTimer(button) {
    let widgetHtml = button.parents(".widget")
    let widgetObj = widgets[hyphenToCamel(widgetHtml.attr("id"))]
    widgetHtml.addClass("timer-active")

    widgetObj.ringAt = addTimeToNow(widgetObj.duration.hours, widgetObj.duration.minutes, widgetObj.duration.seconds)
    widgetObj.timeLeft = hmsToSeconds(widgetObj.duration.hours, widgetObj.duration.minutes, widgetObj.duration.seconds)
    widgetObj.active = true

    setIndexInterval()
}

function stopTimer(button) {
    let widgetHtml = button.parents(".widget")
    let widgetObj = widgets[hyphenToCamel(widgetHtml.attr("id"))]

    widgetHtml.removeClass("timer-active")
    widgetObj.active = false
    widgetHtml.html(displayTimer(widgetObj))
}

function changeTimer(button) { // Changes time on clock when increase/decrease buttons are clicked
    let widgetId = button.parents("section.widget").attr("id"), widgetIdJSON = hyphenToCamel(widgetId)
    let timeClass = button.parents(".time-section").attr("class").match(/hours|minutes|seconds/)[0]
    let increaseDecrease = button.attr("class").match(/increase|decrease/)[0]

    let current = widgets[widgetIdJSON].duration[timeClass], newValue = current

    if (increaseDecrease == "increase" && (timeClass == "hour" || current < 59)) {
        newValue++

    } else if (current > 0) {
        newValue--
    }

    widgets[widgetIdJSON].duration[timeClass] = newValue

    // reset local storage - should stay stored on leaving page
    setLocalStorage("widgets", widgets)
    widgets = getFromLocalStorage("widgets")

    $("#" + widgetId).html(displayTimer(widgets[widgetIdJSON]))
}

function editTimerLabel(element) {
    let id = getParentIdHtml(element), widget
    if (!$(`#${id}`).hasClass("timer-active")) {
        element.hide()
        $("#" + id + " .timer-label-update").show()
        $("#" + id + " .timer-label-input").focus()
    }
}

function saveTimerLabel(button, cancel = false) {
    let widget = getParentWidget(button), id = getParentIdHtml(button)

    if (!cancel) {
        widget.label = $("#" + id + " .timer-label-input").val()
        setLocalStorage("widgets", widgets)
        getFromLocalStorage("widgets")
        $("#" + id).html(displayTimer(widget))
    }

    $("#" + id + " .timer-label-update").hide()
    $("#" + id + " .timer-label-display").show()
}

function countdown() { // Provides countdown functionality for any and all active timers on home page

    // The .get() method is used below as described here: https://stackoverflow.com/questions/2754021/jquery-get-a-list-of-values-of-an-attribute-from-elements-of-a-class#answer-2754033
    let activeTimerWidgets = $(".timer-active").get().map(function(a) { // End of citation
            let id = a.getAttribute("id")
            return {
                id: id,
                widget: widgets[hyphenToCamel(a.getAttribute("id"))]
            }
        })

    for (obj of activeTimerWidgets) {
        obj.widget.timeLeft--
        $("#" + obj.id).html(displayTimer(obj.widget))

        if (obj.widget.timeLeft <= 0) { // use less than in case of errors where clock goes into negative
            if (obj.widget.timeLeft < 0) console.log("negative time error")
            obj.widget.active = false

            setTimeout(() => { // timeout lets timer show zero before alert
                    alert(timerAlert(obj.widget))

                    // placing next line after alert() means it doesn't execute until user presses OK
                    $("#" + obj.id).html(displayTimer(obj.widget))
                                   .removeClass("timer-active")
            }, 10)
        }
    }

    setLocalStorage("widgets", widgets)
    widgets = getFromLocalStorage("widgets")
}
