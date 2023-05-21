import shell from 'shelljs'
import fs from 'fs'
import {SpheronClient, ProtocolEnum} from '@spheron/storage'
import dotenv from 'dotenv'
import path from 'path'
import CID from 'cids'
import {ethers} from 'ethers'

dotenv.config()
const token = process.env.SPHERON_TOKEN
const client = new SpheronClient({ token });

export const doUpload = async (filePath) => {
    let currentlyUploaded = 0 
    const { uploadId, bucketId, protocolLink, dynamicLinks } = await client.upload(
    filePath,
    {
        protocol: ProtocolEnum.IPFS,
        name: 'fvm_bucket',
        onUploadInitiated: (uploadId) => {
            console.log(`Upload with id ${uploadId} started...`);
        },
        onChunkUploaded: (uploadedSize, totalSize) => {
            currentlyUploaded += uploadedSize;
            console.log(`Uploaded ${currentlyUploaded} of ${totalSize} Bytes.`);
        },
    }
)
return protocolLink
}

export const generatePrepData = async(filename) => {
    
    const cmd = `generate-car/generate-car --single -i ${filename} -o out -p ${path.dirname(filename)}/`
    try {
        if (filename){            
            if (fs.statSync(filename).isFile()) {
                fs.mkdirSync('out')            
                if (fs.existsSync('out')){
                    const dataObj = {}
                    const result = shell.exec(cmd).stdout
                    const data = JSON.parse(result)
                    dataObj.pieceSize = data.PieceSize
                    dataObj.size = data.Ipld.Link[0].Size
                    //const cid = new CID(data.PieceCid)
                    //const cid = ethers.hexlify(data.PieceCid)                    
                    //console.log('Hexify:', cid)
                    dataObj.pieceCid = '0x0'+data.PieceCid
                    dataObj.dataCid = data.DataCid
                    const carFile = fs.readdirSync('out')                        
                        if (fs.statSync('out/'+carFile[0]).isFile()) {                                                     
                            const link = await doUpload('out/'+carFile[0])
                            if (link) {
                                dataObj.carlink = link
                            } else {
                                console.log('Error: Something went wrong')
                            }     
                            fs.unlinkSync('out/'+carFile[0])
                            fs.rmdirSync('out')                      
                            console.log(dataObj)   
                            return dataObj
                        }
                        else {
                            console.log('Car file was not generated')
                        }
                    }
                
                else {
                    console.log('Internal error')
                }            
            } 
            else {
                console.error('Provide a valid file')
            }

        }
                
    } catch (e) {
        console.error(e)
    }
}

//generatePrepData('istockphoto.jpg')