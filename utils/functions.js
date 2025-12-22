import { promises as fs } from 'fs'

export async function readFile(fileName) {
        try {
        const data = await fs.readFile(fileName, 'utf8') 
        const dataToJson = await JSON.parse(data)
            return dataToJson
    } catch (error) {
        console.error(`Error read file:`, error);
    }
}

export async function writeFile(fileName, data) {
    try {
            await fs.writeFile(fileName, JSON.stringify(data), 'utf8')
            console.log(`Data written to ${fileName}`);
        } catch (error) {
            console.error(`Error writing file:`, error);
        }
}