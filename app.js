import express from "express"
import cors from 'cors'
import dotenv from 'dotenv'
import fileUpload from 'express-fileupload'
import path from 'path'
import {generatePrepData} from './prepdata.js'

const app = express()
app.use(cors())
app.use(fileUpload({createParentPath: true}))

dotenv.config()
const port = process.env.PORT || 5000

app.get("/", (req, res) => {
    res.send("OK!");
  })

app.post('/send', async (req, res) => {
    if (!req.files){
        return res.status(400).send('No files were uploaded...')
    }
    const file = req.files.uploadedFile 
    const path = process.cwd() + '/files/' + file.toString().replace(/\s/g, '').name
    await file.mv(path, (err) => {
        if (err) {
            return res.status(500).send(err)
        } else {
            generatePrepData(path)
                .then((response) => {
                    response.signer = 'signer object'
                    console.log(response)                    
                    return res.send({status: 'success'})
                })
                .catch((e) => {
                    return res.send(e)
            })
        }    
    })
    
    
})

app.listen(port, console.log(`App running on port ${port}...`));