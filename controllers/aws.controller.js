const s3 = require('../config/s3.config.js');
const env = require('../config/s3.env.js');
 
const s3Client = s3.s3Client;

exports.doUpload = (req, res) => {
  const params = s3.uploadParams;
  
  params.Key = req.file.originalname;
  params.Body = req.file.buffer;
    
  s3Client.upload(params, (err, data) => {
    if (err) {
      res.status(500).json({error:"Error -> " + err});
    }

    res.redirect('/');
  });
}

exports.download = (async (req, res) => {
    const params = s3.downloadParams;
    let images = await s3Client.listObjectsV2({
        Bucket: params.Bucket
    }).promise();

    // console.log(images)

    images = images.Contents;
    images.sort(function(a, b) {
        var keyA = new Date(a.LastModified),
          keyB = new Date(b.LastModified);
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      });

    const keys = getKeys(images);

    // console.log(keys);

    const urls = getUrls(keys);

    console.log("The urls of the images:\n", urls);

    // const table = createTable(tags);

    // console.log(table);

    res.render('index', {table: urls});
})

function getKeys(images){
    keys = [];
    for (let i = 0 ; i < images.length ; i++){
        keys.push(images[i].Key);
    }

    return keys;
}

function getUrls(keys){
    urls = [];
    const signedUrlExpirationSeconds = 60 * 5;
    for (let i = 0 ; i < keys.length ; i++){
        const url = s3Client.getSignedUrl('getObject', {
            Bucket: env.Bucket,
            Key: keys[i],
            Expires: signedUrlExpirationSeconds
        });

        urls.push(url);
    }

    return urls;
}

// function extractRowData(rowNum, imgTags){
//     const i = rowNum * 4;
//     const rowData = imgTags.slice(i, i + 4);

//     return rowData;
// }

// function createTableRow(rowData){
//     let tableRow = "<tr>";
//     for (let i = 0 ; i < rowData.length ; i++){
//         tableRow += rowData[i];
//     }
//     tableRow += "</tr>";

//     return tableRow;
// }

// function createTable(imgTags){
//     const numOfRows = Math.ceil(imgTags.length / 4);
//     let table = "<table>";
//     for (let i = 0 ; i < numOfRows ; i++){
//         let rowData = extractRowData(i, imgTags);
//         // console.log(rowData);
//         // console.log(createTableRow(rowData));
//         table += createTableRow(rowData);
//     }

//     table += "</table>";
//     return table;
// }


