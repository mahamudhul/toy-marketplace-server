const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());



/* ---------    MONGODB     --------------*/
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ojw1kya.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const toyCollection = client.db("toyMarket").collection("toys")

        // indexing
        const indexKeys = {name: 1, sellerName: 1};
        const indexOptions ={ name: "nameSellerName"};
        const result = await toyCollection.createIndex(indexKeys, indexOptions)
        console.log(result)

        app.get("/toysSearch/:text", async(req, res) => {
            const searchText = req.params.text;
            const result= await toyCollection.find({
                $or: [
                    { name: { $regex: searchText, $options: "i"}},
                    { sellerName: { $regex: searchText, $options: "i"}},
                ],
            })
            .toArray();

            res.send(result);
        })


        app.post("/addtoys", async (req, res) => {
            const data = req.body;
            data.createdAt = new Date();
            // console.log(data)
            const result = await toyCollection.insertOne(data)
            res.send(result)
        })

        let PAGESIZING = 20;
        app.get("/alltoys", async (req, res) => {
            const result = await toyCollection
            .find({})
            .sort({ createdAt: -1})
            .limit(PAGESIZING )
            .toArray();
            res.send(result)
        })

        // by category
        let PAGESIZING2 = 2;
        app.get("/category/:text", async (req, res) => {
            console.log(req.params.text)
            const result = await toyCollection
            .find({category: req.params.text})
            .limit(PAGESIZING2 )
            .toArray();
            console.log(result)
            res.send(result)
            // const result = await toyCollection.find({}).toArray();
            // res.send(result)
        })

        app.get("/myToys/:email", async(req, res) => {
            // console.log(req.params.sellerEmail)
            const toys = await toyCollection
            .find({postedBy: req.params.sellerEmail})
            .toArray();
            res.send(toys);
        })

        app.get("/alltoys/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const data = await toyCollection.findOne(filter)
            res.send(data)
        })



        app.patch("/toy/:id", async (req, res) => {
            const id = req.params.id
            const updateToyData = req.body
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    ...updateToyData
                }
            }
            const result = await toyCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        app.delete("/toy/:id", async (req, res) =>{
            const id = req.params.id
            console.log(id)
            const filter = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(filter)
            res.send(result)
        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('jhon is busy shopping')
})

app.listen(port, () => {
    console.log(`ema jhon server is running on port: ${port}`)
})
