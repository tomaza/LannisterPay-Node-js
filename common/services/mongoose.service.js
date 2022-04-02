const mongoose = require("mongoose");
let count = 0;
const options = {
    autoIndex:false,
    //poolSize:10,
    //bufferMaxEntries:0,
    useNewUrlParser:true,
    useUnifiedTopology:true
};
const connectWithRetry = ()=>{
    console.log("About to connect to Mongo Db. If it fails, don't worry it will try one more time");
    mongoose.connect("mongodb://localhost/LannisterPayDB", options).then(()=>{
        console.log("Connected to mongo db successfully");
    }).catch(error=>{
        console.log(error);
        console.error("Unabled to connect to mongo db. retrying after some time:", ++count);
        setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

exports.mongoose = mongoose;