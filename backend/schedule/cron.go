package schedule

import (
	"OpenHouse/service"
	"log"
	"time"

	"github.com/robfig/cron/v3"
)

// StartCronJobs 启动定时任务
func StartCronJobs() {
	c := cron.New(cron.WithSeconds()) // 支持秒级调度

	// 每天10:00 AM执行一次匹配任务
	_, err := c.AddFunc("0 0 10 * * *", func() {
		log.Println("[Cron] 开始每日匹配任务:", time.Now().Format("2006-01-02 15:04:05"))
		if err := service.TriggerDailyMatch(); err != nil {
			log.Println("[Cron] 每日匹配失败:", err)
		} else {
			log.Println("[Cron] 每日匹配成功！")
		}
	})

	if err != nil {
		log.Fatalln("添加定时任务失败:", err)
	}

	// 每天24:00 执行一次确认匹配任务
	_, err = c.AddFunc("0 0 0 * * *", func() {
		log.Println("[Cron] 开始确认匹配任务:", time.Now().Format("2006-01-02 15:04:05"))
		if err := service.TriggerDailyConfirm(); err != nil {
			log.Println("[Cron] 确认匹配失败:", err)
		} else {
			log.Println("[Cron] 确认匹配成功！")
		}
	})

	if err != nil {
		log.Fatalln("添加定时任务失败:", err)
	}

	c.Start()
	log.Println("[Cron] 定时任务启动完成")
}
