const https = require('https')
const fs = require('fs')
const path = require('path')

const fonts = [
  {
    url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
    filename: 'Inter-Regular.woff2'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2',
    filename: 'Inter-Medium.woff2'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2',
    filename: 'Inter-SemiBold.woff2'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2',
    filename: 'Inter-Bold.woff2'
  }
]

const fontsDir = path.join(__dirname, 'public', 'fonts')
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true })
}

fonts.forEach(font => {
  const filePath = path.join(fontsDir, font.filename)
  if (!fs.existsSync(filePath)) {
    const file = fs.createWriteStream(filePath)
    https.get(font.url, response => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log(`Downloaded: ${font.filename}`)
      })
    }).on('error', err => {
      fs.unlink(filePath, () => {})
      console.error(`Failed: ${font.filename}`, err.message)
    })
  }
})
