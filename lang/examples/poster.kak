package main

const Brand = "#ff3366"

fn main() {
    var* title = "SALE -50%"
    output("Building poster: ", title)

    poster "Promo" 794 x 1123 {
        background: #ffffff;
        page {
            text "SALE -50%" {
                color: #ff3366;
                font-size: 48px;
                x: 100;
                y: 200;
            }
            box {
                width: 200px;
                height: 100px;
                background: #000000;
                x: 10;
                y: 20;
            }
            image "logo.png" {
                x: 0;
                y: 0;
                width: 100px;
                height: 100px;
            }
        }
    }
}

return 0
