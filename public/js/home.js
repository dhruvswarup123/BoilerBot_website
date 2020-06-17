var currList = null
function getRemoveButton(dataelem) {
    return `<form method='POST' action='/remove_from_queue'">
                <input type="hidden" name="id" value=${JSON.stringify(dataelem.document._id)}>
                <button type="submit">remove element?</button>
            </form>`
}
function updatePage(){
    fetch('/update_queue_deets')
    .then(response => response.json())
    .then(data => {
        console.log(data)
        let arr = document.createElement('div')
        arr.id = "request_list"
        currList = []
        for (i in data){
            let temp = document.createElement('div')
            date = new Date(data[i].document.payload.inserted_at*1000)
            temp.innerHTML = `position: ${data[i].pos} ------ to: ${data[i].document.payload.to.email} ${getRemoveButton(data[i])}`
            
            arr.appendChild(temp)
            currList.push(data[i])
        }

        rq = document.getElementById("requests")
        rq.removeChild(rq.firstChild);
        rq.appendChild(arr)

    });
    // setTimeout(updatePage, 1000)
}

updatePage()