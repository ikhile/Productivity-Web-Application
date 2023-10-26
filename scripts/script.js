// THIS SCRIPT SHOULD BE INCLUDED ON EVERY PAGE
// TEST DATA WILL BE REMOVED WITH THE SAME FUNCTIONS USED ON SETTINGS PAGE

$(document).ready(function() {
    setBackground()
    setDarkLightMode()
    console.log($("header").outerHeight(), $("main").css("padding-bottom"))
    $("main").css("padding-top", $("header").outerHeight() + parseInt($("main").css("padding-bottom")))

    // only run if not on index.html:
    if (!/index.html/.test(window.location.href)) timerInBackground()
})


// DISPLAY / LAYOUT FUNCTIONS

function setBackground() {
    let bg = getFromLocalStorage("background")
    let type = bg.bgType

    console.log(type)

    switch (type) {
        case "gradient":
            $("body").css("background", `${bg.gradientType}-gradient(${bg.gradientAngle}deg, ${bg.gradientColours})`)
            break
        case "solid":
            $("body").css("background", bg.solidColour)
    }

    if (type == "solid") {
        $("body").css("background-color", bg.solidColour)
    } else if (type == "gradient") {
        if (bg.gradientType == "linear") $("body").css("background", `linear-gradient(${bg.gradientAngle}deg, ${bg.gradientColours})`)
        else if (bg.gradientType == "radial") $("body").css("background", `radial-gradient(${bg.gradientColours})`)
    }
}

function setDarkLightMode() {
    let root = $(":root")
    let darkMode = localStorage.darkMode == "true"

    for (let i = 1; i < 10; i++) {
        // The following lines of code set the secondary background colours based on a value in local storage
        // The implementation is based on the following source, adapted to use jQuery: https://www.w3schools.com/css/css3_variables_javascript.asp

        if (darkMode) {
            root.css("--text-colour", "white")
            root.css(`--bg-${i}0`, `rgba(0, 0, 0, ${i}0%)`)
        } else {
            root.css("--text-colour", "black")
            root.css(`--bg-${i}0`, `rgba(255, 255, 255, ${i}0%)`)
        }

        // end of citation
    }
}



// LOCAL STORAGE FUNCTIONS

function setLocalStorage(key, json) {
    let jsonStr = JSON.stringify(json)
    localStorage.setItem(key, jsonStr)
}

function getFromLocalStorage(key) {
    let str = localStorage[key]
    return JSON.parse(str)
}



// TEXT FUNCTIONS

function camelToHyphen(camelStr) {
    let newStr = ""
    for (let i = 0; i < camelStr.length; i++) {
        if (/[A-Z]/.test(camelStr[i])) {
            newStr += "-" + camelStr[i].toLowerCase()
        } else {
            newStr += camelStr[i]
        }
    }
    return newStr
}

function hyphenToCamel(hyphenStr) {
    let newStr = ""
    let capitaliseNext = false
    for (let i = 0; i < hyphenStr.length; i++) {
        if (/-/.test(hyphenStr[i])) {
            capitaliseNext = true
        } else {
            newStr += capitaliseNext ? hyphenStr[i].toUpperCase() : hyphenStr[i]
            capitaliseNext = false
        }
    }
    return newStr
}



// NOTE FUNCTIONS

function sortNotesByUpdated(notes) {
    return notes.sort((a, b) => new Date(b.updated) - new Date(a.updated))
}

function getNoteById(id) {
    let notes = getFromLocalStorage("notes")

    for (let note of notes) {
        if (note.id == id) return note
    }
    return false
}

