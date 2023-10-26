let notes, currentNoteObj, noteChanged = false

$(document).ready(function(){
    $("#edit-note").hide()

    // LOAD STORED NOTES
    notes = getFromLocalStorage("notes")

    if (notes.length > 0) {
        notesList() // called here as this function sorts notes by date
        currentNoteObj = getNoteById(notes[0].id)

        // LOAD NOTE FROM QUERY STRING
        let currentUrl = new URL(window.location.href)
        let params = new URLSearchParams(currentUrl.search)

        if (params.has("note-id")) {
            let urlNoteID = params.get("note-id")
            if (getNoteById(urlNoteID)) currentNoteObj = getNoteById(urlNoteID)
        }

        localStorage.currentNoteID = currentNoteObj.id
        loadCurrentNote()
        setCurrentNoteClass()

    } else { $("#edit-btn").hide() }
})

function loadCurrentNote() {
    if (notes.length == 0) {
        $("#note-content").empty()
        $(".created-updated").empty()
        $("#edit-btn").hide()
        return
    }

    if (notes.findIndex(a => a.id == localStorage.currentNoteID) < 0) { localStorage.currentNoteID = notes[0].id }
    currentNoteObj = getNoteById(localStorage.currentNoteID)

    let noteContent = $("#note-content")
    noteContent.html(lineBreakToTag(currentNoteObj))

    let createdDate = new Date(currentNoteObj.created), updatedDate = new Date(currentNoteObj.updated)
    let createdStr = dateToStr(createdDate), updatedStr = dateToStr(updatedDate)
    let displayStr = "Created " + createdStr + (createdStr == updatedStr ? "" : ", updated " + updatedStr)

    $(".created-updated").remove()
    noteContent.after(`<p class="created-updated">${displayStr}</p>`)

    $("#edit-note").hide()
    $("#show-note").show()
    $("#edit-btn").show()

    setCurrentNoteClass()

    function dateToStr(date) {
        let output = ""

        if (isToday(date)) {
            output += "today at "

        } else {
            output += date.getDate() + dateOrdinals(date.getDate()) + " " +
                      dateMonth(date.getMonth() + 1) +
                    ( date.getFullYear() != new Date().getFullYear() ? " " + date.getFullYear() : "" )
        }

        output += " " + leadingZeroes(date.getHours()) + ":" + leadingZeroes(date.getMinutes())
        return output
    }

    function isToday(date) {
        let now = new Date(), today = { dd: now.getDate(), mm: now.getMonth(), yy: now.getFullYear() }
        return date.getDate() == today.dd && date.getMonth() == today.mm && date.getFullYear() == today.yy
    }
}


$("#new-note").click(function() {
    $("#show-note").hide()
    $("#edit-note").show()
    $("#edit-note textarea").val("")
    $("#create-new-note").val("true")
    if (currentNoteObj) $("#show-checkboxes").prop("checked", currentNoteObj.list)
})

$("#cancel").click(function (){
    if (!noteChanged || confirm("Are you sure you want to cancel these changes?")) {
        loadCurrentNote()
    }
})

$("#save").click(function() {
    let creatingNew = $("#create-new-note").val() == "true"

    if (creatingNew) {
        let newNote = {
            id: parseInt(localStorage.nextNoteID),
            title: sanitise($("#title").val()),
            content: sanitise($("textarea").val()),
            list: $("#show-checkboxes").prop("checked"),
            created: new Date(),
            updated: new Date(),
            checkedItems: []
        }

        localStorage.nextNoteID++
        localStorage.currentNoteID = newNote.id
        notes.push(newNote)
        currentNoteObj = newNote

    } else {
        currentNoteObj.title = sanitise($("#title").val())
        currentNoteObj.content = sanitise($("textarea").val())
        currentNoteObj.list = $("#show-checkboxes").prop("checked")
        updateCheckedItems()

        let indexOfCurrentNote = notes.findIndex((a) => a.id == currentNoteObj.id)
        notes[indexOfCurrentNote] = currentNoteObj
    }

    setLocalStorage("notes", notes)

    // load page
    notesList()
    loadCurrentNote()
})

$("#edit-btn").click(function(){
    let note = currentNoteObj
    let noteContent = $("#note-content").html()
    console.log(noteContent)
    noteChanged = false

    $("#title").val(currentNoteObj.hasOwnProperty("title") ? currentNoteObj.title : "")
    $("#create-new-note").val("false")
    $("textarea").val(lineBreakToN(noteContent))
    $("#show-checkboxes").prop("checked", note.list)

    $("#show-note").hide()
    $("#edit-note").show()
    $("#edit-note textarea").focus()
})

