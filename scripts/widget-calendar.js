function calendar(widget) {
    let events = getFromLocalStorage("calendar")
    let today = new Date(), tomorrow = new Date(new Date().setDate(today.getDate() + 1))
    let upcomingEvents = {}

    let day = 0, maxDays = 30, eventCount = 0, maxEvents = 10
    while (day <= 1 || (eventCount <= maxEvents && day < maxDays)) { // ignore maxEvents if day is today or tomorrow
        let date = new Date(new Date().setDate(today.getDate() + day))
        let dayEvents = events.filter(a => a.date == formatDate(date))
        if (day == 0 || day == 1 || dayEvents.length > 0) {
            upcomingEvents[date] = [...events.filter(a => a.date == formatDate(date))]
            eventCount += dayEvents.length
        }

        day++
    }

    let html = `<h2>${formatDate(today, "full text")}</h2>`

    for (let date of Object.keys(upcomingEvents)) {
        html += htmlEvents(date)
    }

    return html

    function htmlEvents(date) {
        let output = `<section class='date-section'><a href='calendar.html?date=${formatDate(date, "dd-mm-yyyy")}'>`
        if (date == today)          output += "<h3>Today</h3>"
        else if (date == tomorrow)  output += "<h3>Tomorrow</h3>"
        else                        output += `<h3>${formatDate(date, "no year")}</h3>`

        if (upcomingEvents[date].length == 0) {
            output += `<p>No events</p>`

        } else {
            for (let event of upcomingEvents[date]) {
                output += `<p><span class="timestamp">${event.allDay ? "All Day" : event.start}</span>${event.title}</p>`
            }
        }

        return output + "</a></section>"
    }

    function formatDate(date, format = "yyyy-mm-dd") {
        date = new Date(date) // in case date is a string
        switch (format) {
            case "yyyy-mm-dd":
                return `${date.getFullYear()}-${leadingZeroes(date.getMonth() + 1)}-${leadingZeroes(date.getDate())}`

            case "full text":
                return `${date.getDate()}${dateOrdinals(date.getDate())} ${dateMonth(date.getMonth() + 1)} ${date.getFullYear()}`

            case "no year":
                return `${date.getDate()}${dateOrdinals(date.getDate())} ${dateMonth(date.getMonth() + 1)}`

            case "dd-mm-yyyy":
                return `${leadingZeroes(date.getDate())}-${leadingZeroes(date.getMonth() + 1)}-${date.getFullYear()}`
        }
    }
}
