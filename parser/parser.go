package parser

import (
	"io"

	yaml "gopkg.in/yaml.v3"
)

// Block represents a parsed block in a LogLine file.
type Block struct {
	Type     string            `yaml:"type"`
	Props    map[string]string `yaml:"-"`
	Children []*Block          `yaml:"children"`

	raw map[string]interface{}
}

// Parse reads YAML-like LogLine content from r and returns the blocks.
func Parse(r io.Reader) ([]*Block, error) {
	var nodes []map[string]interface{}
	dec := yaml.NewDecoder(r)
	if err := dec.Decode(&nodes); err != nil {
		return nil, err
	}
	var res []*Block
	for _, n := range nodes {
		b := convert(n)
		res = append(res, b)
	}
	return res, nil
}

func convert(m map[string]interface{}) *Block {
	b := &Block{Props: make(map[string]string)}
	for k, v := range m {
		switch k {
		case "type":
			if s, ok := v.(string); ok {
				b.Type = s
			}
		case "children":
			if arr, ok := v.([]interface{}); ok {
				for _, child := range arr {
					if cm, ok := child.(map[string]interface{}); ok {
						b.Children = append(b.Children, convert(cm))
					}
				}
			}
		default:
			if s, ok := toString(v); ok {
				b.Props[k] = s
			}
		}
	}
	return b
}

func toString(v interface{}) (string, bool) {
	switch t := v.(type) {
	case string:
		return t, true
	case int, int64, float64, bool:
		return yamlNewEncoderString(t), true
	default:
		return "", false
	}
}

func yamlNewEncoderString(v interface{}) string {
	b, _ := yaml.Marshal(v)
	return string(b)
}
