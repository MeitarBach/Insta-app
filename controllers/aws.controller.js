const s3 = require('../config/s3.config.js');
const env = require('../config/s3.env.js');
 
const s3Client = s3.s3Client;

exports.upload = (req, res) => {
  const params = s3.uploadParams;
  
  params.Key = req.file.originalname;
  params.Body = req.file.buffer;
    
  s3Client.upload(params, (err, data) => {
    if (err) {
      res.status(500).json({error:"Error -> " + err});
    }

    balanceClasses();

    res.redirect('/');
  });
}

exports.download = (async (req, res) => {
    const params = s3.downloadParams;
    let images = await s3Client.listObjectsV2({
        Bucket: params.Bucket
    }).promise();

    images = images.Contents;

    standardImages = []
    iaImages = []
    for (let i = 0 ; i < images.length ; i++){
      if (images[i].StorageClass === 'STANDARD'){
        standardImages.push(images[i]);
      }
      else{
        iaImages.push(images[i]);
      }
    }

    standardImages.sort(function(a, b) {
        var keyA = new Date(a.LastModified),
          keyB = new Date(b.LastModified);
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });

    iaImages.sort(function(a, b) {
      var keyA = new Date(a.LastModified),
        keyB = new Date(b.LastModified);
      // Compare the 2 dates
      if (keyA < keyB) return 1;
      if (keyA > keyB) return -1;
      return 0;
    });

    const keys = getKeys(standardImages).concat(getKeys(iaImages));

    // console.log(keys);

    const urls = getUrls(keys);

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

async function balanceClasses(){
  const params = s3.downloadParams;
  let images = await s3Client.listObjectsV2({
      Bucket: params.Bucket
  }).promise();

  images = images.Contents;

  let wantedIaAmount = images.length * 0.8;
  let currentIaAmount = countIaClassImages(images);
  let moveClassAmount = Math.floor(wantedIaAmount - currentIaAmount);

  console.log(`The number of images to move: ${moveClassAmount}`);
  moveImagesToIaClass(images, moveClassAmount);
}

function countIaClassImages(images){
  let iaClassImages = 0;
  for (let i = 0 ; i < images.length ; i++){
    if (images[i].StorageClass === 'STANDARD_IA'){
      iaClassImages++;
    }
  }

  return iaClassImages;
}

function moveImagesToIaClass(images, numOfImagesToMove){
  standardImages = []
  for (let i = 0 ; i < images.length ; i++){
    if (images[i].StorageClass === 'STANDARD'){
      standardImages.push(images[i])
    }
  }

  standardImages.sort(function(a, b) {
    var keyA = new Date(a.LastModified),
      keyB = new Date(b.LastModified);
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  for (let i = 0 ; i < numOfImagesToMove ; i++){
    let params = s3.changeClassParams;
    params.CopySource = ("/" + params.Bucket + "/" + standardImages[i].Key);
    params.Key = standardImages[i].Key;
    params.StorageClass = 'STANDARD_IA';

    s3Client.copyObject(params, (err, data)=>{
      if (err)
        console.log(err, err.stack);
      else
        console.log(`succesfully moved image ${params.Key} to STANDARD_IA class`);
    });
  }

}