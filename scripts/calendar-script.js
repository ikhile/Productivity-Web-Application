$(document).ready(function (){
    events = getFromLocalStorage("calendar")

    today = new Date()
    todayDD = today.getDate()
    todayMM = today.getMonth() + 1
    todayYY = today.getFullYear()


    showDate = todayDD
    showMonth = todayMM
    showYear = todayYY

    let url = new URL(window.location.href), params = new URLSearchParams(url.search)
    console.log(url, params)
    if (params.has("date")) {
        let date = params.get("date").split("-")
        if (date[1] <= 12 && date[2].length == 4 && date[0] <= getDaysInMonth(date[1], date[2])) { // checks date is valid
            showDate = parseInt(date[0])
            showMonth = parseInt(date[1])
            showYear = parseInt(date[2])
        }
    }

    $("#calendar-pop-up").hide()
    loadCalendarGrid(showMonth, showYear)
    loadDayView(showDate, showMonth, showYear)
})

let events
let today, todayDD, todayMM, todayYY
let showDate ,showMonth, showYear
let daysOfWeek = { 1: "M", 2: "T", 3: "W", 4: "Th", 5: "F", 6: "S", 7: "S" }
let daysInMonth = getDaysInMonth(showDate, showYear)
let changeMade = false

function loadCalendarGrid(month, year) { // for now using 1-based months like IRL
    let grid = $("#calendar-grid")
    grid.empty()

    let day = 1
    let firstDayOfMonth = new Date(showYear, showMonth - 1, 1).getDay()
    if (firstDayOfMonth == 0) firstDayOfMonth = 7 // sundays are zero using getDay()

    let isCurrentMonth = (showYear == todayYY && showMonth == todayMM)
    daysInMonth = getDaysInMonth(showMonth, showYear)

    $("#month-view h3").html(`${dateMonth(showMonth)} ${showYear}`)

    // append days of week
    for (let i = 1; i <= 7; i++) {
        $("#calendar-grid").append(`<h5>${daysOfWeek[i]}</h5>`)
    }

    // append dates of month
    for (let i = 1; i <= 42; i++) { // 1-indexed to correspond to dates
        if (i < firstDayOfMonth) {
            grid.append(`<span></span>`) // empty span to fill grid cell

        } else if (day <= daysInMonth) {
            let isToday = isCurrentMonth && day == todayDD
            let isCurrent = day == showDate
            console.log(day, isCurrent)
            let classes = ("day-btn" + (hasEvents(day, showMonth, showYear) ? " has-events" : "") + (isToday ? " today" : "") + (isCurrent ? " current" : "")).trim()

            grid.append(`<button class="${classes}" onclick="changeDay(this.innerHTML)">${day}<span class='date-dot'>&bull;</span></button>`)
            day++
        }
    }
}

function loadDayView() {
    let grid = $("#event-grid")
    grid.empty()

    if (hasEvents(showDate, showMonth, showYear)) {
        let daysEvents = sortDaysEvents(getEventsByDate(showDate, showMonth, showYear))
        for (let event of daysEvents) {
            let locationP = event.location ? `<p class="location">&#x1f4cc;${event.location}</p>` : ""
            let descriptionP = event.description ? `<p class="description">${event.description}</>` : ""
            grid.append(
                `<div class="event">
                    <p class="timestamp">${event.allDay ? "All Day" : (event.start + "&nbsp;-&nbsp" + event.end)}</p>
                    <p>${event.title}</p>
                    ${descriptionP}
                    ${locationP}
                    <button onclick="deleteEvent(${event.id})">Delete</button>
                    <button onclick="addEditEvent(true, ${event.id})">Edit</button>                   
                </div>`
            )
        }

    } else {
        grid.append(`<p class="no-events" style="text-align: center">No events<p>`)
    }


    $("#day-view h3").html(`${showDate}${dateOrdinals(showDate)} ${dateMonth(showMonth)} ${showYear}`)

}

function sortDaysEvents(daysEvents) {
    let allDayEvents = daysEvents.filter((a) => a.allDay)
    let otherEvents = daysEvents.filter((a) => !a.allDay).sort((a, b) => new Date(a.date + "T" + a.start) - new Date(b.date + "T" + b.start))

    return allDayEvents.concat(otherEvents)
}

$("#prev-month").click(function (){
    changeMonth(false)
})

$("#next-month").click(function (){
    changeMonth(true)
})

function changeMonth(next, load = true) {
    if (next) {
        showMonth++
        if (showMonth > 12) {
            showMonth = 1
            showYear++
        }
    }

    else {
        showMonth--
        if (showMonth < 1) {
            showMonth = 12
            showYear--
        }
    }

    daysInMonth = getDaysInMonth(showMonth, showYear)

    if (load) {
        if (showDate > daysInMonth) showDate = daysInMonth
        loadCalendarGrid(showMonth, showYear)
        loadDayView()
    }
}

// The following function is from https://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript#answer-1184359
function getDaysInMonth (month, year) { // uses 1-based month, not 0-based
    return new Date(year, month, 0).getDate();
}

function changeDay(date) {
    if (date == 'prev') {
        showDate--
        if (showDate < 1) {
            changeMonth(false, false)
            showDate = daysInMonth
        }

    } else if (date == 'next') {
        showDate++
        if (showDate > daysInMonth) {
            changeMonth(true, false)
            showDate = 1
        }

    } else {
        showDate = date.match(/\d+/g)[0] // strips off the dot if coming from calendar grid button
    }
    
    loadCalendarGrid(showMonth, showYear)
    loadDayView()
}

