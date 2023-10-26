$(document).ready(function (){
    setName()

    setWidgetGrid()
    $("#widget-grid p").addClass("active")
    setNotesDropdown()
    $("#choose-widget, .widget-options, #widget-save, #widget-reset").hide()
    setBgSettings()
    showGradient()

    console.log(localStorage.darkMode)
    if (localStorage.darkMode === true || localStorage.darkMode == "true") $("#dark-mode").attr("checked", "checked") // strict equals needed here as any string is truthy
    else  $("#light-mode").attr("checked", "checked")
})

let widgets = getFromLocalStorage("widgets")
let bgSettings = getFromLocalStorage("background")
let activeWidget
let widgetChanged = false

$("#widget-grid >").click(function (){
    let message = "Are you sure you want to leave this page?\n\nYour changes to this widget will not be saved.\n\nClick OK to discard changes, or Cancel to continue editing"

    if (!widgetChanged || confirm(message)) {
        $("#widget-grid >").removeClass("active")
        $(this).addClass("active")

        activeWidget = hyphenToCamel($(this).attr("id").match(/(?<=change-).+/)[0])
        widgetChanged = false

        let type = widgets[activeWidget].widgetType
        showWidgetOptions(type)
    }
})

function setWidgetGrid() {
    widgetChanged = false
    for (let key in widgets) {
        let id = camelToHyphen(key), widget = widgets[key], type = widget.widgetType
        $(`#change-${id}`).text(type != "none" ? type : "")
    }
}

function showWidgetOptions(type) {
    // hide widget options and remove checked to be shown if needed based on type
    $(".widget-options").hide()
    // $("input[type=radio][name=widgets]").removeAttr("checked")
    $("#widget-msg").remove()

    $("#choose-widget, #widget-save, #widget-reset").show()
    $("#choose-widget #" + type).attr("checked", "checked")
    if (!type) $("#choose-widget [value=none]").attr("checked, checked")

    switch (type) {
        case "clock":
            showClockOptions()
            break
        case "note":
            showNoteOptions()
            break
        // case "calendar":
        //     showCalendarOptions()
        //     break
    }

    function showClockOptions() {
        $("#clock-options").show()
        let check = widgets[activeWidget].twentyFourHour ? $("#twenty-four") : $("#twelve")
        check.attr("checked", "checked")

        check = widgets[activeWidget].showSeconds ? $("#seconds-true") : $("#seconds-false")
        check.attr("checked", "checked")
    }

    function showNoteOptions() {
        $("#note-options").show()
        $("option[value=note-id-" + widgets[activeWidget].noteID + "]").attr("selected", "selected")
    }

    function showCalendarOptions() {
        $("#calendar-options").show()
    }
}

$("input[name='widgets']").on("change", function(){
    showWidgetOptions($(this).val())
})

$("#home-settings input").on("change", function(){
    widgetChanged = true
})

$("#widget-save").click(function (){
    // let newSettings = JSON.parse(JSON.stringify(activeWidget)) // Creating a deep copy of an object. Source: https://www.samanthaming.com/tidbits/70-3-ways-to-clone-objects/
    // let type = activeWidget.widgetType

    let checked = $("input[name='widgets']:checked") // Get checked radio button. Source: https://stackoverflow.com/questions/8622336/jquery-get-value-of-selected-radio-button#answer-23053203


    if (checked.length > 0) {
        let newWidget = {
            widgetType: checked.val()
        }

        if (newWidget.widgetType == "clock") {
            newWidget.twentyFourHour = $("input[name='clock-hours']:checked").val() == 24
            newWidget.showSeconds = $("input[name='show-seconds']:checked").val() == "true"
        }

        else if (newWidget.widgetType == "note") {
            newWidget.noteID = parseInt($("#choose-note").val().match(/(?<=note-id-)\d+/)[0])
        }

        else if (newWidget.widgetType == "timer") {
            newWidget.active = false
            newWidget.ringAt = null
            newWidget.label = null
            newWidget.duration = {
                hours: 0,
                minutes: 10,
                seconds: 0,
            }
        }

        widgets[activeWidget] = newWidget
        setLocalStorage("widgets", widgets)
        widgets = getFromLocalStorage("widgets")

        setWidgetGrid()
        $(".widget-options, #choose-widget, #widget-save, #widget-reset").hide()
        $("#widget-grid p").addClass("active")
    } else {
       $("#widget-save").before("<p id='widget-msg'>Please choose a widget</p>")
    }
})

$("#widget-reset").click(function (){
    setWidgetGrid()
    $(".widget-options, #choose-widget, #widget-save, #widget-reset").hide()
    $("#widget-grid p").addClass("active")
})

