console.log("server started");
const express = require('express');
const app = express();
var port = 3000;


app.listen(port, ()=>{
    console.log("server is listening at port", port);
});
app.use("/n",(req, res)=>{
    res.send("Hello from the server!");
});