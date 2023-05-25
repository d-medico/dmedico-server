import { Polybase } from '@polybase/client'

export class dbcrud {
    db = new Polybase({defaultNamespace: "pk/0xb58882a6e20f235ea9eb1cd44368b464cd977780252fc5b9d69992285a253585afa51cd670ba099400e50daa2515ada61344aa84d34be0eed13f6941bf410c07/dmedico"})

    constructor () {}

    addFile = async (id, owner, filename, dateTime, ipfsurl ) => {
        try {
            //const db = new Polybase({defaultNamespace: "dmedico"})
            const result = await this.db.collection('files').create([id, owner, filename, dateTime, ipfsurl])
            return result
        } catch (e) {console.error(e)}
        
    }

    getFilesByOwner = async (owner) => {
        try {
            const collection = this.db.collection("files")
            const records = await collection.where("owner", "==", owner).get()
            // Array of records is available under the data property
            const { data } = records
            const dataLen = data.length
            const recordsArray = []
            for ( let i=0; i< dataLen; i++){
                recordsArray.push(data[i].data)
            }
            return recordsArray
        } catch (e) { console.error(e)}
        
    }

    getFilesSharedByipfsurl = async (id, ipfsurl) => {
        try {
            const collection = this.db.collection("files")
            const records = await collection.where("id", "==", id).get()
            // Array of records is available under the data property
            const { data } = records
            const dataLen = data.length
            const recordsArray = []
            for ( let i=0; i< dataLen; i++){
                recordsArray.push(data[i].data)
            }
            return recordsArray
        } catch (e) { console.error(e)}
        
    }


    deleteFile = async(id, ipfsurl) => {
        try {
            this.db.collection("files").record(id).call("del")        
                .then(async() => {
                    console.log(`Record with ${id} deleted...`)
                    await this.deleteAccessRecord(ipfsurl)
                    console.log(`Record with ${ipfsurl} deleted...`)
                })
                .catch( (e) => console.error(e))
        } catch (e) { console.error(e)}
    }

    giveAccess = async(id, owner, filename, ipfsurl, username, userwallet) => {
        try {
            const result = await this.db.collection('access').create([id, owner, filename, ipfsurl, username, userwallet])
            //console.log(result)
        } catch (e) { console.error(e)}
        
    }

    getSharedFiles = async(userwallet) => {
        try {
            const collection = this.db.collection("access")
            const records = await collection.where("owner", "==", userwallet).get()
            // Array of records is available under the data property
            const { data } = records
            const dataLen = data.length
            const recordsArray = []
            for ( let i=0; i< dataLen; i++){
                recordsArray.push(data[i].data)
            }
            return recordsArray                        
        } catch (e) { console.error(e)}
        
    }
    
    getAccessRecord = async(owner, ipfsurl) => {
        try {
            const records1 = await this.db.collection("access").where("ipfsurl", "==", ipfsurl).get()
            const { data } = records1
            let records1Array = []
            if (data ) {
                const dataLen = data.length                
                for ( let i=0; i< dataLen; i++){
                    records1Array.push(data[i].data)
                }
                //console.log(records1Array)
            }
            
            const records2 = await this.db.collection("access").where("owner", "==", owner).get()
            const { data1 } = records2
            let records2Array = []
            if ( data1) {
                const data1Len = data1.length                
                for ( let j=0; j< data1Len; j++){
                    records2Array.push(data[j].data)
                }
                //console.log(records2Array)
            }
            
            const records = []
            if ( records1Array.length !== 0 && records2Array.length !== 0){
                for ( let x = 0; i < records1Array.length; i++){
                    for ( let y = 0; j < records2Array.length; j++){
                        if ( records1Array[i].id === records2Array[j].id){
                            records.push(records1Array[i])
                        }
                    }
                }        
                return records
            } else if ( records2Array.length === 0 && records1Array !== 0 ){
                return records1Array
            } else if ( records1Array.length === 0 && records2Array !== 0) 
                return records2Array
            
            
        } catch (e) { console.error(e)}
        
    }

    revokeAccess = async(id) => {
        try {
            await this.db.collection("access").record(id).call("del")
        } catch (e) { console.error(e)}
        
    }


    deleteAccessRecord = async(ipfsurl) => {
        try {
            await this.db.collection("access").record(ipfsurl).call("del")            
        } catch (e) { console.error(e)}
        
    }
    
}


