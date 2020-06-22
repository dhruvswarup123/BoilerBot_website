var currList = null


function getDeleteForm(i){
    return `
        <form action="/remove_from_queue" method="post">
            <input type="hidden" name="id" value="${i}">
            <button type="submit" class="delete_btn"> &#10060; </button>
        </form>
    `
}

// async function deleteItemFromQueue(i) {
//    console.log(currList[i])
//    fetch('/remove_from_queue', {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({id: currList[i].document._id})
//   });

//   updatePage();

// }


function updatePage(){
    fetch('/update_queue_deets')
    .then(response => response.json())
    .then(data => {
        currList = []
        let table = document.getElementById("requests_list");
        // send a note as well -TODO
        if (data.length == 0) {
            document.getElementById("ifcontent").style.display = "block"
            table.style.display = 'none'
        }
        else{
            document.getElementById("ifcontent").style.display = "none"
            table.style.display = 'inline-block'
        }

        for (i in data){
            let date = new Date(data[i].document.payload.inserted_at*1000)
            let row = table.insertRow()
            row.innerHTML = `
                <td> ${data[i].pos} </td>
                <td> ${data[i].document.payload.to.name} </td>
                <td> ${data[i].document.payload.to.email} </td>
                <td> ${data[i].document.payload.purpose} </td>
                <td> n/a </td>
                <td class="delete_cell"> ${getDeleteForm(data[i].document._id)} </td>
            `
            // <td> <button class="delete_btn" onclick="deleteItemFromQueue(${i})"> &#10060; </button> </td>
            // temp.innerHTML = `position: ${data[i].pos} ------ to: ${data[i].document.payload.to.email} ${getRemoveButton(data[i])}`
            
            currList.push(data[i])
        }
    });
}

document.addEventListener("DOMContentLoaded", function(e) {
    updatePage()
})

