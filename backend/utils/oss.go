package utils

import (
	"OpenHouse/global"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
)

// UploadToOSS 上传文件到 OSS 并返回 URL
func UploadToOSS(reader io.Reader, filename string) (string, error) {
	client, err := oss.New(global.OSSConfig.Endpoint, global.OSSConfig.AccessKeyID, global.OSSConfig.AccessKeySecret)
	if err != nil {
		return "", err
	}

	bucket, err := client.Bucket(global.OSSConfig.Bucket)
	if err != nil {
		return "", err
	}

	ext := filepath.Ext(filename)
	objectKey := fmt.Sprintf("%s%d%s", global.OSSConfig.Dir, time.Now().UnixNano(), ext)

	err = bucket.PutObject(objectKey, reader)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("https://%s.%s/%s", global.OSSConfig.Bucket, global.OSSConfig.Endpoint, objectKey)
	return url, nil
}