function setNotesDropdown() {
    let notes = sortNotesByUpdated(getFromLocalStorage("notes")), noteSelect = $("#choose-note")

    for (let note of notes) {
        let id = "note-id-" + note.id

        let updated = new Date(note.updated)
        let timestamp = `${leadingZeroes(updated.getDate())}/${leadingZeroes(updated.getMonth() + 1)}/${updated.getFullYear().toString().slice(-2)} ${leadingZeroes(updated.getHours())}:${leadingZeroes(updated.getMinutes())}`

        if (note.list) {note.content = note.content.replace("\n", ", ")}

        let max = 50
        let str = (note.title ? note.title : "") + (note.title && note.content ? " | " : "") + note.content
        let snippet = str.length > max ? str.slice(0, max) + "..." : str
        if (snippet.length == 0) snippet = "Blank note"
        noteSelect.append(`<option value="${id}">${timestamp} ~ ${snippet}</option>`)
    }
}

function setName() {
    $("#current-name").show()
    $("#name-input").hide()
    $("#cancel-name, #save-name").css({ "visibility": "hidden", "opacity": 0 })
    $("#cancel-name").css("transition", "all 0.35s ease-in-out");
    // $("#save-name").css("transition", "all 0.5s ease-in-out");

    let pd = getFromLocalStorage("personalDetails")
    $("#name-input").val(pd.name)
    $("#current-name").text(pd.name).css("min-width", $("#name-input").width() - 3)
}

$("#current-name").click(function(){
    $(this).hide()
    $("#name-input").show().focus()
    $("#cancel-name, #save-name").css({ "visibility": "visible", "opacity": 1 })
    $("#save-name").css("transition", "all 0.25s ease-in-out");
    $("#cancel-name").css("transition", "all 0.5s ease-in-out");
})

$("#cancel-name").click(function (){
    setName()
})

$("#save-name").click(function() {
    if ($("#name-input").val()) {
        let pd = getFromLocalStorage("personalDetails")
        pd.name = sanitise($("#name-input").val())
        setLocalStorage("personalDetails", pd)
    }
    setName()
})

function setBgSettings(){
    let coloursDiv = $("#bg-gradient-colours div").empty()

    if (bgSettings.hasOwnProperty("gradientColours")) {
        for (let colour of bgSettings.gradientColours) {
            coloursDiv.append(`<input type="color" value="${colour}" oninput="showGradient()">
                                    <button class="delete-colour" onclick="deleteColour($(this))">Delete</button>`)
        }

    } else {
        coloursDiv.append(`<input type="color" value="#ffffff" oninput="showGradient()">
                                <button class="delete-colour" onclick="deleteColour($(this))">Delete</button>
                                <input type="color" value="#000000" oninput="showGradient()">
                                <button class="delete-colour" onclick="deleteColour($(this))">Delete</button>`)
    }

    if ($("#bg-gradient-colours input[type=color]").length <= 2) $(".delete-colour").attr("disabled", true)

    if (bgSettings.hasOwnProperty("solidColour")) {
        $("#bg-solid-options input[type=color]").val(bgSettings.solidColour)
    }

    if (bgSettings.hasOwnProperty("gradientAngle")) {
        $("#angle").val(bgSettings.gradientAngle)
    }

    angleLabel()

    if (bgSettings.bgType == "solid") {
        $("fieldset[id^=bg-gradient]").hide()
        $("#bg-solid").attr("checked", "checked")
        $("#show-gradient").hide()

    } else if (bgSettings.bgType == "gradient") {
        $("#bg-gradient").attr("checked", "checked")
        $("#bg-solid-options").hide()

        $(`input[name=bg-gradient-type][value=${bgSettings.gradientType}]`).attr("checked", "checked")

        if ($("#bg-radial").attr("checked")) {
            // $("#angle, label[for=angle]").css({ visbility: "visible", opacity: 1 })
            $("#angle, label[for=angle]").css({ visbility: "hidden", opacity: 0 })
        }
        showGradient()
    }
}

$("input[name=bg-gradient-type]").on("change", function() {
    console.log("change")
    let type = $(this).val()
    $("#angle, label[for=angle]").css(type == "linear" ? { visbility: "visible", opacity: 1 } : { visbility: "hidden", opacity: 0 })
    showGradient()
})

$("#angle").on("input", function() {
    angleLabel()
    showGradient()
})

function angleLabel() {
    $("label[for=angle] span").html(": " + $("#angle").val() + "&deg;")
}

$("input[name=bg]").change(function() {
    showBgOptions($(this).val())
    showGradient()
})


function showBgOptions(type){
    switch (type) {
        case "solid":
            $("fieldset[id^=bg-gradient]").hide()
            $("#bg-solid-options").show()
            $("#show-gradient").hide()
            break
        case "gradient":
            $("#bg-solid-options").hide()
            $("fieldset[id^=bg-gradient]").show()
            $("#show-gradient").show()

    }
}

