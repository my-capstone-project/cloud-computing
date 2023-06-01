// helper functions for image upload to cloud storage
// link to storage bucket

const util = require('util') // memeberikan akses ke cloud storage
const gc = require('../config/') //import dari storage
const bucket = gc.bucket('potholeimages') // should be your bucket name

const { format } = util // format menghasilkan url public  untuk file yang di upload
/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

const uploadImage = (file) => new Promise((resolve, reject) => { // membuat fungsi upload image yang menerima objek file
    const { originalname, buffer } = file // syarat properti file harus memiliki nama dan buffer/data

    // represent file inside the bucket menggunakan blob// mengganti spasi pada nama file menjadi '_'
    const blob = bucket.file(originalname.replace(/ /g, "_")) 
    const blobStream = blob.createWriteStream({ // menulis data file ke objek 'blob'
        resumable: false // tidak ada penundaan saat mengunggah file.
    })
    // ketika blobStream selesai,
    blobStream.on('finish', () => { 
        const publicUrl = format( // buat var url gambar menggunakan /bucket/name
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    )
        resolve(publicUrl) //mengembalikan url image
    })
    .on('error', () => {
        reject(`Unable to upload image, something went wrong`)
    })
    .end(buffer) // mengakhiri penulisan blobstream dgn buffer

    // module.exports = { publicUrl }
})

module.exports = uploadImage // eskpor fungsi

