const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// function verifyJWT(req, res, next){
//     const authHeader = req.headers.authorization;
//     next();
//     if (!authHeader){
//         return res.status(401).send({message: 'unauthorized access'});
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if(err) {
//             console.log('error');
//             return res.status(403).send( {message: 'Forbidden access'});
//         }
//         console.log(token);
//         req.decoded = decoded;
//         console.log('decoded', decoded);
//         next();
//     })
// }

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sdso6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();
        const itemCollection = client.db('veggieMart').collection('item');

        // AUTH
        app.post('/login', async (req,res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '2d'
            });
            res.send({accessToken});
        })

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

        // Get My Items
        app.get('/myItem', async(req,res) => {
            // const decodedEmail = req.decoded.email; 
            const email = req.query.email;
            // if (email === decodedEmail) {
                const query = {email: email};
                const cursor = itemCollection.find(query);
                const items = await cursor.toArray();
                res.send(items);
            // }
            // else {
            //     res.status(403).send({message: 'forbidden access'})
            // }   
        })
    }
    finally{
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Veggie Mart Server');
});

app.get('/hero', (req, res) => {
    res.send('Hero running');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})