$("#add-colour-btn").click(function(){
    let maxColours = 10, numInputs = $("#bg-gradient-colours input[type=color]").length
    if (numInputs < maxColours) {
        let lastColour = $("#bg-gradient-colours input[type=color]:last-of-type").val()
        $("#bg-gradient-colours div").append(`<input type="color" value="${lastColour}" oninput="showGradient()"><button class="delete-colour" onclick="deleteColour($(this))">Delete</button>`)
    }

    numInputs = $("#bg-gradient-colours input[type=color]").length

    if (numInputs > 2) {
        $(".delete-colour").removeAttr("disabled")
    }

    if (numInputs >= maxColours) {
        $(this).hide()
    }

    showGradient()
})

function deleteColour(button) {
    let numInputs = $("#bg-gradient-colours input[type=color]").length

    if (numInputs > 2) {
        button.prev().remove()
        button.remove()
    }

    numInputs = $("#bg-gradient-colours input[type=color]").length
    if (numInputs == 2) {
        $(".delete-colour").attr("disabled", true)
    }

    showGradient()
}

$("#bg-reset").click(function (){
    setBgSettings()
})

function showGradient() {
    let type = $("input[name=bg-gradient-type]:checked").val()
    if (!type) {
        $("input[name=bg-gradient-type][value=linear]").attr("checked", "checked")
        type = "linear"
    }
    let colours = $("#bg-gradient-colours input[type=color]").get().map((a) => a.value) // use JS here as .get() converted JQuery to JS DOM object

    let gradient = type + "-gradient("
    if (type == "linear") gradient += $("#angle").val() + "deg, "
    gradient += colours.join(", ")
    gradient += ")"

    console.log(type, gradient)
    $("#show-gradient").css("background", gradient)
}


$("#bg-save").click(function (){
    let type = $("input[name=bg]:checked").val()
    bgSettings.bgType = type

    if (type == "gradient") {
        bgSettings.gradientType = $("input[name=bg-gradient-type]:checked").val()
        bgSettings.gradientAngle = $("#angle").val()
        bgSettings.gradientColours = $("#bg-gradient-colours input[type=color]").get().map((a) => a.value)

    } else if (type == "solid") {
        bgSettings.solidColour = $("#bg-solid-options input[type=color]").val()
    }

    setLocalStorage("background", bgSettings)
    bgSettings = getFromLocalStorage("background")
    setBackground()
})

$("#reverse-colours").click(function() {
    let colourInputs = $("#bg-gradient-colours input[type=color]")
    let colours = colourInputs.get().map(a => a.value).reverse()
    for (let i in colourInputs) {
        colourInputs[i].value = (colours[i]) // use JS over jQuery here
    }
    showGradient()
})

$("#colour-mode-save").click(function(){
    localStorage.darkMode = $("input[name=mode]:checked").val() == "dark-mode"
    setDarkLightMode()
})



// Below is my attempt to allow user to upload an image to use as background
// Unfortunately any image's data URI is too long to save to localStorage

/* let file, fileW, fileH, fileURL

$("#background-settings input[type=file]").on("change", function(event) {
    // Source https://www.codegrepper.com/code-examples/html/input+type%3D%22file%22+and+display+image
    file = event.target.files[0]
    fileURL = URL.createObjectURL(event.target.files[0])

    $("#file-img").remove()
    $("#background-settings").append(`<img id="file-img" src="${fileURL}" onload="imageLoaded($(this))">`)
})

function imageLoaded(img){
    console.log(img[0], img[0].width)
    let fileW = img[0].width, fileH = img[0].height
}

$("#upload-image").click(function(){
    if ((/image\ * /).test(file.type)) {

        let fileImg = $("#file-img").get(0)

        // Source: https://hacks.mozilla.org/2012/02/saving-images-and-files-in-localstorage/
        let imgCanvas = document.createElement("canvas"), imgContext = imgCanvas.getContext("2d")
        imgCanvas.width = fileImg.width
        imgCanvas.height = fileImg.height
        imgContext.drawImage(fileImg, 0, 0, fileImg.width, fileImg.height)

        $("body").append(imgCanvas)

        let imgAsDataUrl = imgCanvas.toDataURL("image/png")
        let smaller = imgCanvas.toDataURL("image/png", 0.01)
        console.log(imgAsDataUrl.length, smaller.length)

        let bgImages
        if (localStorage.hasOwnProperty("bgImages")) {
            bgImages = getFromLocalStorage("bgImages")
        } else {
            bgImages = []
        }
        bgImages.push(imgAsDataUrl)
        console.log(bgImages)
        setLocalStorage("bgImages", bgImages)

    } else {
        alert("Please upload an image file")
        file = null
    }
}) */
