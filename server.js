const express = require('express')
const app = express()
const port = 8383
const {db} = require('./firebase.js')
const { FieldValue } = require('firebase-admin/firestore')
const bodyParser = require('body-parser')
const multer = require('multer')
const uploadImage = require('./helpers/helpers.js')

app.use(express.json())

// Get all users with id
app.get("/", async (req, res) => {
    const snapshot = await db.collection('users').get()
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data()}))
    res.send(list);
})

// Add a new user with a generated id.
app.post('/adduser', async (req, res) => {
    const data = req.body;
    await db.collection('users').add(data);
    res.send({ msg: "User Added "})
  });

  // Update user with id
app.post('/update', async (req, res) => {
    const id = req.body.id;
    delete req.body.id;
    const data = req.body;
    await db.collection('users').doc(id).update(data);
    res.send({ msg: "Updated"});
})

// Delete user with id
app.delete('/delete', async (req, res) => {
    const id = req.body.id;
    await db.collection('users').doc(id).delete();
    res.send({ msg: "Deleted"});
})


//======================================================================

// upload images
const multerMid = multer({
    storage: multer.memoryStorage(),
    limits: {
        // no longer than 5mb
        fileSize: 5 * 1024 * 1024,
    },
})

app.disable('x-powered-by')
app.use(multerMid.single('file'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.post('/uploads', async (req, res, next) => {
    try {
        const myFile = req.file //mengupload gambar
        const imageUrl = await uploadImage(myFile) //memanggil fungsi upload image di helper.js

        const currentDate = new Date(); //menentukan data tanggal

        const latitude = req.body.latitude; // Mendapatkan nilai latitude dari permintaan POST
        const longitude = req.body.longitude; // Mendapatkan nilai longitude dari permintaan POST

        const data = {
            imageUrl: imageUrl,
            geolocation: {
                latitude: latitude,
                longitude: longitude
            },
            date: currentDate,
        };

        // Mengirim data ke firebase
        await db.collection('potholes').add(data);

        res
          .status(200)
          .json({
            message: "Upload was successful",
            data: imageUrl
          })
      } catch (error) {
        next(error)
      }
    })
    
    app.use((err, req, res, next) => {
      res.status(500).json({
        error: err,
        message: 'Internal server error!',
      })
      next()
    });


//======================================================================







app.get('/friends', async (req, res) => {
    const peopleRef = db.collection('people').doc('associates')
    const doc = await peopleRef.get()
    if (!doc.exists) {
        return res.sendStatus(400)
    }

    res.status(200).send(doc.data())
})

app.get('/friends/:name', async (req, res) => {
    const { name } = req.params
    const peopleRef = db.collection('people').doc('associates')
    const doc = await peopleRef.get()
    if (!name || !(name in doc.data())) {
        return res.sendStatus(404)
    }
    res.status(200).send({ [name]: doc.data() })
})

app.post('/addfriend', async (req, res) => { //addfriend
    const { name, status } = req.body
    const peopleRef = db.collection('people').doc('associates')
    const res2 = await peopleRef.set({
        [name]: status
    }, { merge: true })
    const doc = await peopleRef.get()
    if (!doc.exists) {
        return res.sendStatus(400)
    }
    // friends[name] = status
    res.status(200).send(doc.data())
})

app.patch('/changestatus', async (req, res) => { //changeStatus
    const { name, newStatus } = req.body
    const peopleRef = db.collection('people').doc('associates')
    const res2 = await peopleRef.set({
        [name]: newStatus
    }, { merge: true })
    const doc = await peopleRef.get()
    if (!doc.exists) {
        return res.sendStatus(400)
    }

    // friends[name] = newStatus
    res.status(200).send(doc.data())
})

app.delete('/friends', async (req, res) => {
    const { name } = req.body
    const peopleRef = db.collection('people').doc('associates')
    const res2 = await peopleRef.set({
        [name]: FieldValue.delete()
    }, { merge: true })
    const doc = await peopleRef.get()
    if (!doc.exists) {
        return res.sendStatus(400)
    }
    // delete friends[name]
    res.status(200).send(doc.data())
})







app.listen(port, () => console.log(`Server has started on port: ${port}`))