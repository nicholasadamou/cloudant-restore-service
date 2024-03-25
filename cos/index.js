const dotenv = require('dotenv')
const ibm = require('ibm-cos-sdk')

dotenv.config()

const environments = process.env

class COSService {
  constructor() {
    this.bucketName = environments.COS_BUCKET_NAME || ''
    this.initializeCOSClient()
  }

  initializeCOSClient() {
    try {
      this.cos = this.buildCOSClient()
    } catch (error) {
      this.handleError('COS Client Initialization Error', error.message)
    }
  }

  buildCOSClient() {
    const config = {
      endpoint: environments.COS_ENDPOINT || '',
      apiKeyId: environments.COS_API_KEY || '',
      ibmAuthEndpoint: 'https://iam.cloud.ibm.com/identity/token',
      serviceInstanceId: environments.COS_INSTANCE_ID || '',
    }

    return new ibm.S3(config)
  }

  handleError(errorCode, errorMessage) {
    console.error(`${errorCode}: ${errorMessage}`)
    throw new Error(errorMessage)
  }

  async isBucketAccessible() {
    try {
      await this.cos.headBucket({ Bucket: this.bucketName }).promise()
      return true
    } catch (error) {
      this.handleError(
        `Error accessing bucket`,
        `${error.code} - ${error.message}`,
      )
      return false
    }
  }

  async pullFromS3(db) {
    console.log(`Downloading backup from S3: ${db}`)

    if (!(await this.doesBucketExist(this.bucketName))) {
      this.handleError(
        `Bucket ${this.bucketName} does not exist. Cannot check if ${db} exists.`,
        'Bucket does not exist',
      )
    }

    if (!(await this.isBucketAccessible())) {
      this.handleError(
        `Bucket ${this.bucketName} is not accessible. Cannot upload backup.`,
        'Bucket not accessible',
      )
    }

    const params = {
      Bucket: this.bucketName,
      Key: db,
    }

    try {
      const head = await this.cos.headObject(params).promise()
      const total = head.ContentLength
      let loaded = 0

      const dataStream = this.cos.getObject(params).createReadStream()

      dataStream.on('data', (chunk) => {
        loaded += chunk.length
        const percent = Math.round((loaded / total) * 100)

        console.log(`Downloading ${percent}%`)
      })

      dataStream.on('error', (error) => {
        this.handleError('Download Error', error.message)
      })

      dataStream.on('end', () => {
        console.log(`Backup downloaded from S3: ${db}`)
      })

      return dataStream
    } catch (error) {
      this.handleError('Download Error', error.message)
    }
  }

  async doesBucketExist(bucketName) {
    try {
      await this.cos.headBucket({ Bucket: bucketName }).promise()
      return true
    } catch (error) {
      if (error.code === 'NotFound') {
        return false
      }

      this.handleError('Bucket Existence Error', error.message)
    }
  }

  async doesDatabaseExist(db) {
    if (!(await this.doesBucketExist(this.bucketName))) {
      this.handleError(
        `Bucket ${this.bucketName} does not exist. Cannot check if ${db} exists.`,
        'Bucket does not exist',
      )
    }

    if (!(await this.isBucketAccessible())) {
      this.handleError(
        `Bucket ${this.bucketName} is not accessible.`,
        'Bucket not accessible',
      )
    }

    try {
      await this.cos.headObject({ Bucket: this.bucketName, Key: db }).promise()
      return true
    } catch (error) {
      if (error.code === 'NotFound') {
        return false
      }

      this.handleError('Database Existence Error', error.message)
    }
  }
}

module.exports = COSService
