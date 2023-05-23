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
            const records = await collection.where("userwallet", "==", userwallet).get()
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
    /*
    getAccessRecord = async(id, ipfsurl) => {
        try {
            const records1 = await this.db.collection("access").where("ipfsurl", "==", ipfsurl).get()
            const records2 = await this.db.collection("access").where("id", "==", id).get()
            const records = []
            for ( let i = 0; i < records1.length; i++){
                for ( let j = 0; j < records2.length; j++){
                    if ( records1[i] === records2[j]){
                        records.push(records1[i])
                    }
                }
            }        
            return records
        } catch (e) { console.error(e)}
        
    }*/

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


