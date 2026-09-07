package templates

import (
	"kak-to/models"
	"kak-to/db"
)

func SeedTemplates() {
	var count int64
	db.DB.Model(&models.PosterTemplate{}).Count(&count)
	if count > 0 {
		return
	}

	base := []models.PosterTemplate{
		{Name: "Sale -50%", Format: "A4", Scene: `{"v":1,"bg":"#ff3b30","blocks":[{"t":"text","x":60,"y":80,"w":600,"h":120,"text":"SALE -50%","size":96},{"t":"text","x":60,"y":240,"w":600,"h":60,"text":"Only this weekend","size":40}]}`},
		{Name: "Grand opening", Format: "1080x1080", Scene: `{"v":1,"bg":"#111111","blocks":[{"t":"text","x":60,"y":120,"w":600,"h":120,"text":"GRAND OPENING","size":72},{"t":"text","x":60,"y":260,"w":600,"h":60,"text":"We are open! Come in.","size":36}]}`},
		{Name: "Coffee promo", Format: "1080x1920", Scene: `{"v":1,"bg":"#f5efe4","blocks":[{"t":"text","x":60,"y":160,"w":600,"h":120,"text":"Fresh coffee","size":80},{"t":"text","x":60,"y":300,"w":600,"h":60,"text":"Every morning 8:00-12:00","size":32}]}`},
		{Name: "New collection", Format: "1920x1080", Scene: `{"v":1,"bg":"#ffffff","blocks":[{"t":"text","x":80,"y":120,"w":800,"h":120,"text":"NEW COLLECTION","size":88},{"t":"text","x":80,"y":260,"w":800,"h":60,"text":"Spring 2026 drop","size":40}]}`},
	}

	for _, tpl := range base {
		db.DB.Create(&tpl)
	}
}
