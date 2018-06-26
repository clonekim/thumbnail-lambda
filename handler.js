'use strict';

const gm = require('gm').subClass({imageMagick: true });
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucket = process.env['BUCKET'] || 'your default bucket name' ;

module.exports.app = (event, context, callback) => {

  let path = event.path.substring(1);
  let size = event.pathParameters['size']||[]; 
  let filename = event.pathParameters['filename'].trim();
  size = size.split('x');

  let redirectHeader = {
    statusCode: 302,
    headers: {Location: `https://s3.ap-northeast-2.amazonaws.com/${bucket}/${path}`}
  }


  new Promise((resolve, reject) => {
    
    s3.getObject({
      Bucket: bucket,
      Key: path
    }, (err, data) => {

      if(err) {
        console.log('requested file is not found from bucket -', filename);

        s3.getObject({
          Bucket: bucket,
          Key: filename
        }, (err, data) => {

          if(err)
            reject(err)
          else
            resolve(data)
        })
        
      } else {
        callback(null, redirectHeader)
      }

    });

  })
    .then(data => {
      
      console.log('create thumbnail - step1');

      return new Promise((resolve, reject) => {        
        let mimeType = data.ContentType.split('/')[1];

        gm(data.Body)
          .thumbnail(size[0], size[1])
          .toBuffer(mimeType, (err, buffer) => {
            if(err)
              reject(err)
            else
              resolve({buffer: buffer, mimeType: mimeType})
          })

      });

    })
    .then(result => {
      console.log('create thumbnail - step2');
      return new Promise((resolve, reject) => {

        s3.putObject({
          Bucket: bucket,
          Key: path,
          Body:  result.buffer,
          ContentType: 'image/' + result.mimeType
        }, (err, data) => {
          if(err)
            reject(err)
          else
            callback(null, redirectHeader)
          
        })

      })      
      
      
    })
    .catch(err => {
      callback(null, {
        statusCode: 500,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(err)
      });

    })
  
  
};
