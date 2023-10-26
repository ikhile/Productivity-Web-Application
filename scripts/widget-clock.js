function clock(widget) {
    let date = new Date()

    if (!widget.hasOwnProperty("digital" || widget.digital)) { // leftover from plan to have an analogue clock option
        let hh = date.getHours(), amPm = ""

        if (widget.twentyFourHour) {
            hh = leadingZeroes(hh)
        } else {
            if (hh == 0) hh = 12

            if ( hh > 12) { hh -= 12; amPm = "PM"  }
            else { amPm = "AM" }
        }

        let mm = leadingZeroes(date.getMinutes())
        let ss = leadingZeroes(date.getSeconds())

        let str = `${hh}:${mm}` + (widget.showSeconds ? `:${ss}` : ``) + `<span class="am-pm">${amPm}</span>`

        return `<p>${str}</p>`
    }
}