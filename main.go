package main

import (
	"context"
	"fmt"
	"github.com/bougou/go-ipmi"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

var client, ctx = initClient()
var temperature float64
var maxTemp float64
var isManualRPM = false

func initClient() (*ipmi.Client, context.Context) {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}

	host := os.Getenv("KEVIN_IP")
	portString := os.Getenv("KEVIN_PORT")
	var port int
	if portString == "" {
		port = 623
	} else {
		port, _ = strconv.Atoi(portString)
	}
	username := os.Getenv("KEVIN_USER")
	password := os.Getenv("KEVIN_PASSWORD")
	ctx := context.Background()

	for {
		client, err := ipmi.NewClient(host, port, username, password)
		if err != nil {
			fmt.Println(err)
			time.Sleep(5 * time.Second)
			continue
		}
		if err := client.Connect(ctx); err != nil {
			fmt.Println(err)
			time.Sleep(5 * time.Second)
			continue
		}

		return client, ctx
	}

}

func main() {
	go temp()

	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("./static", true)))

	r.GET("/status", func(c *gin.Context) {
		status, err := client.GetChassisStatus(ctx)
		if err != nil {
			c.AbortWithStatus(500)
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":      status,
			"temperature": temperature,
			"maxTemp":     maxTemp,
		})
	})

	r.GET("/start", func(c *gin.Context) {
		_, err := client.ChassisControl(ctx, ipmi.ChassisControlPowerUp)
		if err != nil {
			return
		}
		c.Redirect(http.StatusPermanentRedirect, "/status")
	})

	r.GET("/stop", func(c *gin.Context) {
		_, err := client.ChassisControl(ctx, ipmi.ChassisControlPowerDown)
		if err != nil {
			return
		}
		c.Redirect(http.StatusPermanentRedirect, "/status")
	})
	err := r.Run()
	if err != nil {
		return
	}
}

func temp() {
	_, _ = client.RawCommand(ctx, ipmi.NetFnOEMSupermicroRequest, 0x30, []byte{0x01, 0x01}, "Set automatic fan RPM")
	defer client.RawCommand(ctx, ipmi.NetFnOEMSupermicroRequest, 0x30, []byte{0x01, 0x01}, "Set automatic fan RPM")

	maxTemp, _ = strconv.ParseFloat(os.Getenv("MAX_TEMP"), 8)
	fanRPM, _ := strconv.Atoi(os.Getenv("FAN_RPM"))

	for {
		rs, err := client.GetSDREnhanced(ctx, 0x82)
		if err != nil {
			fmt.Println(err)
			continue
		}
		temperature = rs.Full.SensorValue

		if temperature < maxTemp {
			if !isManualRPM {
				_, _ = client.RawCommand(ctx, ipmi.NetFnOEMSupermicroRequest, 0x30, []byte{0x01, 0x00}, "Set manual fan RPM")
				_, _ = client.RawCommand(ctx, ipmi.NetFnOEMSupermicroRequest, 0x30, []byte{0x02, 0xff, byte(fanRPM)}, "Set fan RPM to 5%")
				isManualRPM = true
			}
		} else if isManualRPM {
			_, _ = client.RawCommand(ctx, ipmi.NetFnOEMSupermicroRequest, 0x30, []byte{0x01, 0x01}, "Set automatic fan RPM")
			isManualRPM = false
		}

		time.Sleep(10 * time.Second)
	}

}
