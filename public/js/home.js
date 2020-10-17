var currList = null


function getDeleteForm(i){
    return `
        <form action="/remove_from_queue" method="post">
            <input type="hidden" name="id" value="${i}">
            <button type="submit" class="delete_btn" title="delete request"> &#10060; </button>
        </form>
    `
}

function getUnlockForm(i){
    return `
        <form action="/unlock" method="post">
            <input type="hidden" name="id" value="${i}">
            <button type="submit" class="delete_btn" title="unlock the boilerbot"> &#128275; </button>
        </form>
    `
}

function getStartDeliveryForm(i){
    return `
        <form action="/start_delivery" method="post">
            <input type="hidden" name="id" value="${i}">
            <button type="submit" class="delete_btn" title="locked and loaded. click to start delivery"> &#9989 </button>
        </form>
    `
}

function getEndDeliveryForm(i){
    return `
        <form action="/end_delivery" method="post">
            <input type="hidden" name="id" value="${i}">
            <button type="submit" class="delete_btn" title="i got it! click to end delivery"> &#9989 </button>
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

            if (data[i].type == 'outgoing'){
                row.innerHTML = `
                <td> ${data[i].pos} </td>
                <td> ${data[i].document.payload.to.name} </td>
                <td> ${data[i].document.payload.to.email} </td>
                <td> ${data[i].document.payload.purpose} </td>
                <td> ${data[i].type} </td>
                <td class="delete_cell"> ${getDeleteForm(data[i].document._id)} </td>
                <td class="delete_cell"> ${getUnlockForm(data[i].document._id)} </td>
                <td class="delete_cell"> ${getStartDeliveryForm(data[i].document._id)} </td>
                `
            }
            else {
                row.innerHTML = `
                <td> ${data[i].pos} </td>
                <td> ${data[i].document.payload.from.name} </td>
                <td> ${data[i].document.payload.from.email} </td>
                <td> ${data[i].document.payload.purpose} </td>
                <td> ${data[i].type} </td>
                <td></td>
                <td class="delete_cell"> ${getUnlockForm(data[i].document._id)} </td>
                <td class="delete_cell"> ${getEndDeliveryForm(data[i].document._id)} </td>
                `
            }

            currList.push(data[i]);
        }
    });
}

function create_user_table(){
    let table = document.createElement("table")
    table.id = "sug_table"
    for (i in users){
        let row = document.createElement("tr")
        row.className = "sug_row"
        row.innerHTML = `<td class="sug_name">${users[i].name}</td><td class="sug_email">${users[i].email}</td>`
        table.appendChild(row)
    }
    return table
}

var users = null
document.addEventListener("DOMContentLoaded", function(e) {
    updatePage()

    fetch('/get_users')
    .then(response => response.json())
    .then(data => {
        users = data
        user_suggestions = document.getElementById("user_suggestions")
        user_suggestions.appendChild(create_user_table())

        var rows = document.getElementsByClassName("sug_row");
        console.log(rows)
        for (var i = 0; i < rows.length; i++) {
            console.log(rows[i])
            rows[i].addEventListener('click', select.bind(event, rows[i]));
        }
    })
})

function select(elem, event){
    let email = elem.childNodes[1].innerHTML
    document.getElementById("destination").value = email
}