$("input#title, textarea#content").on("change", function(){
    noteChanged = true
})

function selectNote(noteId) {
    if (noteId != localStorage.currentNoteID) {
        let leave = true
        if ($("#edit-note").css("display") != "none" && noteChanged) { // if editing a note
            leave = window.confirm("Are you sure you want to leave without saving?")
        }

        if (leave) {
            currentNoteObj = getNoteById(noteId)
            localStorage.currentNoteID = currentNoteObj.id
            loadCurrentNote()
        }
    }
}

function checkUncheck(listItem) {
    let text = listItem.html()
    if (listItem.hasClass("checked")) {
        listItem.removeClass("checked")
        let checkedIndex = currentNoteObj.checkedItems.indexOf(text)
        currentNoteObj.checkedItems.splice(checkedIndex, 1)
    } else {
        listItem.addClass("checked")
        currentNoteObj.checkedItems.push(text)
    }

    notes[getCurrentNoteIndex()] = currentNoteObj
    setLocalStorage("notes", notes)
}

function updateCheckedItems() {
    let noteContent = $("#note-content").html()
    let newArr = []
    for (let i in currentNoteObj.checkedItems) {
        let text = currentNoteObj.checkedItems[i]
        let regex = new RegExp(">" + text + "<", "g")
        if (regex.test(noteContent)) {
            newArr.push(text)
        }
    }
    currentNoteObj.checkedItems = newArr
}

function notesList() {
    notes = sortNotesByUpdated(notes)

    // must then find the current note again
    if (currentNoteObj) currentNoteObj = notes[getCurrentNoteIndex()]

    let list = ""
    for (let note of notes) {
        let listItem, text
        if (note.title) {
            text = note.title
            listItem = `<span class="snippet">${text}</span>`

        } else if (note.content.length > 0) {
            text = note.content.replace("\n", note.list ? ", " : " ")
            listItem = `<span class="snippet">${text}</span>`

        } else {
            listItem = "<span class='blank-note'>Blank note</span>"
        }

        let updated = new Date(note.updated), now = new Date(), updatedToday = false, updatedThisYear = true
        if (updated.getFullYear() == now.getFullYear() &&
            updated.getMonth() == now.getMonth() &&
            updated.getDate() == now.getDate()) {
            updatedToday = true
        }
        if (updated.getFullYear() == now.getFullYear()) {
            updatedThisYear = true
        }

        let timestamp
        if (updatedToday) {
            timestamp =  `${leadingZeroes(updated.getHours())}:${leadingZeroes(updated.getMinutes())}`
        } else {
            let dd = leadingZeroes(updated.getDate())
            let mm = leadingZeroes(updated.getMonth() + 1)
            let yy = updated.getFullYear()
            timestamp = dd + "/" + mm + (!updatedThisYear ? "/" + yy : "")
        }

        // The following line adds custom data as an HTML attribute, as explained here: https://www.w3schools.com/tags/att_global_data.asp
        list += `<li data-note-id="${note.id}" onclick="selectNote(${note.id})">${listItem}<span class="timestamp">${timestamp}</span><button class="delete-note-btn" onclick="deleteNote(${note.id})">Delete</button></li>`
    }
    $("#notes-list").html(`<ul>${list}</ul>`)

    // must run each time notes list updates
    // $(".delete-note-btn").click(function(event){
    //     deleteNote($(this).parents("li"))
    //     event.stopPropagation() // source: https://www.tutorialspoint.com/jquery/event-stoppropagation.htm
    // })
}

// function sortNotesByUpdated(notes) {
//     return notes.sort((a, b) => new Date(b.updated) - new Date(a.updated))
// }

function deleteNote(deleteId){
    if (confirm(deleteId + "Are you sure you want to delete this note?\n\nThis action cannot be undone.")) {
        notes = notes.filter(a => a.id != deleteId)
        setLocalStorage("notes", notes)
        notesList()
        loadCurrentNote()
    }
}

function setCurrentNoteClass() {
    $("#notes-list li").removeClass("current-note")
    $(`#notes-list li[data-note-id=${localStorage.currentNoteID}]`).addClass("current-note")
}

// returns the index in notes[] of the note stored in currentNotesObj
function getCurrentNoteIndex () {
    return notes.findIndex((a) => a.id == currentNoteObj.id)
}