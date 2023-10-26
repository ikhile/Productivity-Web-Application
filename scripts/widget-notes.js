// NOTES
function getNote(widget) {
    let note = getNoteById(widget.noteID)
    if (!note) return false

    let noteBtn = `<form action='notes.html' method='get'>
                   <input name='note-id' type='number' value='${note.id}' hidden>
                   <button type='submit'>View/Edit Note</button>
                   </form>`

    return noteBtn + lineBreakToTag(note)
}

function checkNote(listItem) {
    let widgetId = hyphenToCamel(listItem.parents(".widget").attr("id"))
    let widget = widgets[widgetId]

    let notes = getFromLocalStorage("notes")
    let note = getNoteById(widget.noteID)
    let noteID = notes.findIndex((obj) => note.content == obj.content)

    // checkUncheck() doesn't *quite* work from this script, even though code below is almost exactly the same...
    // checkUncheck(listItem, noteID)

    let text = listItem.html()
    if (listItem.hasClass("checked")) {
        listItem.removeClass("checked")
        let checkedIndex = note.checkedItems.indexOf(text)
        note.checkedItems.splice(checkedIndex, 1)
    } else {
        listItem.addClass("checked")
        note.checkedItems.push(text)
    }

    notes[noteID].checkedItems = note.checkedItems
    setLocalStorage("notes", notes)
}