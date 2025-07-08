package runtime

import (
	"testing"

	"motorcodex/parser"
	"motorcodex/plugin"
)

type echoPlugin struct{}

func (e *echoPlugin) Execute(method string, args ...interface{}) (interface{}, error) {
	return method, nil
}

func TestEvalPlugin(t *testing.T) {
	plugin.Register("echo", &echoPlugin{})
	b := &parser.Block{Type: "text", Props: map[string]string{"content": "{{echo.say()}}"}}
	env := Env{}
	Run([]*parser.Block{b}, env, nil)
}

func TestWhenCondition(t *testing.T) {
	b := &parser.Block{Type: "text", Props: map[string]string{"content": "hi", "when": "flag"}}
	env := Env{"flag": false}
	Run([]*parser.Block{b}, env, nil)
}

func TestLoop(t *testing.T) {
	b := &parser.Block{Type: "loop", Props: map[string]string{"for": "list"}, Children: []*parser.Block{
		{Type: "text", Props: map[string]string{"content": "Item: {{item}}"}},
	}}
	env := Env{"list": []interface{}{"x", "y"}}
	Run([]*parser.Block{b}, env, nil)
}
