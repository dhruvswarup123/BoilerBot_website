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
        currList = []
        let table = document.getElementById("requests_list");
        // send a note as well -TODO
        for (i in data){
            let date = new Date(data[i].document.payload.inserted_at*1000)
            let row = table.insertRow()
            row.innerHTML = `
                <td> ${data[i].pos} </td>
                <td> ${data[i].document.payload.to.name} </td>
                <td> ${data[i].document.payload.to.email} </td>
                <td> ${data[i].document.payload.purpose} </td>
                <td> n/a </td>
            `
            // temp.innerHTML = `position: ${data[i].pos} ------ to: ${data[i].document.payload.to.email} ${getRemoveButton(data[i])}`
            
            currList.push(data[i])
        }
    });
}

updatePage()