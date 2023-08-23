const express = require('express')



const app = express();
app.use(express.json());
app.get('/create-event', function(req,res){
    console.log("ciao")
    res.send("ciao")
})
app.listen(8080)