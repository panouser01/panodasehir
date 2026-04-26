import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const dir = path.resolve('../DbCSV')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  // Accessing models from prisma. $models or standard props
  const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$') && typeof prisma[k] === 'object' && 'findMany' in prisma[k])
  
  for (const model of models) {
    console.log(`Exporting ${model}...`)
    try {
      const records = await prisma[model].findMany()
      if (records.length === 0) {
        fs.writeFileSync(path.join(dir, `${model}.csv`), '')
        continue
      }
      
      const headers = Object.keys(records[0])
      let csvContent = headers.map(h => `"${h}"`).join(',') + '\n'
      
      for (const record of records) {
        const row = headers.map(h => {
          let val = record[h]
          if (val === null || val === undefined) return '""'
          if (val instanceof Date) return `"${val.toISOString()}"`
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`
          return `"${String(val).replace(/"/g, '""')}"`
        })
        csvContent += row.join(',') + '\n'
      }
      
      fs.writeFileSync(path.join(dir, `${model}.csv`), csvContent)
    } catch(err) {
      console.log(`Failed to export ${model}: ${err.message}`)
    }
  }
}

main().then(() => {
  console.log('Successfully exported all tables')
  prisma.$disconnect()
})
