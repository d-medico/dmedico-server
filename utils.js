import { ethers } from "ethers"
import contract from './contracts/DealClient.json' assert {type: 'json'}
import CID from 'cids'


export const doDeal = async (obj) => {
    try {
        const contractAddress = contract.address
        const contractABI = contract.abi
        console.log(JSON.parse(obj.signer))
        const dealClient = new ethers.Contract(
            contractAddress,
            contractABI,
            JSON.parse(obj.signer)
        )
        //const cid = new CID(obj.pieceCid)
        const extraParamsV1 = [
            obj.carlink,
            obj.size,
            false, // taskArgs.skipIpniAnnounce,
            false, // taskArgs.removeUnsealedCopy
        ]
        const DealRequestStruct = [
            obj.pieceCid, //cidHex
            //cid.bytes, //cidHex
            obj.pieceSize, //taskArgs.pieceSize,
            false, //taskArgs.verifiedDeal,
            obj.dataCid, //taskArgs.label,
            520000, // startEpoch
            1555200, // endEpoch
            0, // taskArgs.storagePricePerEpoch,
            0, // taskArgs.providerCollateral,
            0, // taskArgs.clientCollateral,
            1, //taskArgs.extraParamsVersion,
            extraParamsV1,
        ]
        console.log(dealClient.interface);
        const transaction = await dealClient.makeDealProposal(DealRequestStruct)
        console.log("Proposing deal...")
        const receipt = await transaction.wait()
        console.log(receipt)
        dealClient.on("DealProposalCreate", (id, size, verified, price) => {
            console.log(id, size, verified, price);
          })  
        console.log("Deal proposed! CID: " + obj.dataCid)
        return

    } catch (e) {
        console.error("Something went wrong. " + e.name + " " + e.message)        
    }
    
}
