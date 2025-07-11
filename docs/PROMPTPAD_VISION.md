# PromptPad Vision

PromptPad is the conceptual front-end for interacting with LogLine workflows. It unifies command execution, log viewing, and AI assistance in a single interface.

This interface is powered by the `ui_runtime/` engine, which renders `.logline` contracts directly in the browser.
The `gateway/` module provides a universal entry point for all tenants.

**Key concepts**

1. **Unified Input** – one text box accepts both natural language queries and workflow commands.
2. **Live Timeline** – workflow execution produces a real-time stream of spans visualised chronologically.
3. **AI Co-pilot** – an LLM watches interactions and can suggest fixes or explain errors.
4. **Replay** – previously recorded spans can be replayed step by step for auditing.
5. **Low Friction** – writing, running and debugging happen in the same place.

