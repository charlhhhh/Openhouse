package initialize

import (
	"OpenHouse/global"
)

func InitMedia() {
	// Initialize OSS configuration with Viper

	ossConfig := struct {
		Endpoint        string `mapstructure:"endpoint"`
		AccessKeyID     string `mapstructure:"access_key_id"`
		AccessKeySecret string `mapstructure:"access_key_secret"`
		Bucket          string `mapstructure:"bucket"`
		Dir             string `mapstructure:"dir"`
	}{}
	if err := global.VP.UnmarshalKey("oss", &ossConfig); err != nil {
		panic(err)
	}
	global.OSSConfig.Endpoint = ossConfig.Endpoint
	global.OSSConfig.AccessKeyID = ossConfig.AccessKeyID
	global.OSSConfig.AccessKeySecret = ossConfig.AccessKeySecret
	global.OSSConfig.Bucket = ossConfig.Bucket
	global.OSSConfig.Dir = ossConfig.Dir
}
