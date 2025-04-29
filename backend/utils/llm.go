package utils

import (
	"OpenHouse/global"
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"
)

// LLMRequest 请求结构体
type LLMRequest struct {
	Model  string
	Prompt string
}

// ParseTags 将 JSON 格式的 tags 转换为 string slice
func ParseTags(jsonBytes []byte) []string {
	var tags []string
	_ = json.Unmarshal(jsonBytes, &tags)
	return tags
}

// CommonTags 计算两个用户的共同标签
func CommonTags(tagsABytes, tagsBBytes []byte) []string {
	var tagsA, tagsB []string
	_ = json.Unmarshal(tagsABytes, &tagsA)
	_ = json.Unmarshal(tagsBBytes, &tagsB)

	set := make(map[string]bool)
	for _, tag := range tagsA {
		set[tag] = true
	}

	var common []string
	for _, tag := range tagsB {
		if set[tag] {
			common = append(common, tag)
		}
	}
	return common
}

// CallLLM 调用大模型接口（默认对接 OpenAI GPT-4 或 Together）
func CallLLM(req LLMRequest) (string, error) {
	apiKey := global.VP.GetString("openai.api_key")
	endpoint := "https://api.openai.com/v1/chat/completions"

	payload := map[string]interface{}{
		"model": req.Model, // 如 "gpt-4" 或 "gpt-3.5-turbo"
		"messages": []map[string]string{
			{"role": "system", "content": "你是一个科研配对助手，专注于帮助研究者智能匹配合作伙伴。"},
			{"role": "user", "content": req.Prompt},
		},
		"temperature": 0.5,
		"max_tokens":  512,
	}

	bodyBytes, _ := json.Marshal(payload)
	httpReq, _ := http.NewRequest("POST", endpoint, bytes.NewBuffer(bodyBytes))
	httpReq.Header.Set("Authorization", "Bearer "+apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		raw, _ := io.ReadAll(resp.Body)
		return "", errors.New("调用 LLM 接口失败：" + string(raw))
	}

	var res struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", err
	}
	if len(res.Choices) == 0 {
		return "", errors.New("LLM 无返回结果")
	}
	return strings.TrimSpace(res.Choices[0].Message.Content), nil
}
