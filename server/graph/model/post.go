package model

type Post struct {
	ID           string `json:"id"`
	Userid       string `json:"userid"`
	Username     string `json:"username"`
	Date         string `json:"date"`
	Text         string `json:"text"`
	Privacy      string `json:"privacy"`
	Commentcount int    `json:"commentcount"`
	Likecount    int    `json:"likecount"`
}