function hasEvents(day, month, year) {
    // return events.hasOwnProperty(year)
    //         && events[year].hasOwnProperty(month)
    //         && events[year][month].hasOwnProperty(day)
    //         && events[year][month][day].length > 0

    return getEventsByDate(day, month, year).length > 0
}

function getEventsByDate(day, month, year) {
    let date = `${year}-${leadingZeroes(month)}-${leadingZeroes(day)}`
    return events.filter(a => a.date == date)
}

function addEditEvent(edit = false, eventId = null) {
    $("#calendar-pop-up").show()
    $("#calendar-pop-up h3").html(edit ? "Edit Event" : "Add Event")
    $("input[name=edit-mode]").attr("checked", edit)
    $("#event-title").focus()

    if (edit) { // pre-fill form with current event info including ID
        let editEvent = events.find((a) => a.id == eventId)

        $("input[name=event-id]").val(eventId)
        $("#event-date").val(editEvent.date)
        $("#event-title").val(editEvent.title)
        $("#event-location").val(editEvent.location)
        $("#event-description").val(editEvent.description)

        if (editEvent.allDay) {
            $("#all-day").attr("checked", true).change() // manually trigger change event to hide start/end inputs

        } else {
            $("#all-day").attr("checked", false).change() // manually trigger change event to show start/end inputs
            $("#event-start").val(editEvent.start)
            $("#event-end").val(editEvent.end)
        }

    } else { // reset input values
        $("#event-date").val(`${showYear}-${leadingZeroes(showMonth)}-${leadingZeroes(showDate)}`)
        $("#event-title").val("")
        $("#event-location").val("")
        $("#event-description").val("")
        $("#event-start").val("12:00")
        $("#event-end").val("13:00")
    }

    // track changes to determine whether to confirm on cancel
    changeMade = false
    $("#calendar-pop-up input, #calendar-pop-up textarea").on("change", function(){
        changeMade = true
    })
}

function calendarCancel() {
    if (!changeMade || confirm("Are you sure you want to leave without saving?")) {
        $("#calendar-pop-up").hide()
    }
}

$("#all-day").on("change", function (){
    let inputs = $("#event-start, #event-end, label[for=event-start], label[for=event-end]")
    if ($(this).prop("checked")) {
        inputs.hide()
    } else {
        inputs.show()
    }
})

function calendarSave() {
    let form = $("#calendar-pop-up form").get(0)
    let elements = form.elements
    let editMode = elements["edit-mode"].checked
    let isValid = true

    // validate
    $("#calendar-pop-up div p").remove()
    let cancelBtn = $("#calendar-pop-up form button:first-of-type")

    if (elements["event-title"].value == "") {
        cancelBtn.before("<p>Event must have a title</p>")
        isValid = false
    }

    if (elements["event-date"].value == "") {
        cancelBtn.before("<p>Event must have a date</p>")
        isValid = false
    }

    if (!elements["all-day"].checked) {
        if (elements["event-start"].value == "") {
            cancelBtn.before("<p>Events that are not all day must have start and end time</p>")
            isValid = false
        }

        if (elements["event-start"].value > elements["event-end"].value) {
            cancelBtn.before("<p>End time must be after start time</p>")
            isValid = false
        }
    }

    if (isValid) {
        if (editMode) {
            let index = events.findIndex((a) => a.id == elements["event-id"].value)
            events[index].date = sanitise(elements["event-date"].value)
            events[index].title = sanitise(elements["event-title"].value)
            events[index].allDay = elements["all-day"].checked
            events[index].location = sanitise(elements["event-location"].value)
            events[index].description = sanitise(elements["event-description"].value)

            if (!events[index].allDay) {
                events[index].start = sanitise(elements["event-start"].value)
                events[index].end = sanitise(elements["event-end"].value)
            }

        } else {
            let newEvent = {
                id: localStorage.nextCalendarID,
                date: sanitise(elements["event-date"].value),
                title: sanitise(elements["event-title"].value),
                allDay: elements["all-day"].checked,
                location: sanitise(elements["event-location"].value),
                description: sanitise(elements["event-description"].value),
            }

            if (!newEvent.allDay) {
                newEvent.start = sanitise(elements["event-start"].value)
                newEvent.end = sanitise(elements["event-end"].value)
            }

            events.push(newEvent)
            localStorage.nextCalendarID++
        }

        setLocalStorage("calendar", events)
        $("#calendar-pop-up").hide()
        loadDayView()
        loadCalendarGrid(showMonth, showYear)
        changeMade = false
    }
}

function deleteEvent(eventId) {
    let message = `Are you sure you want to delete the event ${events.find(a => a.id == eventId).title}?`
    if (confirm(message)) {
        events = events.filter(a => a.id != eventId)
        setLocalStorage("calendar", events)
        loadDayView()
    }
}


// TEST DATA
if (!localStorage.hasOwnProperty("calendar")) {
   /* let cal = {
        2022: { // YYYY
            3: { // MM
                4: [ // DD
                    {
                        id: 0,
                        title: "Mum's Birthday",
                        allDay: true,
                    }, {
                        id: 1,
                        title: "UXD Museum",
                        start: "9:45",
                        end: "13:00",
                        location: "National Railway Museum"
                    }
                ]
            }
        }
    } */

    let cal = [
        {
            id: 0,
            date: "2022-04-08",
            title: "Test 2",
            allDay: false,
            start: "10:00",
            end: "11:00"
        },{
            id: 1,
            date: "2022-04-08",
            title: "Test",
            allDay: true
        },{
            id: 2,
            date: "2022-04-08",
            title: "Test 3",
            allDay: false,
            start: "09:00",
            end: "09:15"
        }
    ]

    setLocalStorage("nextCalendarID", 3)
    setLocalStorage("calendar", cal)
}