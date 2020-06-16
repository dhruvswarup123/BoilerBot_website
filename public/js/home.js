var currList = null

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
            temp.innerHTML = `position: ${data[i].pos} ------ to: ${data[i].document.payload.to.email} <button onclick="remove_from_queue(${i})">remove element?</button>`
            arr.appendChild(temp)
            currList.push(data[i])
        }

        rq = document.getElementById("requests")
        rq.removeChild(rq.firstChild);
        rq.appendChild(arr)

    });
    // setTimeout(updatePage, 1000)
}

function remove_from_queue(i){
    console.log(`removing item number ${currList[i].pos}`)
    fetch("/remove_from_queue", {
        method:"post", 
        'Content-Type': 'application/json',
        body:  JSON.stringify({a:currList[i].document})
    })
}

updatePage()