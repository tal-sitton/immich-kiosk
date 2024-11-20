package routes

import (
	"net/http"
	"os"

	"github.com/charmbracelet/log"
	"github.com/labstack/echo/v4"

	"github.com/damongolding/immich-kiosk/config"
	"github.com/damongolding/immich-kiosk/utils"
	"github.com/damongolding/immich-kiosk/views"
	"github.com/damongolding/immich-kiosk/weather"
)

// Home home endpoint
func Home(baseConfig *config.Config) echo.HandlerFunc {
	return func(c echo.Context) error {

		requestData, err := InitializeRequestData(c, baseConfig)
		if err != nil {
			return err
		}

		requestConfig := requestData.RequestConfig
		requestID := requestData.RequestID

		log.Debug(
			requestID,
			"method", c.Request().Method,
			"path", c.Request().URL.String(),
			"requestConfig", requestConfig.String(),
		)

		var customCss []byte

		if utils.FileExists("./custom.css") {
			customCss, err = os.ReadFile("./custom.css")
			if err != nil {
				log.Error("reading custom css", "err", err)
			}
		}

		if !c.QueryParams().Has("weather") && requestConfig.HasWeatherDefault {
			c.QueryParams().Add("weather", weather.DefaultLocation)
		}

		viewData := views.ViewData{
			KioskVersion: KioskVersion,
			DeviceID:     utils.GenerateUUID(),
			Queries:      c.QueryParams(),
			CustomCss:    customCss,
			Config:       requestConfig,
		}

		return Render(c, http.StatusOK, views.Home(viewData))
	}
}