function lineBreakToTag(note) { // convert note string to formatted html
    if (!note.title && !note.content) return "" // if no title or content return blank
    if (!note.checkedItems) note.checkedItems = []

    let content = note.content.split("\n")
    let output = "", tag = note.list ? "li" : "p"
    let url = window.location.href

    if (note.hasOwnProperty("title") && note.title.length > 0) {
        output += `<h3>${note.title}</h3>`
    }

    if (note.content) {
        for (let para of content) {
            let checked = false
            let onClick = /index.html/.test(url) ? "checkNote" : "checkUncheck" // different onclick function depending on page

            // encodeForHtml() solves issue where code doesn't match if text includes special chars
            if (tag == "li" && (note.checkedItems.indexOf(encodeForHtml(para)) >= 0 || note.checkedItems.indexOf(para) >= 0)) {
                checked = true
            }
            output += `<${tag} ${tag == "li" ? `onclick=${onClick}($(this))` : ""}` + (checked ? " class='checked'" : "") + `>${para}</${tag}>`
        }
    }

    return output
}

function lineBreakToN(input) { // converts html note into a string with \n characters for new lines
    console.log(input)
    if (input == "") return input
    let regex = /(?<=<(p|li)( onclick=(["']).*(["']))?( class=(["']).*(["']))*>).+?(?=<\/(p|li)>)/g
    let match = input.match(regex)
    return match === null ? "" : match.join("\n")
}

function sanitise(input) {
    return input.replaceAll("<", "&lt;").replace(">", "&gt;")
}

// The following function is based on a Stack Overflow answer: https://stackoverflow.com/questions/784586/convert-special-characters-to-html-in-javascript#answer-784698
function encodeForHtml(str) {
    let element = document.createElement("div")
    element.textContent = str
    str = element.innerHTML
    return str
} // End of citation



// DATE FUNCTIONS

function dateOrdinals(date) {
    date = date % 100 // not really needed but ensures function works for numbers > 100
    if (date >= 4 && date <= 20) return "th"
    switch (date % 10) {
        case 1:
            return "st"
        case 2:
            return "nd"
        case 3:
            return "rd"
        default:
            return "th"
    }
}

function dateMonth(month) {
    let months = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December"
    }

    return months[month]
}

function leadingZeroes(input, digits = 2) {
    return input.toString().padStart(digits, "0")

    // This function was created to simplify adding leading zeroes to a number
    // For example
    // first method:      ( "0" + updated.getMinutes() ).slice(-2)
    // later:             updated.getMinutes().toString().padStart(2, "0")
    // now:               leadingZeroes(updated.getMinutes())

    // This function makes use of the String.padStart() method. Source: https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript#answer-10073788
}


// TIME FUNCTIONS

function timeToMillis (h, m, s) {
    let secondMillis = 1000
    let minuteMillis = secondMillis * 60
    let hourMillis   = minuteMillis * 60

    return h * hourMillis + m * minuteMillis + s * secondMillis
}

function addTimeToNow(h, m, s) {
    // For this function, the method Date.getTime() was used as explained at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime
    // Otherwise, I figured out how to add a time to a date through trial and error
    let now = new Date()
    return new Date( now.getTime() + timeToMillis(h, m, s) )
}

// Combines and converts hours, minutes, and seconds to seconds only
function hmsToSeconds(h, m, s) {
    return h * 3600 + m * 60 + s
}


// TIMER

function timerInBackground(){
    let widgets = getFromLocalStorage("widgets")
    let activeTimers = getActiveTimers().sort((a, b) => new Date(a.ringAt) - new Date(b.ringAt) ) // sort from soonest ring time to furthest

    if (activeTimers.length == 0) return

    let firstTimer = activeTimers[0] // the first timer that is due to ring
    let secondsTilRing = firstTimer.timeLeft // seconds until first timer should ring

    // set alarm to "ring" on timeout
    setTimeout(function() {
        // set timer to inactive in local storage
        widgets[firstTimer.key].active = false
        delete firstTimer.key // not needed in local storage
        setLocalStorage("widgets", widgets)

        // run again in case of more active timers
        timerInBackground()

        // alert user - done last so local storage updates before user clicks OK
        let label = "Timer: "
        if (firstTimer.label) label += firstTimer.label ? firstTimer.label : ""
        else                  label += `${leadingZeroes(firstTimer.duration.hours)}:${leadingZeroes(firstTimer.duration.minutes)}:${leadingZeroes(firstTimer.duration.seconds)}`

        alert(timerAlert(firstTimer))

    }, secondsTilRing * 1000) // This will be called in however many milliseconds

    function getActiveTimers() {
        let arr = []
        for (let i in widgets) {
            if (widgets[i].widgetType == "timer" && widgets[i].active) {
                widgets[i].key = i // storing key/position for use later
                arr.push(widgets[i])
            }
        }
        return arr
    }
}

function timerAlert(timer) {
    let message = ""
    if (timer.label && timer.label.length > 1) message = `"${timer.label}"`
    else {
        if (timer.duration.hours > 0)   message += ` ${timer.duration.hours} hour`
        if (timer.duration.minutes > 0) message += ` ${timer.duration.minutes} minute`
        if (timer.duration.seconds > 0) message += ` ${timer.duration.seconds} second`
    }

    return message.trim() + " timer:\n\nTime's up!"
}



// INITIAL DATA
let initialData = {
    notes: [
        {
            id: 0,
            list: false,
            content: "This is a note.\nClick edit to change, and save when done.",
            checkedItems: [],
            created: new Date(),
            updated: new Date(),
            neverSaved: false
        },
        {
            id: 1,
            list: true,
            content: "This is a list note\nEnter each item on a new line\nClick the checkbox to tick or untick and item\nToggle checkboxes by clicking Edit > \"Show checkboxes\"",
            checkedItems: ["Enter each item on a new line"],
            created: new Date(),
            updated: new Date(),
            neverSaved: false

        },
    ],

    widgets: {
        // topLeft:      { widgetType: null },
        // topMiddle:    { widgetType: null },
        // topRight:     { widgetType: null },
        // bottomLeft:   { widgetType: null },
        // bottomMiddle: { widgetType: null },
        // bottomRight:  { widgetType: null },
        topLeft:      { },
        topMiddle:    { },
        topRight:     { },
        bottomLeft:   { },
        bottomMiddle: { },
        bottomRight:  { },
    },

    background: {
        bgType: "gradient",
        gradientType: "linear",
        gradientColours: ["#ffffff", "#008080"],
        gradientAngle: 160
    },

    personalDetails: {
        name: ""
    }
}

if (!localStorage.hasOwnProperty("firstLogin")) localStorage.firstLogin = true

if (localStorage.firstLogin == "true") {
    setLocalStorage("widgets", initialData.widgets)
    setLocalStorage("notes", initialData.notes)
    setLocalStorage("nextNoteID", Math.max(...initialData.notes.map(a => parseInt(a.id))) + 1)
    setLocalStorage("currentNoteID", 0)
    setLocalStorage("calendar", [])
    setLocalStorage("nextCalendarID", 0)
    setLocalStorage("darkMode", false)
    setLocalStorage("personalDetails", initialData.personalDetails)
    setLocalStorage("background", initialData.background)

    localStorage.firstLogin = false
}


// TEST DATA
let testData = {
    widgets: {
        topLeft:      { widgetType: "calendar" },
        topMiddle:    {
            widgetType: "clock",
            // digital: true,
            twentyFourHour: true,
            showSeconds: false
        },
        topRight:     {
            widgetType: "note",
            noteID: 0
        },
        bottomLeft:   {
            widgetType: "timer",
            active: false,
            ringAt: null,
            label: null,
            duration: {
                hours: 0,
                minutes: 1,
                seconds: 10,
            }
        },
        bottomMiddle: {
            widgetType: "note",
            noteID: 1
        },
        bottomRight:  {
            widgetType: "note",
            noteID: 2
        }
    }
}

// uncomment to force update
// setLocalStorage("widgets", testData.widgets)
