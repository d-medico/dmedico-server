import express from "express"
import cors from 'cors'
import dotenv from 'dotenv'
import fileUpload from 'express-fileupload'
import bodyParser from 'body-parser'
import path from 'path'
import {generatePrepData, doUpload} from './prepdata.js'
import moment from "moment"
import fs from 'fs'
import {dbcrud} from './web3db.js'






const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
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

app.post('/update', async (req, res) => {
    console.log(req.body)
    try {
        if ( req.body) {
            const crud = new dbcrud()
            //const data = JSON.parse(req.body)
            const data = req.body
            //const key = Object.keys(data)
            if ( data[0].function === 'addFile') {                
                try {                    
                    crud.addFile(
                        data[1].id, 
                        data[1].owner, 
                        data[1].filename,
                        data[1].dateTime, 
                        data[1].ipfsurl 
                        )
                        .then(() => {
                            console.log(`Record with id: ${data[1].id} created`)
                            res.send({status: 'success'})
                        })
                        .catch((e) => { 
                            console.error(e)
                            res.send({status: 'error'})
                        })
                    
                } catch (e) {
                    console.error(e)
                    res.send({status: 'error'})
                }               

            } else if ( data[0].function === 'getFilesByOwner') {
                try {
                    
                    crud.getFilesByOwner(data[1].owner)
                        .then((result) => {
                            console.log(result)
                            res.send({
                                status: 'success',
                                records: result
                            })
                            .catch((e) => {
                                console.error(e)
                                res.send({status: 'error'})            
                            })
                        })
                    
                } catch (e) {
                    console.error(e)
                    res.send({status: 'error'})
                }

            } else if ( data[0].function === 'deleteFile') {
                try {
                    crud.deleteFile(data[1].id, data[1].ipfsurl)                    
                        .then(() => {
                            res.send({status: 'success'})
                        })
                        .catch ((e) => {
                            console.error(e)
                            res.send({status: 'error'})
                        })                    
                } catch (e) {
                    console.error(e)
                    res.send({status: 'error'})
                }

            } else if ( data[0].function === 'giveAccess') {
                try {                    
                    crud.giveAccess(
                        data[1].id, 
                        data[1].owner, 
                        data[1].filename,                         
                        data[1].ipfsurl,
                        data[1].username,
                        data[1].userwallet
                        )
                        .then(() => { 
                            console.log(`Record with ${data[1].id} created`)
                            res.send({status: 'success'})
                        })
                        .catch((e) => { 
                            console.error(e)
                            res.send({status: 'error'})
                        })
                } catch (e) {
                    console.error(e)
                    res.send({status: 'error'})
                }           
                
            } else if ( data[0].function === 'getSharedFiles') {
                try {
                    crud.getSharedFiles(data[1].userwallet)
                        .then((result) => {
                            console.log(result)
                            res.send({
                                status: 'success',
                                records: result
                            })
                        })
                        .catch ((e) => {
                            console.error(e)
                            res.send({status: 'error'})        
                        })
                    
                } catch (e) {
                    console.error(e)
                    res.send({status: 'error'})
                }
            } else if ( data[0].function === 'revokeAccess') {
                try {
                    crud.revokeAccess(data[1].id)
                        .then(() => {
                            console.log(`Deleted record ${data[1].id}...`)
                            res.send({status: 'success'})
                        })
                        .catch ((e) => {
                            console.error(e)
                            res.send({status: 'error'})
                        })                   
                    
                } catch (e) {
                    console.error(e)
                    res.send({status: 'error'})
                }
            } else {
                throw new Error('Unrecognized command...')
            }
        } else {
            throw new Error('Incorrect post data...')
        }
        
    } catch (e) {
        console.error (`Something went wrong ${e.name} ${e.message}`)
        res.send({status: 'error'})
    }
    
})

app.listen(port, console.log(`App running on port ${port}...`));