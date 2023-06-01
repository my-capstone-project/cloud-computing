const express = require('express') // import express framework
const app = express() // create instances from express as 'app'
const port = 8383 // used port
const { db } = require('./firebase.js') // import db var. database from firestore

const uploadImage = require('../helpers/helpers.js') // import function uploadImage
const admin = require('firebase-admin') // interact with firebase auth
// const { getAuth } = require('firebase-admin/auth')

// middlewares
const bodyParser = require('body-parser') // menguraikan data dari HTTP req dalam format JSON/urlencoded
const multer = require('multer') // menghandle form-data input
app.use(express.json()) // menghandle req.body
app.use(express.urlencoded({extended: true})); // menguraikan dan akses URL-encoded data

app.get('/', (req, res) => res.send('Hello World!'));

// User Auth Sign-up
app.post('/signup', async (req, res) => {
    const user = {
        email: req.body.email, // get email and pass from raw body json
        password: req.body.password,
    }
    // membuat user'
    const userResponse = await admin.auth().createUser({
        email: user.email,
        password: user.password,
        emailVerified: false,
        disabled: false
    })
    res.json(userResponse); // mengambalikan isi dari var userResponse jika berhasil
})

// User Auth Login
// app.get('/login', async (req, res) => {
//     const auth = getAuth
// })

// Get all users with id
app.get("/getusers", async (req, res) => {
    const snapshot = await db.collection('users').get() // get 'users' collection from db as a 'snapshot'
    // setiap dokumen pada snapshot.docs(list-data) diubah menjadi objek baru yang memiliki id doc
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) 
    res.send(list); // mengembalikan var list
})

// Add a new user with a generated id.
app.post('/adduser', async (req, res) => {
    const data = req.body; // Mendapatkan data pengguna baru dari objek req.body
    await db.collection('users').add(data); // Menambahkan data pengguna baru ke koleksi 'users'
    res.send({ msg: "User Added " }); // Mengirimkan respons dengan pesan "User Added" sebagai konfirmasi
});

// Update user with id
app.post('/update', async (req, res) => {
    const id = req.body.id; // Mendapatkan nilai ID dari properti 'id' dalam objek req.body
    delete req.body.id; // Menghapus properti 'id' dari objek req.body
    const data = req.body; // Mendapatkan data yang akan diperbarui dari objek req.body
    await db.collection('users').doc(id).update(data); // Update dokumen dengan ID yang ditentukan dalam 'users'
    res.send({ msg: "Updated" }); // Mengirimkan respons dengan pesan "Updated"
})

// Delete user with id
app.delete('/delete', async (req, res) => {
    const id = req.body.id; // Mendapatkan nilai ID dari properti 'id' dalam objek req.body
    await db.collection('users').doc(id).delete(); // Menghapus dokumen dengan ID yang ditentukan dari koleksi 'users'
    res.send({ msg: "Deleted" }); // Mengirimkan respons dengan pesan "Deleted"
})



//======================================================================

// Konfigurasi middleware untuk meng-handle upload file menggunakan Multer
const multerMid = multer({
    storage: multer.memoryStorage(),
    limits: {
        // File tidak boleh lebih dari 5MB
        fileSize: 5 * 1024 * 1024,
    },
})

app.disable('x-powered-by') // Menonaktifkan header 'x-powered-by' pada respons
app.use(multerMid.single('file')) // Untuk meng-handle form-data dengan nama 'file'
app.use(bodyParser.json()) // meng-handle request body dengan format JSON
app.use(bodyParser.urlencoded({ extended: false })) // Meng-handle request body dengan format URL-encoded


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
        await db.collection('potholes').add(data); // jika data sudah terisi, add data ke collection potholes

    res
        .status(200) // Set status kode respon 200 sebagai tanda berhasil
        .json({ // Mengirim respons dalam format JSON
            message: "Upload was successful", // Pesan konfirmasi bahwa upload berhasil
            data: imageUrl // URL gambar yang di-upload
        })
    } catch (error) {
        next(error) // Menangkap kesalahan dan meneruskannya ke middleware error handling selanjutnya
    }
})

app.use((err, req, res, next) => { // Middleware penanganan kesalahan atau error
    res.status(500).json({ // Mengatur status kode respon menjadi 500, yang menandakan kesalahan server internal
        error: err, // Menyertakan informasi tentang kesalahan dalam respons
        message: 'Internal server error!', // Pesan kesalahan yang ditampilkan dalam respons
    })
    next() // Meneruskan kendali ke middleware berikutnya
});


//======================================================================

app.listen(port, () => console.log(`Server has started on port: ${port}`)) //menjalankan server pada port tertentu



