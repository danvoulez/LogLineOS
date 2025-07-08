package runtime

import (
	"fmt"
	"regexp"
	"strings"

	"motorcodex/parser"
	"motorcodex/plugin"
	"motorcodex/tracer"
)

// Env holds variables available for expression evaluation.
type Env map[string]interface{}

// Run executes the list of blocks using the environment and prints output.
func Run(blocks []*parser.Block, env Env, c *tracer.Chronicler) {
	for _, b := range blocks {
		execute(b, env, c)
	}
}

func execute(b *parser.Block, env Env, c *tracer.Chronicler) {
	if cond, ok := b.Props["when"]; ok {
		val, err := evalExpr(cond, env)
		if err != nil {
			return
		}
		if bv, ok := val.(bool); ok && !bv {
			return
		}
	}

	switch b.Type {
	case "text":
		if val, ok := b.Props["content"]; ok {
			out := eval(val, env)
			fmt.Println(out)
			if c != nil {
				c.Record("runtime", "print", out, "success", nil)
			}
		}
	case "markdown":
		if val, ok := b.Props["content"]; ok {
			out := eval(val, env)
			fmt.Println(out)
			if c != nil {
				c.Record("runtime", "print", out, "success", nil)
			}
		}
	case "container":
		for _, child := range b.Children {
			execute(child, env, c)
		}
	case "when":
		cond := b.Props["condition"]
		val, err := evalExpr(cond, env)
		if err != nil {
			return
		}
		if bv, ok := val.(bool); ok && bv {
			for _, child := range b.Children {
				execute(child, env, c)
			}
		}
	case "loop":
		key := b.Props["for"]
		if key == "" {
			key = b.Props["items"]
		}
		listVal, ok := env[key].([]interface{})
		if !ok {
			return
		}
		for _, item := range listVal {
			env["item"] = item
			for _, child := range b.Children {
				execute(child, env, c)
			}
		}
	case "input":
		msg := b.Props["label"]
		if msg == "" {
			msg = "input"
		}
		fmt.Println("[input] " + msg)
	case "button":
		lbl := b.Props["label"]
		if lbl == "" {
			lbl = "button"
		}
		fmt.Println("[button] " + lbl)
	case "image":
		src := b.Props["src"]
		fmt.Println("[image] " + eval(src, env))
	default:
		for _, child := range b.Children {
			execute(child, env, c)
		}
	}
}

var exprPattern = regexp.MustCompile(`{{\s*([^{}]+)\s*}}`)
var callPattern = regexp.MustCompile(`^([a-z_]+)\.([a-z_]+)\((.*)\)$`)

func eval(val string, env Env) string {
	return exprPattern.ReplaceAllStringFunc(val, func(m string) string {
		expr := exprPattern.FindStringSubmatch(m)[1]
		result, err := evalExpr(expr, env)
		if err != nil {
			return fmt.Sprintf("<err:%v>", err)
		}
		return fmt.Sprint(result)
	})
}

func evalExpr(expr string, env Env) (interface{}, error) {
	if m := callPattern.FindStringSubmatch(expr); len(m) == 4 {
		pluginName := m[1]
		method := m[2]
		argStr := strings.TrimSpace(m[3])
		var args []interface{}
		if argStr != "" {
			parts := strings.Split(argStr, ",")
			for _, p := range parts {
				p = strings.TrimSpace(p)
				if strings.HasPrefix(p, "\"") && strings.HasSuffix(p, "\"") {
					args = append(args, strings.Trim(p, "\""))
				} else {
					args = append(args, env[p])
				}
			}
		}
		plg, err := plugin.Get(pluginName)
		if err != nil {
			return nil, err
		}
		return plg.Execute(method, args...)
	}
	if v, ok := env[expr]; ok {
		return v, nil
	}
	return nil, fmt.Errorf("unknown expression: %s", expr)
}
