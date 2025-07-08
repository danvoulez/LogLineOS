package plugin

import "fmt"

// Plugin defines a simple interface executed via the `execute` expression.
type Plugin interface {
	Execute(method string, args ...interface{}) (interface{}, error)
}

var registry = map[string]Plugin{}

// Register adds a plugin to the registry.
func Register(name string, p Plugin) {
	registry[name] = p
}

// Get retrieves a plugin by name.
func Get(name string) (Plugin, error) {
	p, ok := registry[name]
	if !ok {
		return nil, fmt.Errorf("plugin not found: %s", name)
	}
	return p, nil
}
