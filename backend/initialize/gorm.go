package initialize

import (
	"OpenHouse/model/database"
	"fmt"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"

	"OpenHouse/global"
)

func InitMySQL() {
	// 配置数据
	addr := global.VP.GetString("db.addr")
	port := global.VP.GetString("db.port")
	user := global.VP.GetString("db.user")
	password := global.VP.GetString("db.password")
	dbname := global.VP.GetString("db.dbname")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, password, addr, port, dbname)
	// 连接数据库
	var err error
	global.DB, err = gorm.Open("mysql", dsn)
	if err != nil {
		panic(fmt.Errorf("数据库出问题啦: %s \n", err))
	}
	// 迁移
	global.DB.AutoMigrate(
		&database.User{},
		&database.AuthAccount{},
		&database.VerifyCode{},
		&database.Post{},
		&database.PostComment{},
		&database.UserPostLike{},
		&database.UserFollow{},
		&database.UserPostFavorite{},
		&database.CommentLike{},
	)
	// 检查数据库连接是否存在, 好像没啥用
	err = global.DB.DB().Ping()
	if err != nil {
		panic(fmt.Errorf("数据库出问题啦: %s", err))
	}
}

func CloseMySQL() {
	err := global.DB.Close()
	if err != nil {
		panic(fmt.Errorf("数据库出问题啦: %s", err))
	}
}
