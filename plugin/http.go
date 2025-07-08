package plugin

import (
	"errors"
	"io"
	"net/http"
)

type HTTPPlugin struct{}

func (p *HTTPPlugin) Execute(method string, args ...interface{}) (interface{}, error) {
	switch method {
	case "get":
		if len(args) < 1 {
			return nil, errors.New("http.get requires URL argument")
		}
		url, ok := args[0].(string)
		if !ok {
			return nil, errors.New("http.get requires URL string")
		}
		resp, err := http.Get(url)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		return string(body), nil
	default:
		return nil, errors.New("unknown http method")
	}
}
