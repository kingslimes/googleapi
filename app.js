const
    fs = require('fs'),
    axios = require('axios'),
    path = require('path'),
    short = require('shortid'),
    express = require('express'),
    { google } = require('googleapis'),
    GOOGLE_API_FOLDER_ID = '1-sQEbClcbj6xmywa5XygM3wWfGCWWF69';

const app = express();
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');
app.use( express.urlencoded({
    extended: false,
    limit: '50mb'
}) );
app.use( express.json({limit: '50mb'}) );
app.get('/', (req,res) => {
    res.render('index')
})
app.post('/api/v1/file', async (req,res) => {

    const pathName = './stream/' + short.generate() + '.stream';
    fs.writeFileSync(pathName, req.body.image, {
        encoding: 'base64url'
    });
    
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: './google.json',
            scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/cloud-platform']
        })
        const driveService = google.drive({
            version: 'v3',
            auth
        })
        const fileMetaData = {
            'name': new Date().getTime(),
            'parents': [GOOGLE_API_FOLDER_ID]
        }
        const media = {
            mimeType: 'image/avchd',
            body: fs.createReadStream(pathName)
        }
        const response = await driveService.files.create({
            resource: fileMetaData,
            media: media,
            field: 'id'
        })
        res.json({
            status: 200,
            id: response.data.id
        })
    } catch(err) {
        res.status(403).json({
            message: err
        })
    }
    fs.unlinkSync(pathName);
})

app.listen(5000)
