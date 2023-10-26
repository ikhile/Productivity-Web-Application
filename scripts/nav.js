$(document).ready(function(){
    setCurrentPage()
})

$("nav").prepend(`
    <ul>
<!--        <li><a href="index.html">Home</a></li>-->
        <li><a href="calendar.html">Calendar</a></li>
        <li><a href="notes.html">Notebook</a></li>
        <li><a href="settings.html">Settings</a></li>
    </ul>
`)

function setCurrentPage() {
    $("nav li").each(function (){
        let relUrl = $(this).html().match(/(?<=href=["']).*(?=["'])/)
        let regex = new RegExp(relUrl, "g")

        if (window.location.href.match(regex)) {
            $(this).addClass("current")
        }
    })
}