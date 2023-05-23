import express from "express"
import cors from 'cors'
import dotenv from 'dotenv'
import fileUpload from 'express-fileupload'
import path from 'path'
import {generatePrepData, doUpload} from './prepdata.js'
import moment from "moment"
import fs from 'fs'

const app = express()
app.use(cors())
app.use(fileUpload({createParentPath: true}))

dotenv.config()
const currentDate = new moment()
const port = process.env.PORT || 5000

app.get("/", (req, res) => {
    res.send("OK!");
  })

app.post('/send', async (req, res) => {
    if (!req.files){
        return res.status(400).send('No files were uploaded...')
    }
    const file = req.files.uploadedFile 
    const path = process.cwd() + '/files/' + String(file.name).replace(/\s/g, '')
    console.log(path)
    const obj = req.body.signer
    console.log(obj)
    await file.mv(path, (err) => {
        if (err) {
            return res.status(500).send(err)
        } else {
            generatePrepData(path)
                .then(async (response) => {
                    response.signer = obj
                    console.log(response)   
                    //await doDeal(response)
                    //fs.unlinkSync(path)                                 
                    return res.send({
                        status: 'success',
                        datetime: moment(),
                        permissions: "",
                        link: response.carlink,
                        response
                    })
                })
                .catch((e) => {
                    return res.send(e)
            })
        }    
    })
})


app.get('/upload', async (req, res) => {
    if (!req.query.filename){
        return res.status(400).send('No files were sent...')
    }    
    const toUpload = req.query.filename
    if (toUpload) {
        const path = './files/' + toUpload.replace(/\s/g, '')
        console.log(path)
        if (fs.existsSync(path) && fs.statSync(path).isFile()) {
            try {
                const ipfsUrl = await doUpload(path)
                if(ipfsUrl) {
                    console.log(`IPFS URL : ${ipfsUrl}`)
                    res.send({
                        status: 'uploaded',
                        url: ipfsUrl
                    })
                }
            } catch (e) {
                console.error("Something went wrong " + e.name + " " + e.message)
            }                        
        } else res.send({status: 'failure'})
    } else {
        console.error('File was not found...')
        res.send({status: 'failure'})
    }
})



app.listen(port, console.log(`App running on port ${port}...`));