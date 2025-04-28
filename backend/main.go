package main

import (
	"OpenHouse/global"
	"OpenHouse/initialize"
	"log"

	"github.com/gin-gonic/gin"
)

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
// @description JWT Token
func main() {
	log.Println("Start Backend Service...")
	initialize.InitViper()

	initialize.InitMySQL()
	defer initialize.CloseMySQL()

	initialize.InitMedia()
	// initialize.InitElasticSearch()

	r := gin.Default()
	initialize.SetupRouter(r)
	if err := r.Run(":" + global.VP.GetString("port")); err != nil {
		panic(err)
	}
}
