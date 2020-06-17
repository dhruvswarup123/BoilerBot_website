// car = {
//     x: 0,
//     y: 0,
//     v: 1,
//     elem: document.getElementById("car")
// }

// var mouseX = 0;
// var mouseY = 0;

// document.addEventListener('mousemove', e => {
//     mouseX = e.offsetX;
//     mouseY = e.offsetY;
// });

// function update(){
//     let dx = mouseX - car.x;
//     let dy = mouseY - car.y;
//     if ((Math.abs(dx) > 20) || (Math.abs(dy) > 20)){
//         let v_x = dx / Math.sqrt((Math.pow(dx, 2) + Math.pow(dy, 2)))
//         let v_y = dy / Math.sqrt((Math.pow(dx, 2) + Math.pow(dy, 2)))
//         car.x += car.v * v_x
//         car.y += car.v * v_y
//     }

//     car.elem.style.left = car.x + 'px';
//     car.elem.style.top = car.y + 'px';
// }

// // function render(){
    
// // }

// // setInterval(render, 10)
// setInterval(update, 10)