import AWS from 'aws-sdk';

// إعداد بيانات AWS - متوافق مع DigitalOcean Environment Variables
// استخدام ACCESS_KEY و SECRET_ACCESS_KEY للتوافق مع DigitalOcean
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY || process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
});

const s3 = new AWS.S3();

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  const bucketName = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME || 'sabq-ai-cms-images';
  
  const params = {
    Bucket: bucketName,
    Key: fileName, // استخدام اسم الملف مباشرة لأنه يحتوي على المجلد
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL تم إزالتها - سيتم استخدام bucket policy بدلاً منها
  };

  try {
    const data = await s3.upload(params).promise();
    console.log('✅ Uploaded successfully:', data.Location);
    return data.Location;
  } catch (error) {
    console.error('❌ Error uploading to S3:', error);
    throw new Error('S3 upload failed');
  }
};

// دالة لحذف الصور من S3
export const deleteFromS3 = async (fileUrl: string): Promise<boolean> => {
  try {
    // استخراج key من URL
    const urlParts = fileUrl.split('/');
    const key = urlParts.slice(3).join('/'); // يحذف https://bucket.s3.region.amazonaws.com/
    const bucketName = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME || 'sabq-ai-cms-images';

    const params = {
      Bucket: bucketName,
      Key: key
    };

    await s3.deleteObject(params).promise();
    console.log('✅ Deleted successfully:', key);
    return true;
  } catch (error) {
    console.error('❌ Error deleting from S3:', error);
    return false;
  }
};

// دالة للحصول على URL موقع مؤقت للرفع
export const getSignedUploadUrl = async (fileName: string, mimeType: string): Promise<string> => {
  const bucketName = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME || 'sabq-ai-cms-images';
  
  const params = {
    Bucket: bucketName,
    Key: fileName,
    ContentType: mimeType,
    // ACL تم إزالتها - سيتم استخدام bucket policy بدلاً منها
    Expires: 3600 // ساعة واحدة
  };

  try {
    const signedUrl = await s3.getSignedUrlPromise('putObject', params);
    return signedUrl;
  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
};

export default s3;
