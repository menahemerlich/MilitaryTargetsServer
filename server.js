import express from 'express'
import { nanoid } from 'nanoid'
import { readFile, writeFile } from './utils/functions.js'
import { requestInfo } from './middlewaer/requestInfo.js'
import { addForResponse } from './middlewaer/addForResponse.js'

const fileName = 'data/targets.json'
const app = express()
app.use(express.json())
// app.use(requestInfo)

app.get('/health', (req, res) => {
    res.status(200).json({"status":"ok", "serverTime": new Date().toISOString()})
})

app.get('/briefing', (req, res) => {
    
    if (req.headers['client-unit'] && req.headers['client-unit'] === "Golani"){
        res.status(200).json({"Unit":"Golani", "message":"briefing delivered"})
    }else{
        res.status(400).json({"message":"error!"})
    }
})

app.get('/targets/:id', async (req, res) => {
    const {id} = req.params
    const data = await readFile(fileName)
    for (const target of data) {
        if (target.id == id){
            return res.status(200).send(target)
        }
    }
    return res.status(404).send(`id num: ${id} is not found`)
})

app.get('/targets', async (req, res) => {
    let targets = await readFile(fileName)    
    const region = req.query.region
    const status = req.query.status
    const minPriority = req.query.minPriority
    for (const target of targets){
        if (region){
            targets = targets.filter((obj) => {
                if (obj.region === region){ return true }
            })
        }
        if (status){
            targets = targets.filter((obj) => {
                if (obj.status === status){return true}
            })
        }
        if (minPriority){
            targets = targets.filter((obj) => {
                if (obj.priority >= parseInt(minPriority)){return true}
            })
        }
    }
    res.send(targets)
})

app.post('/targets', async (req, res) => {
    let targets = await readFile(fileName)    
    const newTarget = {}
    if (req.headers['content-type'] === 'application/json' && req.body['codeName'] && req.body['region'] && req.body['priority'] && req.body['status']){
        newTarget.id = nanoid(4)
        newTarget.codeName = req.body['codeName']
        newTarget.region = req.body['region']
        newTarget.priority = req.body['priority']
        newTarget.status = req.body['status']
        newTarget.createdAt = new Date().toISOString()
        targets.push(newTarget)
        try {
        await writeFile(fileName, targets)
            res.status(200).send(`File '${fileName}' written successfully.`)
        } catch (error) {
            res.status(500).send('Error saving the file.')
        }
    }else{res.status(400).send('One of the data is incorrect.')}
    
})

app.put('/targets/:id', async (req, res) => {
    let targets = await readFile(fileName)
    const {id} = req.params
    for (const target of targets) {
        if (target.id == id){
            console.log(req.body.cdf);
            const codeName = req.body.codeName
            const region = req.body.region
            const priority = req.body.priority
            const status = req.body.status
            if (codeName){
                target.codeName = codeName
            }   
            if (region){
                target.region = region
            }
            if (priority){
                target.priority = priority
            }
            if (status){
                target.status = status
            }         
            await writeFile(fileName, targets)
            return res.status(200).send(`target num: ${id} updated successfully`)
        } 
    }
    res.status(404).send(`target num: ${id} is not found`)
})

app.delete('/targets/:id', async (req, res) => {
    let targets = await readFile(fileName)
    const originalDataLength = targets.length 
    const {id} = req.params
    targets = targets.filter((target) => {
        if (!(target.id === id)){
            return true
        }
    })
    const newDataLength = targets.length
    if (originalDataLength != newDataLength){
        await writeFile(fileName, targets)
        return res.status(200).send(`target num: ${id} deleted successfully`)
    }else{
        res.status(404).send(`target num: ${id} is not found`)
    }
})

app.listen(3030, () => {
    console.log(`server run....`);
})