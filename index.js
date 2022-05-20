const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sdso6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   console.log("Veggie Mart db connected");
//   client.close();
// })

async function run() {
    try{
        await client.connect();
        const itemCollection = client.db('veggieMart').collection('item');

        app.get('/item', async(req,res) => {
          const query = {};
          const cursor = itemCollection.find(query);
          const items = await cursor.toArray();
          res.send(items);
        });

        app.get('/item/:id',async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const item = await itemCollection.findOne(query);
            res.send(item);
        })

        app.post('/item', async(req, res) => {
            const newItem = req.body;
            const result = await itemCollection.insertOne(newItem); 
            res.send(result);
        })

        // update quantity
        app.put('/item/:id', async(req,res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedItem.quantity
                }
            };
            const result = await itemCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        //delete an item 
        app.delete('/item/:id', async(req,res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally{
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hi there! sadawewaHow are thuthrrffgg you are you okay??');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})