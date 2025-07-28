import AWS from 'aws-sdk';

// إعداد بيانات AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIA5ODCY47IRLKNVZ7H',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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',
  region: process.env.AWS_REGION || 'us-east-1', // تأكد من تطابق المنطقة
});

const s3 = new AWS.S3();

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  const params = {
    Bucket: process.env.S3_BUCKET || 'sabq-uploader',
    Key: `uploads/${Date.now()}-${fileName}`, // يحفظ الصور داخل مجلد uploads مع توقيت
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'public-read', // يجعل الصورة متاحة عبر URL
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

    const params = {
      Bucket: process.env.S3_BUCKET || 'sabq-uploader',
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
  const params = {
    Bucket: process.env.S3_BUCKET || 'sabq-uploader',
    Key: `uploads/${Date.now()}-${fileName}`,
    ContentType: mimeType,
    ACL: 'public-read',
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
